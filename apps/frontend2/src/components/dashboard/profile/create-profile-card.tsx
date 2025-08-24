import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {getGetProfileQueryKey, useCreateProfile, useCreateProfileFromResume} from "@/api/profiles/profiles.ts";
import {useQueryClient} from "@tanstack/react-query";
import {Form} from "@/components/ui/form.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {InputFormField, TextAreaFormField} from "@/components/ui/form-field.tsx";
import {Dropzone, DropzoneContent, DropzoneEmptyState} from '@/components/ui/shadcn-io/dropzone';
import {useState} from 'react';
import {Loader2, SparklesIcon} from "lucide-react";

const CreateProfileRequestSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    contact_email: z.email("Invalid email address"),
    contact_phone: z.string().min(1, "Contact phone is required"),
    work_location: z.string().nullable().optional(),
    summary: z.string().nullable().optional()
});

export default function CreateProfileCard() {
    // Show a blocking overlay and disable all inputs while generating from resume
    const [isGenerating, setIsGenerating] = useState(false);

    return (
        <Card className="w-full relative overflow-hidden">
            {/* Loading overlay */}
            {isGenerating && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Generating profile from resume… This can take a bit.</p>
                </div>
            )}
            <CardHeader>
                <CardTitle>Create Profile</CardTitle>
                <CardDescription>
                    Please fill out the form below to create your profile.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <CreateProfileResumeUpload onLoadingChange={setIsGenerating} />
                <div className="flex items-center gap-5">
                    <Separator className="flex-1"/>
                    <p>OR</p>
                    <Separator className="flex-1"/>
                </div>
                <CreateProfileForm disabled={isGenerating} />
            </CardContent>
        </Card>
    )
}

function CreateProfileForm({ disabled }: { disabled?: boolean }) {
    const qc = useQueryClient();
    const createProfile = useCreateProfile({
        mutation: {
            onSuccess: () => qc.invalidateQueries({queryKey: getGetProfileQueryKey()})
        }
    });

    const form = useForm({
        resolver: zodResolver(CreateProfileRequestSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            contact_email: "",
            contact_phone: "",
            work_location: null,
            summary: null
        }
    });

    async function onSubmit(data: z.infer<typeof CreateProfileRequestSchema>) {
        createProfile.mutate({data});
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <fieldset disabled={disabled || createProfile.isPending} className="space-y-8">
                    <InputFormField
                        control={form.control}
                        name="first_name"
                        label="First Name"
                        placeholder="Enter your first name"
                    />
                    <InputFormField
                        control={form.control}
                        name="last_name"
                        label="Last Name"
                        placeholder="Enter your last name"
                    />
                    <InputFormField
                        control={form.control}
                        name="contact_email"
                        label="Contact Email"
                        placeholder="Enter your email"
                        type="email"
                    />
                    <InputFormField
                        control={form.control}
                        name="contact_phone"
                        label="Contact Phone"
                        placeholder="Enter your phone number"
                    />
                    <InputFormField
                        control={form.control}
                        name="work_location"
                        label="Work Location"
                        placeholder="Enter your work location (optional)"
                    />
                    <TextAreaFormField
                        control={form.control}
                        name="summary"
                        label="Summary"
                        placeholder="Enter a brief summary about yourself (optional)"
                    />
                </fieldset>
                <div className="flex justify-end">
                    <Button type="submit" disabled={disabled || createProfile.isPending}>
                        {createProfile.isPending ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Submitting…
                            </span>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function CreateProfileResumeUpload({ onLoadingChange }: { onLoadingChange?: (loading: boolean) => void }) {
    const qc = useQueryClient();
    const createProfileFromResumeMutation = useCreateProfileFromResume({
        mutation: {
            onMutate: () => onLoadingChange?.(true),
            onSettled: () => onLoadingChange?.(false),
            onSuccess: () => qc.invalidateQueries({ queryKey: getGetProfileQueryKey() })
        }
    })

    const [file, setFile] = useState<File | undefined>();

    function handleDrop(files: File[]) {
        setFile(files[0] || undefined);
    }

    function handleSubmit() {
        if (!file) return;

        createProfileFromResumeMutation.mutate({
            data: {
                file
            }
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <Dropzone
                accept={{'application/pdf': []}}
                maxFiles={1}
                maxSize={1024 * 1024 * 10}
                minSize={1024}
                onDrop={handleDrop}
                onError={console.error}
                src={file ? [file] : undefined}
                disabled={createProfileFromResumeMutation.isPending}
            >
                <DropzoneEmptyState>
                    <div className="flex flex-col items-center justify-center text-center">
                        <SparklesIcon/>
                        <p className="my-2 w-full truncate text-wrap font-medium text-sm">
                            Generate from resume
                        </p>
                        <p className="my-2 w-full truncate text-wrap font-medium text-sm">
                            Drag and drop or click to upload your resume (PDF only, max 10MB).
                        </p>
                    </div>
                </DropzoneEmptyState>
                <DropzoneContent/>
            </Dropzone>
            <div className="flex justify-end">
                <Button
                    disabled={!file || createProfileFromResumeMutation.isPending}
                    onClick={handleSubmit}
                    type="submit"
                >
                    {createProfileFromResumeMutation.isPending ? (
                        <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating…
                        </span>
                    ) : (
                        'Generate'
                    )}
                </Button>
            </div>
        </div>
    );
}