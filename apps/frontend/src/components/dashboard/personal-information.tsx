import {Card, CardHeader, CardTitle, CardContent, CardFooter} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    UserIcon,
    EditIcon,
    PhoneIcon,
    SaveIcon,
    XIcon,
    LoaderIcon,
    MailIcon
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import type {UpdateCandidatePersonalInfoRequest} from '@/api/models';
import {useGetMeMeGet, useUpdateMeInfoMePatch} from "@/api/me/me.ts";
import {useEffect, useState} from "react";

export default function PersonalInformation() {
    // API hooks
    const {data: user, isLoading, refetch} = useGetMeMeGet();
    const updateMutation = useUpdateMeInfoMePatch();

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize form data when user data loads
    useEffect(() => {
        if (user?.data) {
            const newFormData = {
                firstName: user.data.first_name || '',
                lastName: user.data.last_name || '',
                phoneNumber: user.data.phone || ''
            };
            setFormData(newFormData);
        }
    }, [user?.data]);

    // Check for changes
    useEffect(() => {
        if (user?.data) {
            const hasChanged =
                formData.firstName !== (user.data.first_name || '') ||
                formData.lastName !== (user.data.last_name || '') ||
                formData.phoneNumber !== (user.data.phone || '');
            setHasChanges(hasChanged);
        }
    }, [formData, user?.data]);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!user?.data || !hasChanges) return;

        const updateRequest: UpdateCandidatePersonalInfoRequest = {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            phone: formData.phoneNumber.trim()
        };

        try {
            await updateMutation.mutateAsync({data: updateRequest});
            await refetch();
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update personal information:', error);
        }
    };

    const handleCancel = () => {
        if (user?.data) {
            setFormData({
                firstName: user.data.first_name || '',
                lastName: user.data.last_name || '',
                phoneNumber: user.data.phone || ''
            });
        }
        setIsEditing(false);
    };

    const handleToggleEdit = () => {
        if (isEditing) {
            handleCancel();
        } else {
            setIsEditing(true);
        }
    };

    const canSave = hasChanges &&
        formData.firstName.trim() &&
        formData.lastName.trim();

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <LoaderIcon className="h-6 w-6 animate-spin"/>
                    <span className="ml-2">Loading personal information...</span>
                </CardContent>
            </Card>
        );
    }

    if (!user?.data) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Failed to load personal information</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5"/>
                        Personal Information
                    </div>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={handleToggleEdit}>
                            <EditIcon className="h-4 w-4 mr-1"/>
                            Edit
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        label="First Name"
                        value={formData.firstName}
                        isEditing={isEditing}
                        onChange={(value) => handleInputChange('firstName', value)}
                        required
                        disabled={updateMutation.isPending}
                    />

                    <InfoField
                        label="Last Name"
                        value={formData.lastName}
                        isEditing={isEditing}
                        onChange={(value) => handleInputChange('lastName', value)}
                        required
                        disabled={updateMutation.isPending}
                    />

                    <InfoField
                        icon={MailIcon}
                        label="Email"
                        value={user.data.email || ''}
                        isEditing={false}
                        disabled={true}
                    />

                    <InfoField
                        icon={PhoneIcon}
                        label="Phone"
                        value={formData.phoneNumber}
                        isEditing={isEditing}
                        onChange={(value) => handleInputChange('phoneNumber', value)}
                        type="tel"
                        disabled={updateMutation.isPending}
                    />
                </div>
            </CardContent>

            <CardFooter className="flex gap-2">
                {isEditing ? (
                    <>
                        <Button
                            onClick={handleSave}
                            disabled={!canSave || updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <LoaderIcon className="h-4 w-4 animate-spin mr-1"/>
                            ) : (
                                <SaveIcon className="h-4 w-4 mr-1"/>
                            )}
                            Save Changes
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={updateMutation.isPending}
                        >
                            <XIcon className="h-4 w-4 mr-1"/>
                            Cancel
                        </Button>
                        {hasChanges && (
                            <span className="text-sm text-muted-foreground ml-2">
                You have unsaved changes
              </span>
                        )}
                    </>
                ) : null}
            </CardFooter>
        </Card>
    );
}

interface InfoFieldProps {
    icon?: LucideIcon;
    label: string;
    value: string;
    isEditing: boolean;
    onChange?: (value: string) => void;
    type?: string;
    required?: boolean;
    disabled?: boolean;
}

function InfoField({
                       icon: Icon,
                       label,
                       value,
                       isEditing,
                       onChange,
                       type = "text",
                       required = false,
                       disabled = false
                   }: InfoFieldProps) {
    return (
        <div className="space-y-2">
            <Label
                htmlFor={`field-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-medium flex items-center gap-2"
            >
                {Icon && <Icon className="h-4 w-4"/>}
                {label}
                {required && <span className="text-destructive">*</span>}
            </Label>

            {isEditing ? (
                <Input
                    id={`field-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    value={value}
                    type={type}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={`Enter your ${label.toLowerCase()}`}
                    disabled={disabled}
                    className={required && !value.trim() ? 'border-destructive' : ''}
                />
            ) : (
                <div className="min-h-[2.5rem] flex items-center">
                    {value ? (
                        <p className="text-base font-medium text-foreground">{value}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            No {label.toLowerCase()} provided
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}