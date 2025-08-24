import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {Form} from "@/components/ui/form.tsx";
import {useCreateJobManual, useGetJobFromUrl} from "@/api/job-listings/job-listings.ts";
import type {JobListingDTO} from "@/api/models";
import {InputFormField, TextAreaFormField} from "@/components/ui/form-field.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {useState} from "react";
import {extractErrorMessage} from "@/lib/utils.ts";

const createJobFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    company: z.string().min(1, "Company is required"),
    application_url: z.httpUrl("Invalid URL").min(1, "Application URL is required"),
    description: z.string().optional(),
});

interface CreateJobFormProps {
    onCreateJob: (job: JobListingDTO) => void;
}

export default function CreateJobForm({onCreateJob}: CreateJobFormProps) {
    const createJobMutation = useCreateJobManual({
        mutation: {
            onSuccess: (data) => onCreateJob(data.data)
        }
    });
    const [hiringCafeUrl, setHiringCafeUrl] = useState("");
    const hiringCafeMutation = useGetJobFromUrl(
        {
            mutation: {
                onSuccess: (data) => {
                    form.reset({
                        title: data.data.title,
                        company: data.data.company,
                        application_url: data.data.application_url,
                        description: data.data.description || "",
                    });
                }
            }
        }
    );

    const form = useForm<z.infer<typeof createJobFormSchema>>({
        resolver: zodResolver(createJobFormSchema),
    });

    function onSubmit(data: z.infer<typeof createJobFormSchema>) {
        createJobMutation.mutate({data});
    }


    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Label>
                    Autofill from hiring.cafe URL (optional)
                </Label>
                <div className="flex gap-2">
                    <Input type="url" placeholder="https://hiring.cafe/job/..." value={hiringCafeUrl}
                           onChange={(e) => setHiringCafeUrl(e.target.value)}/>
                    <Button disabled={hiringCafeMutation.isPending || !hiringCafeUrl} onClick={() => hiringCafeMutation.mutate({
                        data: {
                            job_url: hiringCafeUrl
                        }
                    })}
                    >{hiringCafeMutation.isPending ? "Autofilling..." : "Autofill"}</Button>
                </div>
                {
                    extractErrorMessage(hiringCafeMutation.error) && <p className="text-destructive text-sm">{extractErrorMessage(hiringCafeMutation.error)}</p>
                }
            </div>
            <Separator/>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <InputFormField
                        control={form.control}
                        name="title"
                        label="Job Title"
                    />
                    <InputFormField
                        control={form.control}
                        name="company"
                        label="Company"
                    />
                    <InputFormField
                        control={form.control}
                        name="application_url"
                        label="Application URL"
                        type="url"
                    />
                    <TextAreaFormField
                        control={form.control}
                        name="description"
                        label="Job Description"
                    />
                    <div className="flex w-full justify-end">
                        <Button type="submit"
                                disabled={createJobMutation.isPending}>{createJobMutation.isPending ? "Submitting..." : "Submit"}</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}