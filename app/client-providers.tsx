"use client";

import dynamic from "next/dynamic";

// ssr:false must be used inside a Client Component.
// This wrapper ensures ConvexReactClient is never instantiated during
// server-side prerendering, where NEXT_PUBLIC_CONVEX_URL is undefined.
const Providers = dynamic(
    () => import("./providers").then((m) => m.Providers),
    { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return <Providers>{children}</Providers>;
}
