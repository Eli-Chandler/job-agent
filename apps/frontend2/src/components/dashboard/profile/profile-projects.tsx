import {useAddProject, useDeleteProject, useGetProfile, useUpdateProject} from "@/api/profiles/profiles.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import type {CreateProjectRequest, ProfileProjectDTO, UpdateProjectRequest} from "@/api/models";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {CodeIcon, EditIcon, LinkIcon, LoaderIcon, PlusIcon, SaveIcon, TrashIcon, XIcon} from "lucide-react";

export default function ProfileProjects() {
    const {data: profileData, isLoading, refetch} = useGetProfile();
    const addProjectMutation = useAddProject({
        mutation: { onSuccess: () => refetch() }
    });
    const updateProjectMutation = useUpdateProject({
        mutation: { onSuccess: () => refetch() }
    });
    const deleteProjectMutation = useDeleteProject({
        mutation: { onSuccess: () => refetch() }
    });

    const projects = profileData?.data.projects;

    const [isEditing, setIsEditing] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);

    function reset() {
        setIsEditing(false);
        setIsAddingNew(false);
    }

    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <div className="flex justify-between">
                    <div>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>Showcase notable projects and repositories.</CardDescription>
                    </div>
                    {
                        projects && projects.length > 0 && (
                            !isEditing ?
                                <Button size="icon" onClick={() => setIsEditing(true)}><EditIcon/></Button>
                                :
                                <Button size="icon" variant="secondary" onClick={() => setIsEditing(false)}><XIcon/></Button>
                        )
                    }
                </div>
            </CardHeader>
            <CardContent>
                {
                    isLoading || deleteProjectMutation.isPending || updateProjectMutation.isPending || addProjectMutation.isPending ?
                        <Skeleton className="h-40"/>
                        :
                        projects && projects.length > 0 ?
                            <div className="flex flex-col gap-4">
                                {projects.map(project => (
                                    <Project
                                        key={project.id}
                                        project={project}
                                        isEditing={isEditing}
                                        onUpdate={(request) => {
                                            updateProjectMutation.mutate({ projectId: project.id, data: request });
                                            reset();
                                        }}
                                        onDelete={() => {
                                            deleteProjectMutation.mutate({ projectId: project.id });
                                            reset();
                                        }}
                                    />
                                ))}
                            </div>
                            :
                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <CodeIcon/>
                                <p>No projects added yet.</p>
                            </div>
                }
            </CardContent>
            <CardFooter>
                {
                    !isAddingNew ?
                        <Button onClick={() => setIsAddingNew(true)}><PlusIcon/>Add Project</Button>
                        :
                        <NewProject
                            onSave={(request: CreateProjectRequest) => {
                                reset();
                                addProjectMutation.mutate({data: request});
                                setIsAddingNew(false);
                            }}
                            onCancel={() => setIsAddingNew(false)}
                            isLoading={addProjectMutation.isPending}
                        />
                }
            </CardFooter>
        </Card>
    );
}

interface ProjectProps {
    project: ProfileProjectDTO;
    isEditing: boolean;
    onUpdate: (update: UpdateProjectRequest) => void;
    onDelete: () => void;
}

function Project({project, isEditing, onUpdate, onDelete}: ProjectProps) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
    const [url, setUrl] = useState(project.url || "");

    useEffect(() => {
        setName(project.name);
        setDescription(project.description || "");
        setUrl(project.url || "");
    }, [isEditing, project]);

    const canSave =
        name.trim() !== "" &&
        description.trim() !== "" &&
        (name !== project.name ||
            description !== (project.description || "") ||
            url !== (project.url || ""));

    if (isEditing) {
        return (
            <div className="p-4 border rounded-lg space-y-3">
                <div>
                    <Label className="text-sm font-medium">Project Name</Label>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="My Awesome Project"
                    />
                </div>
                <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="What it does, your role, stack..."
                        rows={3}
                    />
                </div>
                <div>
                    <Label className="text-sm font-medium">URL (Optional)</Label>
                    <Input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://github.com/user/repo"
                    />
                </div>
                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        disabled={!canSave}
                        onClick={() => onUpdate({
                            name: name.trim(),
                            description: description.trim(),
                            url: url.trim() || undefined
                        })}
                    >
                        <SaveIcon className="h-3 w-3 mr-1"/>
                        Save
                    </Button>
                    <Button size="sm" variant="destructive" onClick={onDelete}>
                        <TrashIcon className="h-3 w-3 mr-1"/>
                        Delete
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h4 className="font-medium text-lg">{project.name}</h4>
                    {project.url && (
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary inline-flex items-center gap-1"
                        >
                            <LinkIcon className="h-3 w-3"/> {project.url}
                        </a>
                    )}
                </div>
            </div>
            {project.description && (
                <p className="text-sm mt-3 text-muted-foreground whitespace-pre-line">{project.description}</p>
            )}
        </div>
    );
}

interface NewProjectProps {
    onSave: (request: CreateProjectRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function NewProject({onSave, onCancel, isLoading}: NewProjectProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");

    const handleSave = () => {
        onSave({
            name: name.trim(),
            description: description.trim(),
            url: url.trim() || undefined
        });
        setName("");
        setDescription("");
        setUrl("");
    };

    const canSave = name.trim() && description.trim();

    return (
        <div className="space-y-4 w-full">
            <div className="space-y-2">
                <Label htmlFor="new-project-name" className="text-sm font-medium">Project Name *</Label>
                <Input
                    id="new-project-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Job Agent"
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-project-description" className="text-sm font-medium">Description *</Label>
                <Textarea
                    id="new-project-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A web app to manage job applications..."
                    rows={3}
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-project-url" className="text-sm font-medium">URL</Label>
                <Input
                    id="new-project-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    disabled={isLoading}
                />
            </div>
            <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={handleSave} disabled={!canSave || isLoading}>
                    {isLoading ? (
                        <LoaderIcon className="h-3 w-3 animate-spin mr-1"/>
                    ) : (
                        <PlusIcon className="h-3 w-3 mr-1"/>
                    )}
                    Add Project
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
                    <XIcon className="h-3 w-3 mr-1"/>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

