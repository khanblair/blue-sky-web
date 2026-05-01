"use client";

import { PLAN_LIMITS, type PlanId } from "@/lib/plans";
import { ReactNode } from "react";
import { Lock } from "lucide-react";
import Link from "next/link";

export function PlanGate({
    required,
    currentPlan,
    children,
    fallback,
}: {
    required: PlanId;
    currentPlan: PlanId;
    children: ReactNode;
    fallback?: ReactNode;
}) {
    const planOrder: PlanId[] = ["starter", "lite", "basic", "pro", "standard", "enterprise"];
    const currentIndex = planOrder.indexOf(currentPlan);
    const requiredIndex = planOrder.indexOf(required);

    if (currentIndex >= requiredIndex) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    const requiredLimits = PLAN_LIMITS[required];

    return (
        <div className="relative rounded-2xl border border-divider bg-surface/50 p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="text-primary" size={24} />
            </div>
            <div>
                <p className="font-black uppercase tracking-widest text-sm text-white mb-1">
                    {requiredLimits.label} Feature
                </p>
                <p className="text-xs text-default-500">
                    Upgrade to {requiredLimits.label} to unlock this feature.
                </p>
            </div>
            <Link
                href="/billing"
                className="px-6 h-10 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors inline-flex items-center"
            >
                Upgrade to {requiredLimits.label}
            </Link>
        </div>
    );
}