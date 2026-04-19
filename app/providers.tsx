"use client";

import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { HeroUIProvider } from "@heroui/system";
import { useMemo } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const convex = useMemo(
        () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
        [],
    );

    return (
        <HeroUIProvider>
            <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    {children}
                </ConvexProviderWithClerk>
            </ClerkProvider>
        </HeroUIProvider>
    );
}
