import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {Outlet} from "react-router";
import {ThemeProvider} from "@/components/theme-provider";

function App() {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Outlet/>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App