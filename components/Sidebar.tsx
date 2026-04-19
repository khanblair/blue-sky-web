"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Settings,
    Calendar,
    User,
    FileText,
    Sparkles,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Posts", href: "/posts", icon: FileText },
    { name: "AI Settings", href: "/ai", icon: Sparkles },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn("flex flex-col gap-2", className)}>
            <div className="px-3 py-2">
                <h2 className="mb-4 px-4 text-xs font-black uppercase tracking-widest text-zinc-500">
                    Feature Management
                </h2>
                <nav className="flex flex-col gap-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon
                                    size={20}
                                    className={cn(
                                        "transition-colors",
                                        isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto px-3 py-6">
                <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-blue-500 mb-1">Status</p>
                    <p className="text-xs font-bold text-zinc-300">System Online</p>
                </div>
            </div>
        </aside>
    );
}
