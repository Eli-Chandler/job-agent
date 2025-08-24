import {useAddSkill, useDeleteSkill, useGetProfile} from "@/api/profiles/profiles.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useState} from "react";
import type {CreateSkillRequest, ProfileSkillDTO} from "@/api/models";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {EditIcon, LoaderIcon, PlusIcon, TagsIcon, TrashIcon, XIcon} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";

export default function ProfileSkills() {
    const {data: profileData, isLoading, refetch} = useGetProfile();
    const addSkillMutation = useAddSkill({ mutation: { onSuccess: () => refetch() } });
    const deleteSkillMutation = useDeleteSkill({ mutation: { onSuccess: () => refetch() } });

    const skills = profileData?.data.skills;

    const [isEditing, setIsEditing] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);

    function reset() {
        setIsEditing(false);
        setIsAddingNew(false);
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between">
                    <div>
                        <CardTitle>Skills</CardTitle>
                        <CardDescription>Add your key skills and technologies.</CardDescription>
                    </div>
                    {
                        skills && skills.length > 0 && (
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
                    isLoading || deleteSkillMutation.isPending || addSkillMutation.isPending ?
                        <Skeleton className="h-40"/>
                        :
                        skills && skills.length > 0 ?
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <SkillBadge
                                        key={skill.id}
                                        skill={skill}
                                        isEditing={isEditing}
                                        onDelete={() => {
                                            // Do not exit edit mode; allow multiple deletions
                                            deleteSkillMutation.mutate({ skillId: skill.id });
                                        }}
                                        isMutating={deleteSkillMutation.isPending}
                                    />
                                ))}
                            </div>
                            :
                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <TagsIcon/>
                                <p>No skills added yet.</p>
                            </div>
                }
            </CardContent>
            <CardFooter>
                {
                    !isAddingNew ?
                        <Button onClick={() => setIsAddingNew(true)}><PlusIcon/>Add Skill</Button>
                        :
                        <NewSkill
                            onSave={(request: CreateSkillRequest) => {
                                reset();
                                addSkillMutation.mutate({data: request});
                                setIsAddingNew(false);
                            }}
                            onCancel={() => setIsAddingNew(false)}
                            isLoading={addSkillMutation.isPending}
                        />
                }
            </CardFooter>
        </Card>
    );
}

interface SkillBadgeProps {
    skill: ProfileSkillDTO;
    isEditing: boolean;
    onDelete: () => void;
    isMutating: boolean;
}

function SkillBadge({ skill, isEditing, onDelete, isMutating }: SkillBadgeProps) {
    if (isEditing) {
        return (
            <Badge asChild variant="destructive" className="cursor-pointer">
                <button type="button" onClick={onDelete} disabled={isMutating} title="Click to delete">
                    <TrashIcon />
                    {skill.name}
                </button>
            </Badge>
        );
    }

    return (
        <Badge variant="secondary">{skill.name}</Badge>
    );
}

interface NewSkillProps {
    onSave: (request: CreateSkillRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function NewSkill({onSave, onCancel, isLoading}: NewSkillProps) {
    const [name, setName] = useState("");

    const handleSave = () => {
        onSave({ name: name.trim() });
        setName("");
    };

    const canSave = !!name.trim();

    return (
        <div className="space-y-4 w-full">
            <div className="space-y-2">
                <Label htmlFor="new-skill" className="text-sm font-medium">Skill *</Label>
                <input
                    id="new-skill"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Type a skill, e.g. TypeScript"
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
                    Add Skill
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
                    <XIcon className="h-3 w-3 mr-1"/>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
