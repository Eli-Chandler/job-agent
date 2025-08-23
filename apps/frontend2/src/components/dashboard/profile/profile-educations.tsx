import {useAddEducation, useDeleteEducation, useGetProfile, useUpdateEducation} from "@/api/profiles/profiles.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import type {CreateEducationRequest, ProfileEducationDTO, UpdateEducationRequest} from "@/api/models";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {EditIcon, GraduationCapIcon, LoaderIcon, PlusIcon, SaveIcon, TrashIcon, XIcon} from "lucide-react";

export default function ProfileEducations() {
    const {data: profileData, isLoading, refetch} = useGetProfile();
    const addEducationMutation = useAddEducation({
        mutation: {
            onSuccess: () => refetch()
        }
    });
    const updateEducationMutation = useUpdateEducation({
        mutation: {
            onSuccess: () => refetch()
        }
    });
    const deleteEducationMutation = useDeleteEducation({
        mutation: {
            onSuccess: () => refetch()
        }
    });

    const educations = profileData?.data.educations;

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
                        <CardTitle>Education</CardTitle>
                        <CardDescription>Add your educational background, degrees, and certifications.</CardDescription>
                    </div>
                    {
                        educations && educations.length > 0 &&
                        (
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
                    isLoading || deleteEducationMutation.isPending || updateEducationMutation.isPending || addEducationMutation.isPending ?
                        <Skeleton className="h-40"/>
                        :
                        educations && educations.length > 0 ?
                            <div className="flex flex-col gap-4">
                                {educations.map(education => (
                                    <Education
                                        key={education.id}
                                        education={education}
                                        isEditing={isEditing}
                                        onUpdate={(request) => {
                                            updateEducationMutation.mutate({
                                                educationId: education.id,
                                                data: request
                                            });
                                            reset();
                                        }}
                                        onDelete={() => {
                                            deleteEducationMutation.mutate({educationId: education.id});
                                            reset();
                                        }}
                                    />
                                ))}
                            </div>
                            :
                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <GraduationCapIcon/>
                                <p>No education added yet.</p>
                            </div>
                }
            </CardContent>
            <CardFooter>
                {
                    !isAddingNew ?
                        <Button onClick={() => setIsAddingNew(true)}><PlusIcon/>Add Education</Button>
                        :
                        <NewEducation
                            onSave={(request: CreateEducationRequest) => {
                                reset();
                                addEducationMutation.mutate({data: request});
                                setIsAddingNew(false);
                            }}
                            onCancel={() => setIsAddingNew(false)}
                            isLoading={addEducationMutation.isPending}
                        />
                }
            </CardFooter>
        </Card>
    );
}

interface EducationProps {
    education: ProfileEducationDTO;
    isEditing: boolean;
    onUpdate: (update: UpdateEducationRequest) => void;
    onDelete: () => void;
}

function Education({education, isEditing, onUpdate, onDelete}: EducationProps) {
    const [school, setSchool] = useState(education.school);
    const [degree, setDegree] = useState(education.degree);
    const [field, setField] = useState(education.field || '');
    const [description, setDescription] = useState(education.description || '');
    const [startDate, setStartDate] = useState(education.start_date || '');
    const [endDate, setEndDate] = useState(education.end_date || '');

    useEffect(() => {
        setSchool(education.school);
        setDegree(education.degree);
        setField(education.field || '');
        setDescription(education.description || '');
        setStartDate(education.start_date || '');
        setEndDate(education.end_date || '');
    }, [isEditing, education]);

    const canSave =
        school.trim() !== "" &&
        degree?.trim() !== "" &&
        (school !== education.school ||
            degree !== education.degree ||
            field !== (education.field || '') ||
            description !== (education.description || '') ||
            startDate !== (education.start_date || '') ||
            endDate !== (education.end_date || ''));

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    const getDateRange = () => {
        const start = formatDate(education.start_date || '');
        const end = education.end_date ? formatDate(education.end_date) : 'Present';
        return start && end ? `${start} - ${end}` : '';
    };

    if (isEditing) {
        return (
            <div className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm font-medium">School/Institution</Label>
                        <Input
                            value={school}
                            onChange={e => setSchool(e.target.value)}
                            placeholder="University name"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Degree</Label>
                        <Input
                            value={degree || ''}
                            onChange={e => setDegree(e.target.value)}
                            placeholder="e.g. Bachelor's, Master's"
                        />
                    </div>
                </div>
                <div>
                    <Label className="text-sm font-medium">Field of Study</Label>
                    <Input
                        value={field}
                        onChange={e => setField(e.target.value)}
                        placeholder="e.g. Computer Science, Business"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">End Date</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            placeholder="Leave empty if current"
                        />
                    </div>
                </div>
                <div>
                    <Label className="text-sm font-medium">Description (Optional)</Label>
                    <Textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Relevant coursework, achievements, honors..."
                        rows={3}
                    />
                </div>
                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        disabled={!canSave}
                        onClick={() => onUpdate({
                            school: school.trim(),
                            degree: degree?.trim(),
                            field: field.trim() || undefined,
                            description: description.trim() || undefined,
                            start_date: startDate || undefined,
                            end_date: endDate || undefined
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
                    <h4 className="font-medium text-lg">{education.degree}</h4>
                    <p className="text-sm text-muted-foreground">{education.school}</p>
                    {education.field && (
                        <p className="text-sm text-muted-foreground">{education.field}</p>
                    )}
                    {getDateRange() && (
                        <p className="text-xs text-muted-foreground">{getDateRange()}</p>
                    )}
                </div>
            </div>
            {education.description && (
                <p className="text-sm mt-3 text-muted-foreground">{education.description}</p>
            )}
        </div>
    );
}

interface NewEducationProps {
    onSave: (request: CreateEducationRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function NewEducation({onSave, onCancel, isLoading}: NewEducationProps) {
    const [school, setSchool] = useState('');
    const [degree, setDegree] = useState('');
    const [field, setField] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSave = () => {
        onSave({
            school: school.trim(),
            degree: degree.trim(),
            field: field.trim() || undefined,
            description: description.trim() || undefined,
            start_date: startDate,
            end_date: endDate || undefined
        });
        // Reset form
        setSchool('');
        setDegree('');
        setField('');
        setDescription('');
        setStartDate('');
        setEndDate('');
    };

    const canSave = school.trim() && degree.trim();

    return (
        <div className="space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="new-school" className="text-sm font-medium">
                        School/Institution *
                    </Label>
                    <Input
                        id="new-school"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="University of Example"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-degree" className="text-sm font-medium">
                        Degree *
                    </Label>
                    <Input
                        id="new-degree"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        placeholder="Bachelor of Science"
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-field" className="text-sm font-medium">
                    Field of Study
                </Label>
                <Input
                    id="new-field"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="Computer Science"
                    disabled={isLoading}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="new-start-date" className="text-sm font-medium">
                        Start Date
                    </Label>
                    <Input
                        id="new-start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-end-date" className="text-sm font-medium">
                        End Date
                    </Label>
                    <Input
                        id="new-end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Leave empty if current"
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-description" className="text-sm font-medium">
                    Description (Optional)
                </Label>
                <Textarea
                    id="new-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Relevant coursework, achievements, honors, GPA..."
                    rows={3}
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
                    Add Education
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
                    <XIcon className="h-3 w-3 mr-1"/>
                    Cancel
                </Button>
            </div>
        </div>
    );
}