// import NavBar from "@/components/nav-bar";
import {Outlet} from "react-router";
// import FooterBar from "@/components/footer-bar";

export default function Layout() {
    return (
        <>
            <div className="min-h-screen">
                {/*<header className="fixed top-0 w-full z-50">*/}
                {/*    <NavBar/>*/}
                {/*</header>*/}

                <div className="p-4 relative">
                    <Outlet/>
                </div>
            </div>

            {/*<footer className="mb-20">*/}
            {/*    <FooterBar/>*/}
            {/*</footer>*/}
        </>
    );
}