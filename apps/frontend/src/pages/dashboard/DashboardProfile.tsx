import PersonalInformation from "@/components/dashboard/personal-information.tsx";
import SocialLinks from "@/components/dashboard/social-links.tsx";
import ResumeManagement from "@/components/dashboard/resume-management.tsx";
import {DashboardHeader} from "@/components/dashboard/dashboard-header.tsx";


export default function DashboardProfile() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <DashboardHeader title={"Candidate Profile"}/>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PersonalInformation/>
                <SocialLinks/>
                <ResumeManagement/>
            </div>
        </div>
    );
}
