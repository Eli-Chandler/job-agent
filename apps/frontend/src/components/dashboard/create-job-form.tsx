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
import {useCreateJobManual, useGetJobFromUrl} from "@/api/job-listings/job-listings.ts";
import {BuildingIcon, LinkIcon} from "lucide-react";
import {IconInput} from "@/components/ui/icon-input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import type {JobListingDTO, ScrapedJobDTO} from "@/api/models";
import {useState} from "react";
import {Separator} from "@/components/ui/separator.tsx";


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

    // Function to handle scraped job data and populate form
    const handleJobScraped = (scrapedJob: ScrapedJobDTO) => {
        // Populate the form fields with the scraped data
        if (scrapedJob.title) {
            form.setValue("title", scrapedJob.title);
        }
        if (scrapedJob.company) {
            form.setValue("company", scrapedJob.company);
        }
        if (scrapedJob.application_url) {
            form.setValue("application_url", scrapedJob.application_url);
        }
        if (scrapedJob.description) {
            form.setValue("description", scrapedJob.description);
        }

        // Trigger validation after setting values
        form.trigger();
    };

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
        <div className="flex flex-col gap-6">
            <HiringCafeInput onJobScraped={handleJobScraped} />
            <Separator/>
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
                                <FormDescription>Optional but very important for AI Resume/AI Cover
                                    Letter</FormDescription>
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
                        mutation.error && <p className="text-destructive">{errorMessage}</p>
                    }
                </form>
            </Form>
        </div>
    );
}

function HiringCafeInput({onJobScraped}: { onJobScraped: (job: ScrapedJobDTO) => void }) {
    const [url, setUrl] = useState<string | null>(null);
    const hiringCafeMutation = useGetJobFromUrl();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !url.trim()) return;

        try {
            const result = await hiringCafeMutation.mutateAsync({data: {job_url: url}});
            onJobScraped(result.data);
        } catch (error) {
            console.error("Error fetching job:", error);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
                type="url"
                placeholder="https://hiring.cafe/job/..."
                value={url ?? ""}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
            />
            <Button type="submit" disabled={!url || hiringCafeMutation.isPending}>
                {hiringCafeMutation.isPending ? "Fetching..." : "Fetch"}
            </Button>
        </form>
    );
}