import {Separator} from "@/components/ui/separator.tsx";
import AddJobDialog from "@/components/dashboard/add-job-dialog.tsx";

export function DashboardHeader({title}: { title: string }) {
    return (
        <div className="w-full">
            <div className="w-full flex justify-between mb-2">
                <h1 className="text-4xl font-bold text-primary">{title}</h1>
                <AddJobDialog/>
            </div>
            <Separator/>
        </div>
    )
}