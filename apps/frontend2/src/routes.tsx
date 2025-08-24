import {
    createBrowserRouter, Navigate, Outlet
} from "react-router";
import App from "@/App.tsx";
import LoginPage from "@/pages/login-page.tsx";
import DashboardPage from "@/pages/dashboard/dashboard-page.tsx";
import DashboardOverview from "@/pages/dashboard/dashboard-overview.tsx";
import {useGetCurrentlyAuthenticatedUser} from "@/api/me/me.ts";
import DashboardProfile from "@/pages/dashboard/dashboard-profile.tsx";
import DashboardApply from "@/pages/dashboard/dashboard-apply.tsx";

export const router = createBrowserRouter([
    {
        element: <App/>,
        children: [
            {
                path: "/login",
                element: <LoginPage/>
            },
            {
                element: <ProtectedRoute/>,
                children: [
                    {
                        path: "/dashboard",
                        element: <DashboardPage/>,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="overview" replace/>
                            },
                            {
                                path: "overview",
                                element: <DashboardOverview/>
                            },
                            {
                                path: "profile",
                                element: <DashboardProfile/>
                            },
                            {
                                path: "apply",
                                element: <DashboardApply/>
                            }
                            // {
                            //     path: "applications"
                            // },
                            // {
                            //     path: "add-job",
                            //     element: <AddJobPage/>
                            // }
                        ]
                    }
                ]
            }

        ]
    }]
);

function ProtectedRoute() {
    const {data, isPending} = useGetCurrentlyAuthenticatedUser();
    const user = data?.data;
    if (isPending) return null;
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    return <Outlet/>;
}