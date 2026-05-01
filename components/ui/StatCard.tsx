"use client";

import { ReactNode } from "react";
import { CardRoot, CardContent } from "@heroui/react";

export function StatCard({
    icon,
    label,
    value,
    badge,
    badgeColor = "default",
    className = "",
}: {
    icon: ReactNode;
    label: string;
    value: string | number;
    badge?: string;
    badgeColor?: "default" | "success" | "warning" | "danger" | "primary";
    className?: string;
}) {
    return (
        <CardRoot className={`bg-surface border border-divider/50 ${className}`}>
            <CardContent className="flex flex-row items-center gap-4 p-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    badgeColor === "success" ? "bg-success/10" :
                    badgeColor === "warning" ? "bg-warning/10" :
                    badgeColor === "danger" ? "bg-danger/10" :
                    badgeColor === "primary" ? "bg-primary/10" :
                    "bg-default-100"
                }`}>
                    {icon}
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="text-[9px] text-default-500 font-black uppercase tracking-widest mb-1 opacity-70">{label}</p>
                    <p className="text-lg font-black tracking-tight truncate leading-none text-white">{value}</p>
                    {badge && (
                        <p className="text-[10px] text-default-400 font-bold mt-1">{badge}</p>
                    )}
                </div>
            </CardContent>
        </CardRoot>
    );
}