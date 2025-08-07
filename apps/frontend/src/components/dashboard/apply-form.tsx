import {z} from "zod"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {useGetResumes} from "@/api/me/me.ts";
import {ResumeCard} from "@/components/dashboard/resume-management.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeftRightIcon, SparklesIcon} from "lucide-react";
import {MinimalTiptapEditor} from "@/components/ui/minimal-tiptap";

const applyFormSchema = z.object({
    resume_id: z.number().nonnegative(),
    cover_letter_id: z.number().nonnegative().optional(),
    ai_apply: z.boolean()
})


export default function ApplyForm() {
    const form = useForm<z.infer<typeof applyFormSchema>>({
        resolver: zodResolver(applyFormSchema),
        defaultValues: {
            ai_apply: true
        },
    });

    const {data: resumesData, isLoading: resumesIsLoading} = useGetResumes();
    const resumes = resumesData?.data;

    const watchedResumeId = form.watch("resume_id");
    const selectedResume = resumes?.find(r => r.id.toString() === watchedResumeId?.toString());

    return (
        <Form {...form}>
            <form onSubmit={() => {
            }} className="space-y-8">
                <FormField
                    control={form.control}
                    name="resume_id"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Resume</FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex flex-col gap-2 items-start">
                                        <Button className="w-auto"><SparklesIcon/>Generate Resume</Button>
                                        <Select disabled={resumesIsLoading} onValueChange={field.onChange}
                                                value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Resume"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    resumes && resumes.map((resume) => {
                                                        return (
                                                            <SelectItem value={resume.id.toString()}
                                                                        key={resume.id}>{resume.name}</SelectItem>
                                                        )
                                                    })
                                                }
                                            </SelectContent>

                                        </Select>
                                        {/*<ArrowLeftRightIcon/>*/}

                                    </div>
                                    {selectedResume && <ResumeCard resume={selectedResume}/>}
                                </div>
                            </FormControl>
                        </FormItem>
                    )}/>
                <FormField
                    control={form.control}
                    name="cover_letter_id"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex flex-col gap-2 items-start">
                                        <Button className="w-auto"><SparklesIcon/>Generate Cover Letter</Button>
                                        <MinimalTiptapEditor editorClassName="min-h-40"/>

                                    </div>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}/>
            </form>
        </Form>
    )
}