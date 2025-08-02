import {useLocation, useNavigate} from "react-router";
import {Card} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

export type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
};

type DashboardSidebarProps = {
  items: NavItem[];
};

export function DashboardSidebar({items}: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.split("/").pop() || "";

  return (
    <aside className="w-64">
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
                onClick={() => navigate(`/dashboard/${item.url}`)}
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
