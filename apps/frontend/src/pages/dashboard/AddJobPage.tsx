import {defineStepper} from "@/components/ui/stepper";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import CreateJobForm from "@/components/dashboard/create-job-form.tsx";

const {Stepper} = defineStepper(
    {id: "job", title: "Job"},
    {id: "resume", title: "Resume"},
    {id: "cover-letter", title: "Cover Letter"},
    {id: "apply", title: "Apply"}
);

export default function AddJobPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Apply to a new job
                </CardTitle>
            </CardHeader>
            <Stepper.Provider className="space-y-4 w-full px-3 max-w-screen sm:max-w-xl mx-auto">
                {({methods}) => (
                    <>
                        <Stepper.Navigation>
                            {methods.all.map((step) => (
                                <Stepper.Step of={step.id} onClick={() => methods.goTo(step.id)}>
                                    <Stepper.Title>{step.title}</Stepper.Title>
                                </Stepper.Step>
                            ))}
                        </Stepper.Navigation>
                        {methods.switch({
                            "job": () => <AddJobSection/>,
                            "resume": (step) => <Content id={step.id}/>,
                            "cover-letter": (step) => <Content id={step.id}/>,
                        })}
                        <Stepper.Controls>
                            {!methods.isLast && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={methods.prev}
                                    disabled={methods.isFirst}
                                >
                                    Previous
                                </Button>
                            )}
                            <Button onClick={methods.isLast ? methods.reset : methods.next}>
                                {methods.isLast ? "Reset" : "Next"}
                            </Button>
                        </Stepper.Controls>
                    </>
                )}
            </Stepper.Provider>
        </Card>
    );
}

function AddJobSection() {
    return (
        <CreateJobForm/>
    );
}

const Content = ({id}: { id: string }) => {
    return (
        <Stepper.Panel className="h-[200px] content-center rounded border bg-slate-50 p-8">
            <p className="text-xl font-normal">Content for {id}</p>
        </Stepper.Panel>
    );
};