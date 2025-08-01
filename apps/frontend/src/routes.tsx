import {
    createBrowserRouter, Navigate, Outlet
} from "react-router";
import Layout from "@/Layout";
import App from "@/App.tsx";
import HomePage from "@/pages/HomePage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import {useUser} from "@/hooks/use-user.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";

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
                                element: <DashboardPage/>
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