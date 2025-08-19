import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {DashboardHeader} from "@/components/dashboard/dashboard-header.tsx";
import {useState} from "react";
import type {JobListingDTO} from "@/api/models";
import CreateJobForm from "@/components/dashboard/create-job-form.tsx";
import ApplyForm from "@/components/dashboard/apply-form.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeftIcon} from "lucide-react";

export default function AddJobPage() {
    const [job, setJob] = useState<JobListingDTO | null>(null);
    const [resumeId, setResumeId] = useState<number | null>(null);
    const [coverLetterId, setCoverLetterId] = useState<number | null>(null);
    const [aiApply, setAiApply] = useState<boolean>(true);

    const step = job ? "apply" : "create";

    return (
        <div className="flex flex-col gap-4 w-full">
            <DashboardHeader title={"Add Job"}/>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Apply to a new job
                    </CardTitle>

                </CardHeader>
                <CardContent>
                    {step == "create" && <CreateJobForm onJobCreated={setJob}/>}
                    {step == "apply" && <ApplyForm/>}
                </CardContent>
            </Card>
        </div>
    );
}