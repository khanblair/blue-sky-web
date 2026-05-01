"use client";

import { ReactNode } from "react";

export function PageHeader({
    title,
    subtitle,
    className = "",
}: {
    title: string;
    subtitle?: string;
    className?: string;
}) {
    return (
        <header className={className}>
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase text-white">{title}</h1>
            {subtitle && <p className="text-default-500">{subtitle}</p>}
        </header>
    );
}

export function SectionHeader({
    icon,
    title,
    subtitle,
    className = "",
}: {
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    className?: string;
}) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {icon}
            <div className="flex flex-col text-left">
                <p className="font-black uppercase tracking-widest text-sm text-white">{title}</p>
                {subtitle && <p className="text-xs text-default-500">{subtitle}</p>}
            </div>
        </div>
    );
}