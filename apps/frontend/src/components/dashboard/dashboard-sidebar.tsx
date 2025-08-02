import {useLocation, useNavigate} from "react-router";
import {Card} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

export type NavItem = {
    title: string;
    url: string;
    icon: React.ElementType;
};

type NavProps = {
    items: NavItem[];
};

// Sidebar for md+ screens
export function DashboardSidebar({items}: NavProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname.split("/").pop() || "";

    async function handleClick(url: string) {
        await navigate(`/dashboard/${url}`)
    }

    return (
        <aside className="hidden md:block w-64">
            <Card className="p-4 h-full">
                <nav className="space-y-2">
                    {items.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = currentPath === item.url;

                        return (
                            <Button
                                key={item.url}
                                variant="ghost"
                                size="xl"
                                onClick={() => handleClick(item.url)}
                                className={`justify-start w-full gap-2 flex items-center transition-colors ${
                                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                                }`}
                            >
                                <IconComponent className="w-5 h-5"/>
                                <span>{item.title}</span>
                            </Button>
                        );
                    })}
                </nav>
            </Card>
        </aside>
    );
}

// Bottom tab bar for mobile - now floating and consistent with sidebar
export function DashboardBottomTabs({items}: NavProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname.split("/").pop() || "";

    async function handleClick(url: string) {
        await navigate(`/dashboard/${url}`)
        window.scrollTo(0, 0);
    }


    return (
        <div className="fixed bottom-2 left-4 right-4 z-50 md:hidden backdrop-blur-sm">
            <Card className="p-2 bg-background/10">
                <nav className="flex justify-around">
                    {items.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = currentPath === item.url;

                        return (
                            <Button
                                key={item.url}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClick(item.url)}
                                className={`flex flex-col items-center gap-1 px-3 flex-1 py-2 h-auto transition-colors ${
                                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                                }`}
                            >
                                <IconComponent className="w-5 h-5"/>
                                <span className="text-xs">{item.title}</span>
                            </Button>
                        );
                    })}
                </nav>
            </Card>
        </div>
    );
}

// Wrapper component that renders both depending on screen size
export function DashboardNavigation({items}: NavProps) {
    return (
        <>
            <DashboardSidebar items={items}/>
            <DashboardBottomTabs items={items}/>
        </>
    );
}