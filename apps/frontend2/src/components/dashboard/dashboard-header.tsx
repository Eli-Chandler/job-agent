import {Separator} from "@/components/ui/separator.tsx";
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";

// import AddJobDialog from "@/components/dashboard/add-job-dialog.tsx";

export function DashboardHeader({title}: { title: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 h-12">
                <SidebarTrigger/>
                <h1 className="text-2xl font-semibold text-primary">
                    {title}
                </h1>
            </div>
            <Separator className="bg-primary/20"/>
        </div>
    )
}