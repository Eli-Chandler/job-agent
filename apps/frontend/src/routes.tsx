import {
    createBrowserRouter
} from "react-router";
import Layout from "@/Layout";
import App from "@/App.tsx";
import HomePage from "@/pages/HomePage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";

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
                    }
                ]
                //     {
                //         path: "/login",
                //         element: <LoginPage/>
                //     },
                //     {
                //         element: <ProtectedRoute/>,
                //         children: [
                //             {
                //                 path: "/dashboard",
                //                 element: <DashboardPage/>
                //             },
                //             {
                //                 path: "/dashboard/assistant/:assistantId",
                //                 element: <AssistantDashboardPage/>
                //             }
                //         ]
                //     }
                //
                // ]
            }
        ]
    },
]);

// function ProtectedRoute() {
//     const {user, isLoading} = useUser()
//     if (isLoading) return null;
//     if (!user) {
//         return <Navigate to="/login" replace/>;
//     }
//     return <Outlet/>;
// }