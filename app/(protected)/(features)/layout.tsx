"use client";

import { Sidebar } from "@/components/Sidebar";

export default function FeaturesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row gap-10">
            <Sidebar className="w-full md:w-64 h-auto md:h-[calc(100vh-8rem)] sticky top-24 shrink-0 hidden md:flex" />
            <div className="flex-grow min-w-0">
                {children}
            </div>
        </div>
    );
}
