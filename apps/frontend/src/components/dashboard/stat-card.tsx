import type {LucideIcon} from "lucide-react";
import {Card, CardContent, CardTitle} from "@/components/ui/card.tsx";

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