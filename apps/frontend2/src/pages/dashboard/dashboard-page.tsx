import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {Outlet} from "react-router";
import {AppNavigation} from "@/components/app-navigation.tsx";


export default function DashboardPage() {
    return (

        <SidebarProvider>
            <AppNavigation/>
            <main className="w-full px-4">
                <Outlet/>
            </main>
        </SidebarProvider>


    )
}