import {Button} from "@/components/ui/button.tsx";
import {PlusIcon} from "lucide-react";
import {Link} from "react-router";

export default function AddJobDialog() {
    return (
        <Link to="/dashboard/add-job"><Button size="lg"><PlusIcon/>Add Job</Button></Link>
    )
}
