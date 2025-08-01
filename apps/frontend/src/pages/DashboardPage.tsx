import {useState} from "react";
import {
    BriefcaseIcon, CalendarClock,
    CalendarIcon, CheckCircle,
    CheckIcon,
    ClockIcon,
    HomeIcon,
    type LucideIcon,
    MailIcon,
    PlusIcon, XIcon, ZapIcon
} from "lucide-react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";

export default function DashboardPage() {
    return (
        <div className="flex gap-4">
            <DashboardSidebar/>
            <DashboardOverview/>
        </div>
    );
}

function DashboardHeader({title}: { title: string }) {
    return (
        <div className="w-full">
            <div className="w-full flex justify-between mb-2">
                <h1 className="text-4xl font-bold text-primary">{title}</h1>
                <Button size="lg"><PlusIcon/>Add Job</Button>
            </div>
            <Separator/>
        </div>
    )
}

type StatCardProps = {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColour: string;
};

function StatCard({title, value, icon: Icon, iconColour}: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <p className="text-3xl font-bold  mt-2">{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${iconColour}`}/>
            </CardContent>
        </Card>
    );
}

const activities = [
  {
    id: 1,
    type: "offer",
    title: "Offer received from Digital Agency",
    subtitle: "React Developer position",
    timestamp: "2 hours ago",
    icon: CheckCircle,
  },
  {
    id: 2,
    type: "auto-applied",
    title: "Auto-applied to 3 new positions",
    subtitle: "Via hiring.cafe integration",
    timestamp: "4 hours ago",
    icon: ZapIcon,
  },
  {
    id: 3,
    type: "interview",
    title: "Interview scheduled with TechCorp Inc.",
    subtitle: "Technical interview on Aug 5, 2024",
    timestamp: "1 day ago",
    icon: CalendarClock,
  },
]

const typeStyles: Record<
  string,
  { bg: string; iconColor: string }
> = {
  offer: {
    bg: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  "auto-applied": {
    bg: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  interview: {
    bg: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          const { bg, iconColor } = typeStyles[activity.type] || {}

          return (
            <Card key={activity.id} className={bg}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Icon className={`${iconColor} w-5 h-5`} />
                <CardTitle className="text-base font-medium">
                  {activity.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                {activity.subtitle}
              </CardContent>
              <CardFooter className="text-xs">
                {activity.timestamp}
              </CardFooter>
            </Card>
          )
        })}
      </CardContent>
    </Card>
  )
}




function DashboardOverview() {
    const stats = {
        totalApplications: 47,
        pending: 12,
        interviews: 8,
        offers: 3,
        rejected: 24
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <DashboardHeader title={"Overview"}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                <StatCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    icon={BriefcaseIcon}
                    iconColour="text-blue-600"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={ClockIcon}
                    iconColour="text-yellow-600"
                />
                <StatCard
                    title="Interviews"
                    value={stats.interviews}
                    icon={CalendarIcon}
                    iconColour="text-blue-600"
                />
                <StatCard
                    title="Offers"
                    value={stats.offers}
                    icon={CheckIcon}
                    iconColour="text-green-600"
                />
                <StatCard
                    title="Rejected"
                    value={stats.rejected}
                    icon={XIcon}
                    iconColour="text-red-600"
                />
            </div>
            <RecentActivity/>
        </div>
    )
}

function DashboardSidebar() {
    const items = [
        {
            title: "Home",
            url: "#home",
            icon: HomeIcon,
        },
        {
            title: "Job Applications",
            url: "#applications",
            icon: BriefcaseIcon,
        },
        {
            title: "Mail Box",
            url: "#mail",
            icon: MailIcon,
        }
    ]

    const [activeTab, setActiveTab] = useState('home')

    return (
        <aside className="w-64">
            <Card className="p-4 h-full">
                <nav className="space-y-2">
                    {items.map((item) => {
                        const IconComponent = item.icon
                        const isActive = activeTab === item.url.replace('#', '')

                        return (
                            <button
                                key={item.url}
                                onClick={() => setActiveTab(item.url.replace('#', ''))}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                    isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                                }`}
                            >
                                <IconComponent className="w-5 h-5"/>
                                <span>{item.title}</span>
                            </button>
                        )
                    })}
                </nav>
            </Card>
        </aside>
    )
}