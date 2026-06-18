"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingPostButton } from "@/components/FloatingPostButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { InstallPWAPopup } from "@/components/ServiceWorkerRegistration";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <FloatingPostButton />
            <ScrollToTop />
            <InstallPWAPopup />
        </div>
    );
}
