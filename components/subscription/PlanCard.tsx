"use client";

import { type PlanId, PLAN_LIMITS } from "@/lib/plans";
import { Check } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function PlanCard({
    planId,
    isCurrent = false,
    onSelect,
    billingCycle = "monthly",
}: {
    planId: PlanId;
    isCurrent?: boolean;
    onSelect?: () => void;
    billingCycle?: "monthly" | "quarterly" | "yearly";
}) {
    const plan = PLAN_LIMITS[planId];
    const isFree = planId === "starter";
    const isPopular = planId === "pro";

    const price = isFree
        ? "Free"
        : billingCycle === "yearly"
            ? `$${plan.priceUsd * 10}`
            : billingCycle === "quarterly"
                ? `$${Math.round(plan.priceUsd * 2.8)}`
                : `$${plan.priceUsd}`;

    const cycleLabel = isFree
        ? ""
        : billingCycle === "yearly"
            ? "/yr"
            : billingCycle === "quarterly"
                ? "/qtr"
                : "/mo";

    return (
        <div className={`relative flex flex-col gap-6 p-8 rounded-3xl border transition-all ${
            isCurrent
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : isPopular
                    ? "border-primary/30 bg-primary/[0.03]"
                    : "border-divider hover:border-primary/30 bg-surface"
        }`}>
            {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-primary text-[9px] font-bold text-white uppercase tracking-widest">
                        Current Plan
                    </span>
                </div>
            )}
            {isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-primary text-[9px] font-bold text-white uppercase tracking-widest">
                        Popular
                    </span>
                </div>
            )}
            <div>
                <h3 className="text-lg font-black uppercase tracking-widest text-white">{plan.label}</h3>
                <p className="text-xs text-zinc-500 mt-1">{plan.description}</p>
            </div>

            <div className="text-center">
                <span className="text-4xl font-black text-white">{price}</span>
                <span className="text-sm text-zinc-500">{cycleLabel}</span>
            </div>

            <div className="flex flex-col gap-2">
                {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                        <Check size={14} className={isPopular ? "text-primary shrink-0 mt-0.5" : "text-zinc-600 shrink-0 mt-0.5"} />
                        <span className="text-sm text-zinc-400">{feature}</span>
                    </div>
                ))}
            </div>

            {onSelect ? (
                <button
                    onClick={onSelect}
                    disabled={isCurrent}
                    className={`w-full h-11 rounded-xl font-bold text-sm text-center flex items-center justify-center transition-all ${
                        isCurrent
                            ? "bg-white/[0.06] text-zinc-400 border border-white/10 cursor-default"
                            : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95"
                    }`}
                >
                    {isCurrent ? "Current Plan" : `Choose ${plan.label}`}
                </button>
            ) : (
                <Link
                    href={isFree ? "/sign-up" : "/billing"}
                    className="w-full h-11 rounded-xl font-bold text-sm text-center flex items-center justify-center transition-all bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                    {isFree ? "Get Started" : `Choose ${plan.label}`}
                </Link>
            )}
        </div>
    );
}