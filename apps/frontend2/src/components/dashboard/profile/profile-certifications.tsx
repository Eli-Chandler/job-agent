import {useAddCertification, useDeleteCertification, useGetProfile, useUpdateCertification} from "@/api/profiles/profiles.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import type {CreateCertificationRequest, ProfileCertificationDTO, UpdateCertificationRequest} from "@/api/models";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {AwardIcon, CalendarIcon, EditIcon, LoaderIcon, PlusIcon, SaveIcon, TrashIcon, XIcon} from "lucide-react";

export default function ProfileCertifications() {
    const {data: profileData, isLoading, refetch} = useGetProfile();
    const addCertificationMutation = useAddCertification({ mutation: { onSuccess: () => refetch() } });
    const updateCertificationMutation = useUpdateCertification({ mutation: { onSuccess: () => refetch() } });
    const deleteCertificationMutation = useDeleteCertification({ mutation: { onSuccess: () => refetch() } });

    const certifications = profileData?.data.certifications;

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
                        <CardTitle>Certifications</CardTitle>
                        <CardDescription>List professional certifications.</CardDescription>
                    </div>
                    {
                        certifications && certifications.length > 0 && (
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
                    isLoading || deleteCertificationMutation.isPending || updateCertificationMutation.isPending || addCertificationMutation.isPending ?
                        <Skeleton className="h-40"/>
                        :
                        certifications && certifications.length > 0 ?
                            <div className="flex flex-col gap-4">
                                {certifications.map(cert => (
                                    <Certification
                                        key={cert.id}
                                        certification={cert}
                                        isEditing={isEditing}
                                        onUpdate={(request) => {
                                            updateCertificationMutation.mutate({ certificationId: cert.id, data: request });
                                            reset();
                                        }}
                                        onDelete={() => {
                                            deleteCertificationMutation.mutate({ certificationId: cert.id });
                                            reset();
                                        }}
                                    />
                                ))}
                            </div>
                            :
                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <AwardIcon/>
                                <p>No certifications added yet.</p>
                            </div>
                }
            </CardContent>
            <CardFooter>
                {
                    !isAddingNew ?
                        <Button onClick={() => setIsAddingNew(true)}><PlusIcon/>Add Certification</Button>
                        :
                        <NewCertification
                            onSave={(request: CreateCertificationRequest) => {
                                reset();
                                addCertificationMutation.mutate({data: request});
                                setIsAddingNew(false);
                            }}
                            onCancel={() => setIsAddingNew(false)}
                            isLoading={addCertificationMutation.isPending}
                        />
                }
            </CardFooter>
        </Card>
    );
}

interface CertificationProps {
    certification: ProfileCertificationDTO;
    isEditing: boolean;
    onUpdate: (update: UpdateCertificationRequest) => void;
    onDelete: () => void;
}

function Certification({certification, isEditing, onUpdate, onDelete}: CertificationProps) {
    const [name, setName] = useState(certification.name);
    const [issuer, setIssuer] = useState(certification.issuer || "");

    useEffect(() => {
        setName(certification.name);
        setIssuer(certification.issuer || "");
    }, [isEditing, certification]);

    const canSave =
        name.trim() !== "" &&
        (name !== certification.name || issuer !== (certification.issuer || ""));

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    if (isEditing) {
        return (
            <div className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="AWS Certified Solutions Architect"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Issuer</Label>
                        <Input
                            value={issuer}
                            onChange={e => setIssuer(e.target.value)}
                            placeholder="Amazon Web Services"
                        />
                    </div>
                </div>
                <div className="flex gap-2 pt-2">
                    <Button size="sm" disabled={!canSave} onClick={() => onUpdate({ name: name.trim(), issuer: issuer.trim() || undefined })}>
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
                    <h4 className="font-medium text-lg">{certification.name}</h4>
                    {certification.issuer && (
                        <p className="text-sm text-muted-foreground">{certification.issuer}</p>
                    )}
                    {certification.date_issued && (
                        <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3"/> {formatDate(certification.date_issued)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface NewCertificationProps {
    onSave: (request: CreateCertificationRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function NewCertification({onSave, onCancel, isLoading}: NewCertificationProps) {
    const [name, setName] = useState("");
    const [issuer, setIssuer] = useState("");

    const handleSave = () => {
        onSave({ name: name.trim(), issuer: issuer.trim() || undefined });
        setName("");
        setIssuer("");
    };

    const canSave = !!name.trim();

    return (
        <div className="space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="new-cert-name" className="text-sm font-medium">Name *</Label>
                    <Input
                        id="new-cert-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="AWS Certified Developer"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-cert-issuer" className="text-sm font-medium">Issuer</Label>
                    <Input
                        id="new-cert-issuer"
                        value={issuer}
                        onChange={(e) => setIssuer(e.target.value)}
                        placeholder="Amazon Web Services"
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={handleSave} disabled={!canSave || isLoading}>
                    {isLoading ? (
                        <LoaderIcon className="h-3 w-3 animate-spin mr-1"/>
                    ) : (
                        <PlusIcon className="h-3 w-3 mr-1"/>
                    )}
                    Add Certification
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
                    <XIcon className="h-3 w-3 mr-1"/>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

