import {DashboardHeader} from "@/ui/dashboard.tsx";
import PersonalInformation from "@/components/dashboard/personal-information.tsx";
import SocialLinks from "@/components/dashboard/social-links.tsx";


export default function DashboardProfile() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <DashboardHeader title={"Candidate Profile"}/>
            <PersonalInformation/>
            <SocialLinks/>
        </div>

    )


}
