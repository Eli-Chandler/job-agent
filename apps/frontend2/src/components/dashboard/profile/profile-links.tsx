import {useAddLink, useDeleteLink, useGetProfile, useUpdateLink} from "@/api/profiles/profiles.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import type {CreateLinkRequest, ProfileLinkDTO, UpdateLinkRequest} from "@/api/models";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Link} from "react-router";
import {Button} from "@/components/ui/button.tsx";
import {EditIcon, GlobeIcon, LoaderIcon, PlusIcon, SaveIcon, TrashIcon, XIcon} from "lucide-react";

export default function ProfileLinks() {
    const {data: profileData, isLoading, refetch} = useGetProfile();
    const addLinkMutation = useAddLink(
        {
            mutation: {
                onSuccess: () => refetch()
            }
        }
    );
    const updateLinkMutation = useUpdateLink(
        {
            mutation: {
                onSuccess: () => refetch()
            }
        }
    );
    const deleteLinkMutation = useDeleteLink(
        {
            mutation: {
                onSuccess: () => refetch()
            }
        }
    );
    const links = profileData?.data.links

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
                        <CardTitle>Links</CardTitle>
                        <CardDescription>Links to include in your application, LinkedIn, GitHub, Portfolio,
                            etc.</CardDescription>
                    </div>
                    {
                        links && links.length > 0 && (
                            !isEditing ?
                                <Button size="icon" onClick={() => setIsEditing(true)}><EditIcon/></Button>
                                :
                                <Button size="icon" variant="secondary"
                                        onClick={() => setIsEditing(false)}><XIcon/></Button>
                        )
                    }
                </div>

            </CardHeader>
            <CardContent>
                {
                    isLoading || deleteLinkMutation.isPending || updateLinkMutation.isPending || addLinkMutation.isPending ?
                        <Skeleton className="h-40"/>
                        :
                        links && links.length > 0 ?
                            <div className="flex flex-col gap-1">
                                {links!.map(link => {
                                    return (
                                        <ProfileLink
                                            key={link.id}
                                            profileLink={link}
                                            isEditing={isEditing}
                                            onUpdate={(request) => {

                                                updateLinkMutation.mutate(
                                                    {
                                                        linkId: link.id,
                                                        data: request
                                                    }
                                                );
                                                reset();
                                            }}
                                            onDelete={() => {
                                                deleteLinkMutation.mutate({linkId: link.id});
                                                reset();
                                            }}
                                        />
                                    )
                                })}
                            </div>
                            :
                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <GlobeIcon/>
                                <p>No links added yet.</p>
                            </div>

                }

            </CardContent>
            <CardFooter>
                {
                    !isAddingNew ?
                        <Button onClick={() => setIsAddingNew(true)}><PlusIcon/>Add New Link</Button>
                        :
                        <NewProfileLink
                            onSave={(request: CreateLinkRequest) => {
                                reset();
                                addLinkMutation.mutate({data: request});
                                setIsAddingNew(false);
                            }}
                            onCancel={() => setIsAddingNew(false)}
                            isLoading={addLinkMutation.isPending}
                        />
                }
            </CardFooter>
        </Card>
    )
}

interface ProfileLinkProps {
    profileLink: ProfileLinkDTO,
    isEditing: boolean,
    onUpdate: (update: UpdateLinkRequest) => void,
    onDelete: (linkId: number) => void,
}

function ProfileLink(
    {profileLink, isEditing, onUpdate, onDelete}: ProfileLinkProps
) {
    const [label, setLabel] = useState(profileLink.label);
    const [link, setLink] = useState(profileLink.url);

    useEffect(() => {
            setLabel(profileLink.label)
            setLink(profileLink.url);
        },
        [isEditing, profileLink.label, profileLink.url]);

    const canSave =
        label.trim() !== "" &&
        link.trim() !== "" &&
        (label !== profileLink.label || link !== profileLink.url);

    return (
        <div className="flex gap-2 items-center">
            {isEditing ?
                <Input value={label} onChange={e => setLabel(e.target.value)}
                       placeholder="Link label"/>
                :
                <Label className="font-medium text-sm">{label}</Label>
            }
            {
                isEditing ?
                    <Input value={link} onChange={e => setLink(e.target.value)}
                           placeholder="Link URL"/>
                    :
                    <Link to={link} target="_blank" rel="noopener noreferrer"><Button
                        variant="link">{link}</Button></Link>
            }
            {
                isEditing && <>


                    <Button size="icon" disabled={!canSave}
                            onClick={() => onUpdate({url: link, label: label})}><SaveIcon/></Button>
                    <Button size="icon" variant="destructive" onClick={() => onDelete(profileLink.id)}><TrashIcon/></Button>
                </>
            }
        </div>
    )
}


interface NewProfileLinkProps {
    onSave: (request: CreateLinkRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function NewProfileLink({onSave, onCancel, isLoading}: NewProfileLinkProps) {
    const [name, setName] = useState('');
    const [link, setLink] = useState('');

    const handleSave = () => {
        onSave({
            label: name.trim(),
            url: link.trim(),
        });
        setName('');
        setLink('');
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const canSave = name.trim() && link.trim() && isValidUrl(link.trim());

    return (
        <div className="space-y-3 w-full">
            <div className="space-y-2">
                <Label htmlFor="new-name" className="text-sm font-medium">
                    Platform Name
                </Label>
                <Input
                    id="new-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., LinkedIn, Twitter, GitHub"
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-link" className="text-sm font-medium">
                    Profile URL
                </Label>
                <Input
                    id="new-link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    disabled={isLoading}
                />
            </div>
            <div className="flex gap-2 justify-end">
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!canSave || isLoading}
                >
                    {isLoading ? (
                        <LoaderIcon className="h-3 w-3 animate-spin mr-1"/>
                    ) : (
                        <PlusIcon className="h-3 w-3 mr-1"/>
                    )}
                    Add Link
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
                    <XIcon className="h-3 w-3 mr-1"/>
                    Cancel
                </Button>
            </div>
        </div>
    );
}