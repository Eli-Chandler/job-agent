"use client"

import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"

import {Button} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {useCreateJobFromUrl, useCreateJobManual} from "@/api/job-listings/job-listings.ts";
import {ArrowLeftIcon, BuildingIcon, LinkIcon} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {IconInput} from "@/components/ui/icon-input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import type {JobListingDTO} from "@/api/models";
import {useState} from "react";
import {JobCard} from "@/components/ui/job-card.tsx";

const hiringCafeFormSchema = z.object({
    jobUrl: z.url()
});

const manualFormSchema = z.object({
    title: z.string().min(1).max(100),
    company: z.string().min(1).max(100),
    application_url: z.url().min(1).max(1000),
    description: z.string().optional()
});

interface CreateJobFormProps {
    onJobCreated: (job: JobListingDTO) => void;
}

export default function CreateJobForm({onJobCreated}: CreateJobFormProps) {
    const [job, setJob] = useState<JobListingDTO | null>(null);

    if (job) {
        return (
            <div className="flex flex-col gap-2">
                <Button className="self-start" variant="ghost" onClick={() => setJob(null)}><ArrowLeftIcon/>Back</Button>
                <JobCard job={job}/>
                <Button className="self-end" onClick={() => onJobCreated(job)}>Submit</Button>
            </div>
        )
    }

    return (
        <Tabs defaultValue="hiringcafe">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hiringcafe">Hiring.Cafe</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
            <TabsContent value="hiringcafe" className="mt-4">
                <HiringCafeForm onJobCreated={setJob}/>
            </TabsContent>
            <TabsContent value="manual" className="mt-4">
                <ManualJobForm onJobCreated={setJob}/>
            </TabsContent>
        </Tabs>
    )
}

function ManualJobForm({onJobCreated}: CreateJobFormProps) {
    const form = useForm<z.infer<typeof manualFormSchema>>({
        resolver: zodResolver(manualFormSchema),
        defaultValues: {
            title: "",
            company: "",
            application_url: "",
            description: ""
        },
    });
    const mutation = useCreateJobManual();
    const errorMessage = mutation.error?.response?.data.detail?.toString() ?? "Something went wrong";


    async function onSubmit(values: z.infer<typeof manualFormSchema>) {
        const result = await mutation.mutateAsync({
            data: {
                title: values.title,
                company: values.company,
                application_url: values.application_url,
                description: values.description
            }
        });
        onJobCreated(result.data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>

                        )}
                    />
                    <FormField
                        control={form.control}
                        name="company"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                    <IconInput icon={BuildingIcon} placeholder="Evil Corp." {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="application_url"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Application URL</FormLabel>
                            <FormControl>
                                <IconInput icon={LinkIcon} placeholder="https://company.com/job/..." {...field} />
                            </FormControl>
                            <FormDescription>The URL to apply with. (Important to get this right for AI
                                Apply)</FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="https://company.com/job/..." {...field} />
                            </FormControl>
                            <FormDescription>Optional but very important for AI Resume/AI Cover Letter</FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit"
                        disabled={!form.formState.isValid || mutation.isPending}>
                        {mutation.isPending ? "Sumibtting..." : "Submit"}
                    </Button>
                </div>
                {
                    errorMessage && <p className="text-destructive">{errorMessage}</p>
                }
            </form>
        </Form>
    )
        ;
}

function HiringCafeForm({onJobCreated}: CreateJobFormProps) {
    const mutation = useCreateJobFromUrl();
    const form = useForm<z.infer<typeof hiringCafeFormSchema>>({
        resolver: zodResolver(hiringCafeFormSchema),
        defaultValues: {
            jobUrl: ""
        },
    });

    const errorMessage = mutation.error?.response?.data.detail?.toString() ?? "Something went wrong"

    async function onSubmit(values: z.infer<typeof hiringCafeFormSchema>) {
        const result = await mutation.mutateAsync({
            data: {job_url: values.jobUrl}
        });
        onJobCreated(result.data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="jobUrl"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Hiring.cafe Job Listing URL</FormLabel>
                            <FormControl>
                                <IconInput icon={LinkIcon} placeholder="https://hiring.cafe/job/..." {...field} />
                            </FormControl>
                            <FormDescription className="flex gap-0.5 items-center">
                                Job URL when pressing Share → Copy Link
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={!form.formState.isValid || mutation.isPending}>
                        {mutation.isPending ? "Fetching..." : "Fetch"}
                    </Button>
                </div>
                {
                    errorMessage && <p className="text-destructive">{errorMessage}</p>
                }
            </form>
        </Form>
    );
}


