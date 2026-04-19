"use client";

import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function FloatingPostButton() {
    const { user, isLoaded } = useUser();

    if (!isLoaded || !user) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100] group">
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Button
                variant="primary"
                className="w-16 h-16 rounded-full min-w-0 p-0 shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label="Create New Post"
            >
                <Plus size={32} strokeWidth={3} className="text-white" />
            </Button>

            {/* Tooltip-like label */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-background border border-divider rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                Quick Post
            </div>
        </div>
    );
}
