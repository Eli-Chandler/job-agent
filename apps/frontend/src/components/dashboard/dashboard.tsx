import {CalendarClock, CheckCircle, ZapIcon} from "lucide-react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";

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
                    const {bg, iconColor} = typeStyles[activity.type] || {}

                    return (
                        <Card key={activity.id} className={cn("gap-1", bg)}>
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                <Icon className={`${iconColor} w-5 h-5`}/>
                                <CardTitle className="font-medium">
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