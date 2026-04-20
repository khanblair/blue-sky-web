"use client";

import { useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function FeaturesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useConvexAuth();
    const user = useQuery(api.users.getCurrentUser);
    const syncUser = useMutation(api.users.syncUser);
    const router = useRouter();
    const pathname = usePathname();
    const syncChecked = useRef(false);

    useEffect(() => {
        // 1. If user is null (authenticated but not in Convex), sync them.
        // Guard with isAuthenticated so the mutation is only called once
        // Convex has a valid auth token — prevents "Not authenticated" errors.
        if (isAuthenticated && user === null && !syncChecked.current) {
            syncChecked.current = true;
            syncUser();
        }

        // 2. If user exists but has no handle, they haven't finished onboarding.
        // Redirect them to onboarding (unless already there).
        if (user && !user.handle && pathname !== "/onboarding") {
            router.push("/onboarding");
        }
    }, [isAuthenticated, user, syncUser, router, pathname]);

    if (user === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-10">
            <Sidebar className="w-full md:w-64 h-auto md:h-[calc(100vh-8rem)] sticky top-32 shrink-0 hidden md:flex" />
            <div className="flex-grow min-w-0">
                {children}
            </div>
        </div>
    );
}
