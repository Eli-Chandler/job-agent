import NavBar from "@/components/nav-bar";
import {Outlet} from "react-router";
import FooterBar from "@/components/footer-bar";

export default function Layout() {
    return (
        <>
            <div className="min-h-screen">
                <header className="fixed top-0 w-full z-50">
                    <NavBar/>
                </header>

                <div className="pt-16 px-4 relative max-w-[1600px] mx-auto">
                    <Outlet/>
                </div>
            </div>

            <footer className="mb-20">
                <FooterBar/>
            </footer>
        </>
    );
}