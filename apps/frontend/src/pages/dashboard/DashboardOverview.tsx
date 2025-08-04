import {BriefcaseIcon, CalendarIcon, CheckIcon, ClockIcon, XIcon} from "lucide-react";
import {RecentActivity} from "@/components/dashboard/recent-activity.tsx";
import {DashboardHeader} from "@/components/dashboard/dashboard-header.tsx";
import {StatCard} from "@/components/dashboard/stat-card.tsx";

export default function DashboardOverview() {
    const stats = {
        totalApplications: 47,
        pending: 12,
        interviews: 8,
        offers: 3,
        rejected: 24
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <DashboardHeader title={"Overview"}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                <StatCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    icon={BriefcaseIcon}
                    iconColour="text-blue-600"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={ClockIcon}
                    iconColour="text-yellow-600"
                />
                <StatCard
                    title="Interviews"
                    value={stats.interviews}
                    icon={CalendarIcon}
                    iconColour="text-blue-600"
                />
                <StatCard
                    title="Offers"
                    value={stats.offers}
                    icon={CheckIcon}
                    iconColour="text-green-600"
                />
                <StatCard
                    title="Rejected"
                    value={stats.rejected}
                    icon={XIcon}
                    iconColour="text-red-600"
                />
            </div>
            <RecentActivity/>
        </div>
    )
}