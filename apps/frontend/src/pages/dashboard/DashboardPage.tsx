import {Outlet} from "react-router";

import {DashboardSidebar} from "@/components/dashboard/dashboard-sidebar.tsx";
import {BriefcaseIcon, HomeIcon, MailIcon, UserIcon} from "lucide-react";

export default function DashboardPage() {

    const sideBarItems = [
        {
            title: "Home",
            url: "overview",
            icon: HomeIcon,
        },
        {
            title: "Job Applications",
            url: "applications",
            icon: BriefcaseIcon,
        },
        {
            title: "Candidate Profile",
            url: "profile",
            icon: UserIcon
        },
        {
            title: "Mail Box",
            url: "mail",
            icon: MailIcon,
        }
    ]

    return (
        <div className="flex gap-4">
            <DashboardSidebar items={sideBarItems}/>
            <Outlet/>
        </div>
    );
}




