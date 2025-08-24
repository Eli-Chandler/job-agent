import {useGetCurrentlyAuthenticatedUser} from "@/api/me/me.ts";
import {DashboardHeader} from "@/components/dashboard/dashboard.tsx";

export default function DashboardOverview() {
    const {data, isLoading, isFetching, isError, error} = useGetCurrentlyAuthenticatedUser();

    console.log("DashboardOverview", {data, isLoading, isFetching, isError, error});

    const user = data?.data;
    console.log("DashboardOverview user", user);

    return (
        <DashboardHeader title="Overview"/>
    );
}