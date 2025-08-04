import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Database, LogIn} from 'lucide-react';
import {Link} from "react-router";
import {useUser} from "@/hooks/use-user.tsx";

export default function HomePage() {
    const {user} = useUser();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-4">Welcome to Job Agent</h1>

                <p className="text-lg mb-6">
                    Mange the job search in style!
                </p>
                <Link to={user ? "/dashboard" : "/login"}>
                    <Button size="lg"
                            disabled={!user}
                    >
                        <LogIn className="w-4 h-4 mr-2"/>
                        Access Dashboard
                    </Button>
                </Link>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="text-center">
                        <Database className="w-8 h-8 mx-auto mb-2"/>
                        <CardTitle>Data Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            View and edit your data with easy-to-use tools.
                        </CardDescription>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}