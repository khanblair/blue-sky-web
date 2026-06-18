"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminNav } from "./_components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const user = useQuery(api.users.getCurrentUser);
    const router = useRouter();

    useEffect(() => {
        if (authLoading || user === undefined) return;
        if (!isAuthenticated || user === null) { router.replace("/sign-in"); return; }
        if (user.role !== "admin") router.replace("/dashboard");
    }, [isAuthenticated, authLoading, user, router]);

    if (authLoading || user === undefined) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b" }}>
                <Loader2 size={22} style={{ color: "#3b82f6" }} className="animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !user || user.role !== "admin") return null;

    return (
        <div style={{ minHeight: "100vh", background: "#09090b", color: "#fff", display: "flex" }}>
            <AdminNav />
            <main style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
                {children}
            </main>
        </div>
    );
}
