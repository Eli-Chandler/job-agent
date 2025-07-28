import {LogIn, LucideLayoutDashboard} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router";
import {JobAgentLogo} from "@/components/ui/job-agent-logo.tsx";

export default function NavBar() {
    const user = undefined // useUser();

    console.log(user)

    return (
        <div className="w-full bg-background/80 backdrop-blur px-4 py-2 flex items-center justify-between border-b">
            <Link to={"/"} className="flex flex-row items-center gap-2">
                <JobAgentLogo/>
            </Link>

            <Button asChild>
                {
                    user ? (
                            <Link to={"/dashboard"}>
                                <LucideLayoutDashboard className="w-4 h-4"/>
                                Dashboard
                            </Link>

                        )
                        :
                        (
                            <Link to={"/login"}>
                                <LogIn className="w-4 h-4 mr-2"/>
                                Sign In
                            </Link>
                        )
                }

            </Button>

        </div>
    );
}