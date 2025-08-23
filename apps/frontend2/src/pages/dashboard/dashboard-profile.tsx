import {DashboardHeader} from "@/components/dashboard/dashboard-header.tsx";
import ProfileLinks from "@/components/dashboard/profile/profile-links.tsx";
import {useDeleteProfile, useGetProfile} from "@/api/profiles/profiles.ts";
import CreateProfileCard from "@/components/dashboard/profile/create-profile-card.tsx";
import ApplicantInfo from "@/components/dashboard/profile/applicant-info.tsx";
import ProfileEducations from "@/components/dashboard/profile/profile-educations.tsx";
import ProfileExperiences from "@/components/dashboard/profile/profile-experiences.tsx";
import ProfileProjects from "@/components/dashboard/profile/profile-projects.tsx";
import ProfileSkills from "@/components/dashboard/profile/profile-skills.tsx";
import ProfileCertifications from "@/components/dashboard/profile/profile-certifications.tsx";
import {Button} from "@/components/ui/button.tsx";
import {TrashIcon} from "lucide-react";

export default function DashboardProfile() {
    const {error, isError} = useGetProfile();
    const hasProfile = !(isError && error?.status === 404);

    return (
        <div className="flex flex-col gap-2 w-full">
            <DashboardHeader title="Profile"/>
            {
                hasProfile ?
                    <ProfileContent/>
                    :
                    <CreateProfileCard/>
            }
            <DeleteProfileButton/>
        </div>
    );
}

function ProfileContent() {
    return (
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
            <ApplicantInfo/>
            <ProfileEducations/>
            <ProfileLinks/>
            <ProfileExperiences/>
            <ProfileProjects/>
            <ProfileSkills/>
            <ProfileCertifications/>
        </div>
    )
}

function DeleteProfileButton() {
    const {refetch} = useGetProfile();
    const deleteProfileMutation = useDeleteProfile({
        mutation: {
            onSuccess: () => refetch()
        }
    });

    return (
        <Button
            className="w-fit"
            variant="destructive"
            onClick={() => deleteProfileMutation.mutate()}
        ><TrashIcon/>Delete Profile</Button>
    );
}