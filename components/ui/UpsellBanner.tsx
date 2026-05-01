"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { type PlanId, PLAN_LIMITS } from "@/lib/plans";

export function UpsellBanner({
    currentPlan,
    targetPlan = "pro",
    message,
    className = "",
}: {
    currentPlan: PlanId;
    targetPlan?: PlanId;
    message?: string;
    className?: string;
}) {
    if (currentPlan !== "starter") return null;

    const targetLimits = PLAN_LIMITS[targetPlan];

    return (
        <Link
            href="/billing"
            className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all group ${className}`}
        >
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-white">
                    {message ?? `Upgrade to ${targetLimits.label}`}
                </p>
                <p className="text-[10px] text-default-500">
                    {targetLimits.label} starts at {targetLimits.priceUsd} USDC/month
                </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-primary/80">
                Upgrade →
            </span>
        </Link>
    );
}