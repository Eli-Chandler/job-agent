import {Button} from "@/components/ui/button.tsx";
import {type LucideIcon, PlusIcon} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Card, CardContent, CardTitle} from "@/components/ui/card.tsx";

export function DashboardHeader({title}: { title: string }) {
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

export function StatCard({title, value, icon: Icon, iconColour}: StatCardProps) {
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