import {SiFastapi, SiReact} from "react-icons/si";
import {BiLogoPostgresql} from "react-icons/bi";

export default function FooterBar() {
    return (
        <div className="border-t mt-16">
            <div className="container mx-auto px-4 py-6 text-center flex items-center gap-2 justify-center">
                <p>Powered by Hopes & Dreams</p><SiFastapi/><BiLogoPostgresql/><SiReact/>
            </div>
        </div>
    )
}