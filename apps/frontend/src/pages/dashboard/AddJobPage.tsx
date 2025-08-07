import {defineStepper} from "@/components/ui/stepper";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {DashboardHeader} from "@/components/dashboard/dashboard-header.tsx";
import {useState} from "react";
import type {JobListingDTO} from "@/api/models";
import ApplyForm from "@/components/dashboard/apply-form.tsx";

const {Stepper} = defineStepper(
    {id: "job", title: "Select Job"},
    {id: "application", title: "Application"},
);

export default function AddJobPage() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <DashboardHeader title={"Add Job"}/>
            <Card>
                <CardHeader>
                    <CardTitle>Apply to a new job</CardTitle>
                </CardHeader>
                <CardContent>
                    <AddJobStepper/>
                </CardContent>
            </Card>
        </div>
    );
}

function AddJobStepper() {
    const [job, setJob] = useState<JobListingDTO | undefined>();
    const [resumeId, setResumeId] = useState<number | undefined>();
    const [coverLetter, setCoverLetter] = useState<number | undefined | null>();

    return (
        <Stepper.Provider className="space-y-4 w-full">
            {({methods}) => (
                <>
                    <Stepper.Navigation>
                        {methods.all.map((step) => (
                            <Stepper.Step of={step.id} key={step.id}>
                                {
                                    // step.id === methods.current.id &&
                                    <Stepper.Title>{step.title}</Stepper.Title>
                                }

                            </Stepper.Step>
                        ))}
                    </Stepper.Navigation>

                    {methods.switch({
                        "job": () => <ApplyForm/>,
                        // "job": () => <SelectJobSection onNext={(job) => {
                        //     setJob(job);
                        //     methods.next()
                        // }}/>,
                        "application": () => <ApplyForm/>
                    })}
                </>
            )}
        </Stepper.Provider>
    )
}

