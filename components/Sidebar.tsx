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
    { name: "AI", href: "/ai", icon: Sparkles },
];

// ─── Desktop sidebar ────────────────────────────────────────────────────────
export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn("flex flex-col gap-2", className)}>
            <div className="px-3 pt-4">
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
                                        "transition-colors shrink-0",
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

// ─── Mobile bottom tab bar ───────────────────────────────────────────────────
export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[90] md:hidden bg-zinc-950/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-1 py-1">
            {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all flex-1",
                            isActive ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-8 flex items-center justify-center rounded-xl transition-all",
                            isActive ? "bg-blue-500/15" : ""
                        )}>
                            <item.icon
                                size={20}
                                className={cn(
                                    "shrink-0 transition-colors",
                                    isActive ? "text-blue-500" : "text-zinc-500"
                                )}
                            />
                        </div>
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest truncate w-full text-center leading-none",
                            isActive ? "text-blue-500" : "text-zinc-600"
                        )}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
