import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router";
import {JobAgentLogo} from "@/components/ui/job-agent-logo.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Label} from "@/components/ui/label.tsx";
import {IconInput} from "@/components/ui/icon-input.tsx";
import {LockIcon, MailIcon, PhoneIcon, UserIcon} from "lucide-react";
import {useState} from "react";
import {useLoginAuthTokenPost, useRegisterAuthRegisterPost} from "@/api/auth/auth.ts";

export default function LoginPage() {
    return (
        <div className="flex justify-center">
            <Card>
                <CardHeader>
                    <JobAgentLogo className="mx-auto mb-4"/>
                    <CardTitle>
                        Login or Sign Up
                    </CardTitle>
                    <CardDescription>
                        Access your JobAgent dashboard to manage your candidate profile, job applications, resumes, and
                        more.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="signup" className="w-[400px]">
                        <TabsList>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="login">Log In</TabsTrigger>
                        </TabsList>
                        <TabsContent value="signup">
                            <SignupTab/>
                        </TabsContent>
                        <TabsContent value="login">
                            <LoginTab/>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="gap-4">
                    <TermsLink/>
                    <PrivacyLink/>
                </CardFooter>
            </Card>
        </div>
    )
}

function SignupTab() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const mutation = useRegisterAuthRegisterPost({
      mutation: {
        onSuccess: (data) => { console.log("Registration successful", data); },
        onError: (error) => {
            console.error(error.response?.data.detail)
            setErrorMessage(error.response?.data.detail?.toString() || "Unknown error")
            console.log(errorMessage)
        }
      }
    });

    const isFormValid = firstName && lastName && email && phone && password && confirmPassword && password === confirmPassword;

    async function handleSubmit() {
        mutation.mutate({
            data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: email,
                password: password
            }
        })
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <IconInput
                        id="first-name"
                        type="text"
                        icon={UserIcon}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <IconInput
                        id="last-name"
                        type="text"
                        icon={UserIcon}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <IconInput
                    id="email"
                    type="email"
                    icon={MailIcon}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johndoe@example.com"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <IconInput
                    id="phone"
                    type="text"
                    icon={PhoneIcon}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 23 456 7890"
                />
                <p className="text-xs text-muted-foreground">
                    Used for filling out job applications, we will not contact you.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <IconInput
                    id="password"
                    type="password"
                    icon={LockIcon}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a secure password"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <IconInput
                    id="confirm-password"
                    type="password"
                    icon={LockIcon}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                />
                {
                    password !== confirmPassword &&
                    <p className="text-xs text-destructive">
                        Password does not match.
                    </p>
                }

            </div>

            <Button onClick={handleSubmit} disabled={!isFormValid || mutation.isPending}>Sign Up</Button>
            {
                errorMessage && <p className="text-destructive">{errorMessage}</p>
            }
        </div>
    );
}

function LoginTab() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const mutation = useLoginAuthTokenPost({
      mutation: {
        onSuccess: (data) => { console.log(data) },
        onError: (error) => {
            console.error(error.response?.data.detail)
            setErrorMessage(error.response?.data.detail?.toString() || "Unknown error")
            console.log(errorMessage)
        }
      }
    });

    function handleClick() {
        mutation.mutate({
            data: {
                username: email,
                password: password
            }
        })
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <IconInput
                    id="email"
                    type="email"
                    icon={MailIcon}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <IconInput
                    id="password"
                    type="password"
                    icon={LockIcon}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                />
            </div>
            <Button onClick={handleClick}>Log In</Button>
        </div>
    );
}


function TermsLink() {
    return (
        <Button className="px-0.5" variant="link" asChild>
            <Link to={"/terms"}>
                Terms of Service
            </Link>
        </Button>
    );
}

function PrivacyLink() {
    return (
        <Button className="px-0.5" variant="link" asChild>
            <Link to={"/privacy"}>
                Privacy Policy
            </Link>
        </Button>
    );
}