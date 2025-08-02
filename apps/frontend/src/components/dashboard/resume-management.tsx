import {getResumePresignedUrl, useDeleteResume, useGetResumes, useUploadResume} from "@/api/me/me.ts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {EditIcon, EyeIcon, FileTextIcon, LoaderIcon, TrashIcon, UploadIcon} from "lucide-react";
import type {ResumeDTO} from "@/api/models";
import {formatDate} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Dropzone, DropzoneContent, DropzoneEmptyState} from "@/components/ui/shadcn-io/dropzone";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useState} from "react";
import {Separator} from "@/components/ui/separator.tsx";

export default function ResumeManagement() {
    const {data, isLoading, refetch: refetchResumes} = useGetResumes();
    const [isEditing, setIsEditing] = useState(false);
    const uploadResumeMutation = useUploadResume();
    const deleteResumeMutation = useDeleteResume();


    async function handleViewResume(resumeId: number) {
        try {
            const response = await getResumePresignedUrl(resumeId);
            const url = response.data.presigned_url;
            if (url) window.open(url, "_blank");
        } catch (err) {
            console.error("Failed to get presigned URL:", err);
        }
    }

    async function handleDeleteResume(resumeId: number) {
        await deleteResumeMutation.mutateAsync({resumeId: resumeId});
        await refetchResumes();
    }

    async function handleUploadResume(name: string, resume: File) {
        await uploadResumeMutation.mutateAsync(
            {
                data: {
                    name: name,
                    file: resume
                }
            }
        );
        await refetchResumes();
    }

    const resumes = data?.data || []

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <LoaderIcon className="h-6 w-6 animate-spin"/>
                    <span className="ml-2">Loading resumes...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex gap-2 items-center">
                    <FileTextIcon/>
                    Resume Management
                </CardTitle>
                {
                    !isEditing && <Button onClick={() => setIsEditing(true)} variant="outline"><EditIcon/>Edit</Button>
                }

            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">


                    {
                        resumes.map((resume) => {
                            return (


                                <Resume
                                    key={resume.id}
                                    resume={resume}
                                    isEditing={isEditing}
                                    onDelete={() => handleDeleteResume(resume.id)}
                                    onView={() => handleViewResume(resume.id)}
                                />
                            );
                        })
                    }
                    {
                        isEditing &&
                        <>
                            <Separator className="my-2"/>
                            <UploadResume onUpload={handleUploadResume} isUploading={uploadResumeMutation.isPending}/>
                        </>

                    }

                </div>

            </CardContent>
            <CardFooter>
                {
                    isEditing && <Button variant="outline" onClick={() => setIsEditing(false)}>Done</Button>
                }
            </CardFooter>
        </Card>
    );
}

interface ResumeProps {
    resume: ResumeDTO;
    isEditing: boolean;
    onDelete: () => void;
    onView: () => void;
}

function Resume({resume, isEditing, onDelete, onView}: ResumeProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {resume.name}
                </CardTitle>
                <CardDescription>
                    Uploaded {formatDate(resume.created_at)}
                </CardDescription>
            </CardHeader>
            <CardFooter className="gap-1">
                <Button onClick={onView}><EyeIcon/>View</Button>
                {
                    isEditing && <Button onClick={onDelete} variant="destructive" size="icon"><TrashIcon/></Button>
                }
            </CardFooter>
        </Card>
    )
}

interface UploadResumeProps {
    onUpload: (name: string, resume: File) => void;
    isUploading: boolean;
}

function UploadResume({onUpload, isUploading}: UploadResumeProps) {
    const [name, setName] = useState("");
    const [file, setFile] = useState<null | File>(null);

    function handleDrop(files: File[]) {
        setFile(files[0]);
    }

    return (
        <Card>
            <CardContent className="flex flex-col gap-2">
                <Label>Resume Name</Label>
                <Input placeholder="e.g., Software Engineer Resume" className="max-w-sm" value={name}
                       onChange={(e) => setName(e.target.value)}/>
                <Label>Resume PDF</Label>
                <Dropzone
                    accept={{'application/pdf': []}}
                    maxFiles={1}
                    maxSize={1024 * 1024 * 10}
                    minSize={1024}
                    onDrop={handleDrop}
                    onError={console.error}
                    src={file ? [file] : undefined}
                >
                    <DropzoneEmptyState/>
                    <DropzoneContent/>
                </Dropzone>
            </CardContent>
            <CardFooter className="gap-2">
                <Button
                    disabled={isUploading || !name || !file}
                    onClick={() => onUpload(name, file!)}
                ><UploadIcon/>{isUploading ? "Uploading..." : "Upload Resume"}</Button>
            </CardFooter>
        </Card>
    )
}