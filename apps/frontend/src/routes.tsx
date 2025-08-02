import {
    createBrowserRouter, Navigate, Outlet
} from "react-router";
import Layout from "@/Layout";
import App from "@/App.tsx";
import HomePage from "@/pages/HomePage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import {useUser} from "@/hooks/use-user.tsx";
import DashboardOverview from "@/pages/dashboard/DashboardOverview.tsx";
import DashboardPage from "@/pages/dashboard/DashboardPage.tsx";
import DashboardProfile from "@/pages/dashboard/DashboardProfile.tsx";

export const router = createBrowserRouter([
    {
        element: <App/>,
        children: [
            {
                element: <Layout/>,
                children: [
                    {
                        path: "/",
                        element: <HomePage/>
                    },
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
                                        path: "applications"
                                    }
                                ]
                            }
                        ]
                    }

                ]
            }
        ]
    },
]);

function ProtectedRoute() {
    const {user, isLoading} = useUser()
    if (isLoading) return null;
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    return <Outlet/>;
}