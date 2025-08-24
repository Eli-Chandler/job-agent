import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {PlusIcon} from "lucide-react";
import {Link} from "react-router";

export default function NeedProfileWarning() {
    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle className="text-destructive">
                    You need to create a profile before using this feature.
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                    Your profile is used to generate resumes, cover letters, and fill out applications.
                </CardDescription>
            </CardContent>
            <CardFooter>
                <Link to="/dashboard/profile">
                    <Button><PlusIcon/>Create Profile</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}