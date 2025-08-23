import {
    useAddExperience,
    useDeleteExperience,
    useGetProfile,
    useUpdateExperience
} from "@/api/profiles/profiles.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import type {CreateExperienceRequest, ProfileExperienceDTO, UpdateExperienceRequest} from "@/api/models";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {BriefcaseIcon, EditIcon, LoaderIcon, PlusIcon, SaveIcon, TrashIcon, XIcon} from "lucide-react";

export default function ProfileExperiences() {
    const {data: profileData, isLoading, refetch} = useGetProfile();
    const addExperienceMutation = useAddExperience({
        mutation: {
            onSuccess: () => refetch()
        }
    });
    const updateExperienceMutation = useUpdateExperience({
        mutation: {
            onSuccess: () => refetch()
        }
    });
    const deleteExperienceMutation = useDeleteExperience({
        mutation: {
            onSuccess: () => refetch()
        }
    });

    const experiences = profileData?.data.experiences;

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
                        <CardTitle>Work Experience</CardTitle>
                        <CardDescription>Add your professional work experience and internships.</CardDescription>
                    </div>
                    {
                        !isEditing ?
                            <Button size="icon" onClick={() => setIsEditing(true)}><EditIcon/></Button>
                            :
                            <Button size="icon" variant="secondary" onClick={() => setIsEditing(false)}><XIcon/></Button>
                    }
                </div>
            </CardHeader>
            <CardContent>
                {
                    isLoading || deleteExperienceMutation.isPending || updateExperienceMutation.isPending || addExperienceMutation.isPending ?
                        <Skeleton className="h-40"/>
                        :
                        experiences && experiences.length > 0 ?
                            <div className="flex flex-col gap-4">
                                {experiences.map(experience => (
                                    <Experience
                                        key={experience.id}
                                        experience={experience}
                                        isEditing={isEditing}
                                        onUpdate={(request) => {
                                            updateExperienceMutation.mutate({
                                                experienceId: experience.id,
                                                data: request
                                            });
                                            reset();
                                        }}
                                        onDelete={() => {
                                            deleteExperienceMutation.mutate({experienceId: experience.id});
                                            reset();
                                        }}
                                    />
                                ))}
                            </div>
                            :
                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                <BriefcaseIcon/>
                                <p>No work experience added yet.</p>
                            </div>
                }
            </CardContent>
            <CardFooter>
                {
                    !isAddingNew ?
                        <Button onClick={() => setIsAddingNew(true)}><PlusIcon/>Add Experience</Button>
                        :
                        <NewExperience
                            onSave={(request: CreateExperienceRequest) => {
                                reset();
                                addExperienceMutation.mutate({data: request});
                                setIsAddingNew(false);
                            }}
                            onCancel={() => setIsAddingNew(false)}
                            isLoading={addExperienceMutation.isPending}
                        />
                }
            </CardFooter>
        </Card>
    );
}

interface ExperienceProps {
    experience: ProfileExperienceDTO;
    isEditing: boolean;
    onUpdate: (update: UpdateExperienceRequest) => void;
    onDelete: () => void;
}

function Experience({experience, isEditing, onUpdate, onDelete}: ExperienceProps) {
    const [company, setCompany] = useState(experience.company);
    const [title, setTitle] = useState(experience.title);
    const [description, setDescription] = useState(experience.description || '');
    const [startDate, setStartDate] = useState(experience.start_date || '');
    const [endDate, setEndDate] = useState(experience.end_date || '');

    useEffect(() => {
        setCompany(experience.company);
        setTitle(experience.title);
        setDescription(experience.description || '');
        setStartDate(experience.start_date || '');
        setEndDate(experience.end_date || '');
    }, [isEditing, experience]);

    const canSave =
        company.trim() !== "" &&
        title.trim() !== "" &&
        (company !== experience.company ||
         title !== experience.title ||
         description !== (experience.description || '') ||
         startDate !== (experience.start_date || '') ||
         endDate !== (experience.end_date || ''));

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    const getDateRange = () => {
        const start = formatDate(experience.start_date || '');
        const end = experience.end_date ? formatDate(experience.end_date) : 'Present';
        return start && end ? `${start} - ${end}` : '';
    };

    if (isEditing) {
        return (
            <div className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm font-medium">Company</Label>
                        <Input
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="Company name"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Job Title</Label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Software Engineer, Intern"
                        />
                    </div>
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
                        placeholder="Describe your responsibilities, achievements, and key projects..."
                        rows={4}
                    />
                </div>
                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        disabled={!canSave}
                        onClick={() => onUpdate({
                            company: company.trim(),
                            title: title.trim(),
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
                    <h4 className="font-medium text-lg">{experience.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium">{experience.company}</p>
                    {getDateRange() && (
                        <p className="text-xs text-muted-foreground">{getDateRange()}</p>
                    )}
                </div>
            </div>
            {experience.description && (
                <p className="text-sm mt-3 text-muted-foreground whitespace-pre-line">{experience.description}</p>
            )}
        </div>
    );
}

interface NewExperienceProps {
    onSave: (request: CreateExperienceRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function NewExperience({onSave, onCancel, isLoading}: NewExperienceProps) {
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSave = () => {
        onSave({
            company: company.trim(),
            title: title.trim(),
            description: description.trim(),
            start_date: startDate,
            end_date: endDate || undefined
        });
        // Reset form
        setCompany('');
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
    };

    const canSave = company.trim() && title.trim();

    return (
        <div className="space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="new-company" className="text-sm font-medium">
                        Company *
                    </Label>
                    <Input
                        id="new-company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Google, Microsoft, Startup Inc."
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-title" className="text-sm font-medium">
                        Job Title *
                    </Label>
                    <Input
                        id="new-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Software Engineer"
                        disabled={isLoading}
                    />
                </div>
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
                    Job Description (Optional)
                </Label>
                <Textarea
                    id="new-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="• Developed full-stack web applications using React and Node.js&#10;• Collaborated with cross-functional teams to deliver features&#10;• Improved system performance by 25%"
                    rows={4}
                    disabled={isLoading}
                />
            </div>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!canSave || isLoading}
                >
                    {isLoading ? (
                        <LoaderIcon className="h-3 w-3 animate-spin mr-1"/>
                    ) : (
                        <SaveIcon className="h-3 w-3 mr-1"/>
                    )}
                    Add Experience
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
                    <XIcon className="h-3 w-3 mr-1"/>
                    Cancel
                </Button>
            </div>
        </div>
    );
}