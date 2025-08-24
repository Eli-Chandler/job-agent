import {Dashboard, DashboardContent, DashboardHeader} from "@/components/dashboard/dashboard.tsx";
import {useGetProfile} from "@/api/profiles/profiles.ts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import type {JobListingDTO} from "@/api/models";
import CreateJobForm from "@/components/dashboard/applications/create-job-form.tsx";
import {useState} from "react";
import NeedProfileWarning from "@/components/need-profile-warning.tsx";

export default function DashboardApply() {
    const {error, isError} = useGetProfile();
    const hasProfile = !(isError && error?.status === 404);

    if (!hasProfile) {
        return (
            <Dashboard>
                <DashboardContent>
                    <NeedProfileWarning/>
                </DashboardContent>
            </Dashboard>
        )
    }

    return (
        <Dashboard>
            <DashboardHeader title="Apply"/>
            <DashboardContent>
                <ApplyCard/>
            </DashboardContent>
        </Dashboard>

    );
}

function ApplyCard() {
    const [job, setJob] = useState<JobListingDTO | null>(null);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Apply Job</CardTitle>
                <CardDescription>Apply for a new job</CardDescription>
            </CardHeader>
            <CardContent>
                {
                    !job && <CreateJobForm onCreateJob={setJob}/>
                }

            </CardContent>
            <CardFooter>

            </CardFooter>
        </Card>
    )
}
