import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button.tsx";
import {CheckCircle2, Building2, MapPin, DollarSign, LinkIcon, ArrowLeftIcon, PlusIcon} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {IconInput} from "@/components/ui/icon-input.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {useState} from "react";
import {useCreateJobFromUrl, useCreateJobManual} from "@/api/job-listings/job-listings.ts";
import type {JobListingDTO, CreateJobRequest} from "@/api/models";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Link} from "react-router";

type Stage = 'input' | 'preview';

export default function AddJobDialog() {
    const [stage, setStage] = useState<Stage>('input');
    const [job, setJob] = useState<JobListingDTO | null>(null);

    const handleJobSubmit = (submittedJob: JobListingDTO) => {
        setJob(submittedJob);
        setStage('preview');
    };

    const handleBack = () => {
        setStage('input');
        setJob(null);
    };

    const handleConfirm = () => {
        // Handle final confirmation - maybe close dialog or trigger parent callback
        console.log('Job confirmed:', job);
    };

    return (
        <Link to="/dashboard/add-job"><Button size="lg"><PlusIcon/>Add Job</Button></Link>
        // <Dialog>
        //     <DialogTrigger>
        //         <Button size="lg"><PlusIcon/>Add Job</Button>
        //     </DialogTrigger>
        //     <DialogContent className="max-w-2xl">
        //         <DialogHeader>
        //             <DialogTitle>
        //                 {stage === 'input' ? 'Add Job' : 'Confirm Job Details'}
        //             </DialogTitle>
        //             <DialogDescription>
        //                 {stage === 'input'
        //                     ? 'Apply to another job'
        //                     : 'Review the job details before adding'
        //                 }
        //             </DialogDescription>
        //         </DialogHeader>
        //
        //         {stage === 'input' && (
        //             <JobsTabs onJobSubmit={handleJobSubmit}/>
        //         )}
        //
        //         {stage === 'preview' && job && (
        //             <JobPreview job={job} onBack={handleBack} onConfirm={handleConfirm}/>
        //         )}
        //     </DialogContent>
        // </Dialog>
    )
}

interface JobsTabsProps {
    onJobSubmit: (job: JobListingDTO) => void;
}

function JobsTabs({onJobSubmit}: JobsTabsProps) {
    return (
        <Tabs defaultValue="hiringcafe">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hiringcafe">Hiring.Cafe</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
            <TabsContent value="hiringcafe" className="mt-4">
                <HiringCafeJobTab onJobSubmit={onJobSubmit}/>
            </TabsContent>
            <TabsContent value="manual" className="mt-4">
                <ManualJobTab onJobSubmit={onJobSubmit}/>
            </TabsContent>
        </Tabs>
    )
}

function ManualJobTab({onJobSubmit}: JobsTabsProps) {
    const [formData, setFormData] = useState<CreateJobRequest>({
        title: '',
        company: '',
        application_url: '',
        description: undefined
    });

    const mutation = useCreateJobManual();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await mutation.mutateAsync({
                data: formData
            });
            onJobSubmit(result.data);
        } catch (error) {
            console.error('Failed to create job:', error);
        }
    };

    const handleInputChange = (field: keyof CreateJobRequest, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'description' && !value.trim() ? undefined : value
        }));
    };

    const isFormValid = formData.title.trim() && formData.company.trim() && formData.application_url.trim();

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. Google, Microsoft, etc."
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="url">Application URL</Label>
                <Input
                    id="url"
                    type="url"
                    value={formData.application_url}
                    onChange={(e) => handleInputChange('application_url', e.target.value)}
                    placeholder="https://company.com/careers/job-id"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Job description, requirements, etc."
                    rows={4}
                />
            </div>

            <Button
                type="submit"
                disabled={!isFormValid || mutation.isPending}
                className="w-full"
            >
                {mutation.isPending ? "Creating..." : "Create Job"}
            </Button>
        </form>
    );
}

function HiringCafeJobTab({onJobSubmit}: JobsTabsProps) {
    const [url, setUrl] = useState("")
    const mutation = useCreateJobFromUrl()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await mutation.mutateAsync({
                data: {job_url: url}
            });
            onJobSubmit(result.data);
        } catch (error) {
            console.error('Failed to fetch job:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="job-url">Job URL</Label>
                <IconInput
                    id="job-url"
                    icon={LinkIcon}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://hiring.cafe/job/..."
                    required
                />
            </div>

            <Button
                type="submit"
                disabled={!url.trim() || mutation.isPending}
                className="w-full"
            >
                {mutation.isPending ? "Fetching..." : "Fetch Job"}
            </Button>
        </form>
    );
}

interface JobPreviewProps {
    job: JobListingDTO;
    onBack: () => void;
    onConfirm: () => void;
}

function JobPreview({job, onBack, onConfirm}: JobPreviewProps) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-success"/>
                        <CardTitle className="text-success">Job Successfully Fetched</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <JobField icon={<Building2 className="w-4 h-4"/>} label="Position">
                                {job.title}
                            </JobField>
                            <JobField icon={<Building2 className="w-4 h-4"/>} label="Company">
                                {job.company}
                            </JobField>
                        </div>

                        <div className="space-y-3">
                            <JobField icon={<MapPin className="w-4 h-4"/>} label="Source">
                                {job.source}
                            </JobField>
                            {job.posted_at && (
                                <JobField icon={<DollarSign className="w-4 h-4"/>} label="Posted">
                                    {new Date(job.posted_at).toLocaleDateString()}
                                </JobField>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-1">Application URL</p>
                        <p className="text-sm break-all bg-muted p-2 rounded">{job.application_url}</p>
                    </div>

                    {job.description && (
                        <div>
                            <p className="text-sm font-medium mb-1">Description</p>
                            <ScrollArea className="h-24">
                                <p className="text-sm whitespace-pre-wrap break-all">{job.description}</p>
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CardFooter className="flex gap-2 p-0">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    <ArrowLeftIcon className="w-4 h-4 mr-2"/>
                    Back
                </Button>
                <Button onClick={onConfirm} className="flex-1">
                    <CheckCircle2 className="w-4 h-4 mr-2"/>
                    Confirm & Apply
                </Button>
            </CardFooter>
        </div>
    );
}

function JobField({
                      icon,
                      label,
                      children,
                  }: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center space-x-2 mb-1 text-sm font-medium">
                {icon}
                <span>{label}</span>
            </div>
            <p className="font-semibold">{children}</p>
        </div>
    );
}