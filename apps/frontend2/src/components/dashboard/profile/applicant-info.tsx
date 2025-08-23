import {useGetProfile, useUpdateProfile} from "@/api/profiles/profiles.ts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import {
    EditIcon,
    type LucideIcon,
    MailIcon,
    MapIcon,
    PhoneIcon,
    SaveIcon,
    ScrollIcon,
    UserIcon,
    XIcon
} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

export default function ApplicantInfo() {
    const {data: profileData, isPending, refetch} = useGetProfile();
    const profileMutation = useUpdateProfile(
        {
            mutation: {
                onSuccess: () => refetch()
            }
        }
    );

    const isLoading = isPending;

    const profile = profileData?.data;
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (profileData && !isEditing) {
            setFirstName(profile?.first_name || "");
            setLastName(profile?.last_name || "");
            setContactEmail(profile?.contact_email || "");
            setContactPhone(profile?.contact_phone || "");
            setWorkLocation(profile?.work_location || null);
            setSummary(profile?.summary || null);
        }
    }, [isEditing, profile, profileData]);

    const [firstName, setFirstName] = useState(profile?.first_name || "");
    const [lastName, setLastName] = useState(profile?.last_name || "");
    const [contactEmail, setContactEmail] = useState(profile?.contact_email || "");
    const [contactPhone, setContactPhone] = useState(profile?.contact_phone || "");
    const [workLocation, setWorkLocation] = useState(profile?.work_location || null);
    const [summary, setSummary] = useState(profile?.summary || null);

    const canSave =
        firstName !== profile?.first_name ||
        lastName !== profile?.last_name ||
        contactEmail !== profile?.contact_email ||
        contactPhone !== profile?.contact_phone ||
        workLocation !== profile?.work_location ||
        summary !== profile?.summary;


    return (
        <Card className="max-w-xl w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Applicant Info</CardTitle>
                        <CardDescription>
                            Personal information about the applicant, used during application process.
                        </CardDescription>
                    </div>
                    {
                        !isEditing ?
                            <Button size="icon" onClick={() => setIsEditing(true)}><EditIcon/></Button>
                            :
                            <Button size="icon" variant="secondary"
                                    onClick={() => setIsEditing(false)}><XIcon/></Button>

                    }
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {
                    isLoading ? <Skeleton className="w-full h-40"/> :
                        <>
                            <EditableInfoField
                                label="First Name"
                                value={firstName}
                                isEditing={isEditing}
                                onValueChange={(value) => setFirstName(value)}
                                icon={UserIcon}
                                placeholder="Enter your first name"/>
                            <EditableInfoField
                                label="Last Name"
                                value={lastName}
                                isEditing={isEditing}
                                icon={UserIcon}
                                onValueChange={(value) => setLastName(value)}
                                placeholder="Enter your last name"/>
                            <EditableInfoField
                                label="Contact Email"
                                value={contactEmail}
                                isEditing={isEditing}
                                icon={MailIcon}
                                onValueChange={(value) => setContactEmail(value)}
                                placeholder="Enter your contact email"/>
                            <EditableInfoField
                                label="Contact Phone"
                                value={contactPhone}
                                isEditing={isEditing}
                                icon={PhoneIcon}
                                onValueChange={(value) => setContactPhone(value)}
                                placeholder="Enter your contact phone"/>
                            <EditableInfoField
                                label="Work Location"
                                value={workLocation}
                                isEditing={isEditing}
                                icon={MapIcon}
                                onValueChange={(value) => setWorkLocation(value)}
                                placeholder="Enter your work location (optional)"/>
                            <EditableInfoField
                                label="Summary"
                                value={summary}
                                isEditing={isEditing}
                                icon={ScrollIcon}
                                onValueChange={(value) => setSummary(value)}
                                placeholder="Enter a brief summary about yourself"
                                variant="textarea"/>
                        </>
                }

            </CardContent>
            <CardFooter>
                {
                    isEditing &&
                    <div className="flex justify-end w-full">
                        <Button
                            disabled={!canSave}
                            onClick={() => {
                                profileMutation.mutate(
                                    {
                                        data: {
                                            first_name: firstName,
                                            last_name: lastName,
                                            contact_email: contactEmail,
                                            contact_phone: contactPhone,
                                            work_location: workLocation,
                                            summary: summary

                                        }
                                    }
                                )
                            }}><SaveIcon/>Save</Button>
                    </div>
                }
            </CardFooter>
        </Card>
    )
}

interface EditableInfoFieldProps {
    label: string;
    icon?: LucideIcon;
    isEditing?: boolean;
    value: string | null;
    onValueChange: (value: string) => void;
    placeholder?: string;
    variant?: "input" | "textarea";
}

function EditableInfoField(
    {
        label,
        icon: Icon,
        value,
        isEditing = false,
        onValueChange,
        placeholder = "",
        variant = "input"
    }: EditableInfoFieldProps) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
                {Icon && <Icon className="h-4 w-4"/>}
                {label}
            </Label>
            {
                isEditing ? (
                    variant === "textarea" ? (
                        <Textarea
                            value={value || ""}
                            onChange={(e) => onValueChange(e.target.value)}
                            placeholder={placeholder}
                            className="min-h-[80px] resize-none"
                        />
                    ) : (
                        <Input
                            value={value || ""}
                            onChange={(e) => onValueChange(e.target.value)}
                            placeholder={placeholder}
                        />
                    )
                ) : (
                    variant === "textarea" ? (
                        <div className="border rounded-md p-3 bg-secondary min-h-[80px]">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {value || <span className="text-muted-foreground italic">No information provided</span>}
                            </p>
                        </div>
                    ) : (
                        <div className="border rounded-md p-2 bg-secondary">
                            <p className="text-sm">
                                {value || <span className="text-muted-foreground italic">Not specified</span>}
                            </p>
                        </div>
                    )
                )
            }
        </div>
    )
}