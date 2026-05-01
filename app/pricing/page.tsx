"use client";

import Link from "next/link";
import { ArrowRight, Zap, Sparkles, Shield, Crown, Globe, Feather } from "lucide-react";
import { PLAN_IDS, type PlanId, PLAN_LIMITS } from "@/lib/plans";
import { useUser } from "@clerk/nextjs";

const planIcons: Record<PlanId, React.ReactNode> = {
    starter: <Zap size={28} className="text-zinc-400 mx-auto" />,
    lite: <Feather size={28} className="text-sky-400 mx-auto" />,
    basic: <Shield size={28} className="text-emerald-400 mx-auto" />,
    pro: <Sparkles size={28} className="text-primary mx-auto" />,
    standard: <Globe size={28} className="text-violet-400 mx-auto" />,
    enterprise: <Crown size={28} className="text-amber-400 mx-auto" />,
};

export default function PricingPage() {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-black text-white">
            <section className="flex flex-col items-center justify-center py-20 px-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.08] border border-primary/20 mb-8">
                    <span className="text-xs font-bold tracking-widest uppercase text-primary">Simple Crypto Pricing</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-center mb-4">
                    Pay with crypto. <span className="text-primary">No credit card.</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl text-center mb-16">
                    Six tiers. USDC, ETH, or BTC. No Stripe, no surprises. Upgrade or cancel anytime.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
                    {PLAN_IDS.map((planId) => {
                        const plan = PLAN_LIMITS[planId];
                        const isPopular = planId === "pro";
                        return (
                            <div key={planId} className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
                                isPopular
                                    ? "border-primary/30 bg-primary/[0.03] shadow-xl shadow-primary/10"
                                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                            }`}>
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-[9px] font-bold text-white uppercase tracking-widest whitespace-nowrap">
                                        Most Popular
                                    </div>
                                )}

                                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                    {planIcons[planId]}
                                </div>

                                <h3 className="text-center font-black uppercase tracking-widest text-white mb-1">{plan.label}</h3>
                                <p className="text-center text-[11px] text-zinc-500 mb-4">{plan.description}</p>

                                <div className="text-center mb-5">
                                    <span className="text-3xl font-black text-white">{plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}</span>
                                    {plan.priceUsd > 0 && <span className="text-sm text-zinc-500">/mo</span>}
                                </div>

                                <div className="flex-1 space-y-1.5 mb-5">
                                    {plan.features.map((f) => (
                                        <div key={f} className="flex items-start gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${isPopular ? "bg-primary" : "bg-zinc-600"}`} />
                                            <span className="text-xs text-zinc-400 leading-snug">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={plan.priceUsd === 0 ? "/sign-up" : (user ? "/billing" : "/sign-up")}
                                    className={`w-full h-10 rounded-xl font-bold text-sm text-center flex items-center justify-center transition-all ${
                                        isPopular
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                                            : "bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/[0.1]"
                                    }`}
                                >
                                    {plan.priceUsd === 0 ? "Get Started" : "Choose Plan"}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 text-center">
                    <a href="/tiers" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5">
                        Compare all features in detail <ArrowRight size={14} />
                    </a>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center">
                        <Shield size={28} className="text-emerald-400 mx-auto mb-3" />
                        <h3 className="font-bold mb-2">No Credit Card</h3>
                        <p className="text-sm text-zinc-500">Pay with crypto. No personal banking info needed.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center">
                        <Zap size={28} className="text-amber-400 mx-auto mb-3" />
                        <h3 className="font-bold mb-2">Fast Verification</h3>
                        <p className="text-sm text-zinc-500">Most payments verified within hours. Start using Pro features the same day.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center">
                        <Crown size={28} className="text-primary mx-auto mb-3" />
                        <h3 className="font-bold mb-2">Cancel Anytime</h3>
                        <p className="text-sm text-zinc-500">No lock-in. Your plan runs until the period ends, then downgrades to Starter.</p>
                    </div>
                </div>

                {!user && (
                    <div className="mt-12 flex items-center gap-4">
                        <Link
                            href="/sign-up"
                            className="px-8 h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                        >
                            Get Started <ArrowRight size={16} />
                        </Link>
                        <Link
                            href="/sign-in"
                            className="px-8 h-12 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}