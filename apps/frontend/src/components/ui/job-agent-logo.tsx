import {BriefcaseIcon} from "lucide-react";
import {cn} from "@/lib/utils.ts";

interface LeveliLogoProps {
    className?: string;
}

export function JobAgentLogo({ className }: LeveliLogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <BriefcaseIcon className="w-6 h-6" />
            <span className="text-2xl font-semibold">JobAgent</span>
        </div>
    );
}