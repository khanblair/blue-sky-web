"use client";

import { ReactNode } from "react";
import { CardRoot, CardHeader, CardContent } from "@heroui/react";

export function SectionCard({
    icon,
    title,
    subtitle,
    children,
    className = "",
}: {
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <CardRoot className={`bg-surface border-divider border ${className}`}>
            {(icon || title) && (
                <CardHeader className="flex gap-3 p-6">
                    {icon}
                    <div className="flex flex-col text-left">
                        <p className="font-black uppercase tracking-widest text-sm text-white">{title}</p>
                        {subtitle && <p className="text-xs text-default-500">{subtitle}</p>}
                    </div>
                </CardHeader>
            )}
            {(icon || title) && <div className="h-px bg-divider w-full" />}
            <CardContent className="p-6">{children}</CardContent>
        </CardRoot>
    );
}