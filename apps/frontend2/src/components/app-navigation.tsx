import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {JobAgentLogo} from "@/components/ui/job-agent-logo.tsx";
import {
    ChevronUp,
    HouseIcon,
    PlusCircleIcon,
    User2
} from "lucide-react";
import {UserIcon} from "lucide-react";
import {Link} from "react-router";
import {Separator} from "@/components/ui/separator.tsx";
import {useGetCurrentlyAuthenticatedUser} from "@/api/me/me.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";


const items = [
    {
        title: "Overview",
        url: "/dashboard/overview",
        icon: HouseIcon,
    },
    {
        title: "Profile",
        url: "/dashboard/profile",
        icon: UserIcon,
    }
]

export function AppNavigation() {
    const {data: userData, isPending} = useGetCurrentlyAuthenticatedUser();

    return (
        <>
            <Sidebar>
                <SidebarHeader className="h-12 flex items-center justify-center">
                    <JobAgentLogo className="mx-auto select-none"/>

                </SidebarHeader>
                <div className="px-2">
                    <Separator className="bg-primary/20"/>
                </div>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link to={item.url}>
                                                <item.icon/>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                <SidebarMenuItem key="apply">
                                    <SidebarMenuButton asChild>
                                        <Link to={"/dashboard/apply"}>
                                            <PlusCircleIcon className="text-primary"/>
                                            <span className="text-primary">Apply</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem className="flex items-center justify-between gap-2">
                            {
                                isPending ?
                                    (
                                        <Skeleton/>
                                    ) :
                                    (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuButton>
                                                    <User2/> Hello, {userData!.data.first_name}
                                                    <ChevronUp className="ml-auto"/>
                                                </SidebarMenuButton>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                side="top"
                                                className="w-[--radix-popper-anchor-width]"
                                            >
                                                <DropdownMenuItem>
                                                    <span>Account</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <span>Billing</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <span>Sign out</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )
                            }
                            <ModeToggle/>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </>
    )
}