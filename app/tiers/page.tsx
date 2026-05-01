"use client";

import Link from "next/link";
import { ArrowRight, Check, X, Sparkles, Zap, Shield, Clock, Crown, Globe, Feather } from "lucide-react";
import { PLAN_LIMITS, type PlanId, PLAN_IDS } from "@/lib/plans";

const tierIcons: Record<PlanId, React.ReactNode> = {
    starter: <Zap size={24} className="text-zinc-400" />,
    lite: <Feather size={24} className="text-sky-400" />,
    basic: <Shield size={24} className="text-emerald-400" />,
    pro: <Sparkles size={24} className="text-primary" />,
    standard: <Globe size={24} className="text-violet-400" />,
    enterprise: <Crown size={24} className="text-amber-400" />,
};

const comparisonRows = [
    { label: "Posts per month", key: "postsPerMonth" as const, format: (v: number) => v === Infinity ? "Unlimited" : v.toString() },
    { label: "AI generations", key: "aiGenerationsPerMonth" as const, format: (v: number) => v === Infinity ? "Unlimited" : v.toString() },
    { label: "Max topics", key: "maxTopics" as const, format: (v: number) => v === Infinity ? "Unlimited" : v.toString() },
    { label: "Max subtopics", key: "maxSubtopics" as const, format: (v: number) => v === Infinity ? "Unlimited" : v.toString() },
    { label: "Min post interval", key: "minGenerateIntervalHours" as const, format: (v: number) => `${v}h` },
    { label: "Telegram & WhatsApp alerts", key: "notifications" as const },
    { label: "Custom AI models", key: "customModel" as const },
    { label: "Bring your own key", key: "byok" as const },
    { label: "No watermark", key: "branding" as const, inverted: true },
];

export default function TiersPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
                <div className="text-center mb-12">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Tier Comparison</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Choose the right plan for you
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        From free to unlimited — pick a tier that matches your posting volume. Upgrade or downgrade anytime with crypto.
                    </p>
                </div>
            </section>

            {/* ── Tier cards — 3x2 grid ── */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PLAN_IDS.map((planId) => {
                        const plan = PLAN_LIMITS[planId];
                        const isPopular = planId === "pro";
                        return (
                            <div key={planId} className={`relative flex flex-col rounded-2xl border p-5 md:p-6 transition-all ${
                                isPopular
                                    ? "border-primary/40 bg-primary/[0.04] shadow-xl shadow-primary/10"
                                    : "border-white/[0.06] bg-white/[0.02]"
                            }`}>
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-widest">
                                        Most Popular
                                    </div>
                                )}

                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] mx-auto mb-4">
                                    {tierIcons[planId]}
                                </div>

                                <h3 className="text-center font-black uppercase tracking-widest text-white mb-1">{plan.label}</h3>
                                <p className="text-center text-[11px] text-zinc-500 mb-4">{plan.description}</p>

                                <div className="text-center mb-5">
                                    <span className="text-3xl font-black text-white">
                                        {plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}
                                    </span>
                                    {plan.priceUsd > 0 && <span className="text-sm text-zinc-500 ml-1">/mo</span>}
                                </div>

                                <div className="flex-1 space-y-1.5 mb-5">
                                    {plan.features.map((f) => (
                                        <div key={f} className="flex items-start gap-2">
                                            <Check size={13} className={isPopular ? "text-primary shrink-0 mt-0.5" : "text-zinc-600 shrink-0 mt-0.5"} />
                                            <span className="text-[11px] text-zinc-400 leading-snug">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={plan.priceUsd === 0 ? "/sign-up" : "/billing"}
                                    className={`w-full h-10 rounded-xl font-bold text-sm text-center flex items-center justify-center transition-all ${
                                        isPopular
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                                            : "bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/[0.1]"
                                    }`}
                                >
                                    {plan.priceUsd === 0 ? "Get Started" : "Choose Plan"} <ArrowRight size={14} className="ml-1.5" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Comparison table ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-8">Feature-by-feature comparison</h2>

                <div className="overflow-x-auto -mx-4 px-4">
                    <table className="w-full min-w-[900px] border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="py-4 px-4 text-left text-[11px] font-black uppercase tracking-widest text-zinc-500">Feature</th>
                                {PLAN_IDS.map((planId) => (
                                    <th key={planId} className={`py-4 px-2 text-center text-sm font-black uppercase tracking-widest ${
                                        planId === "pro" ? "text-primary" : "text-zinc-400"
                                    }`}>
                                        {PLAN_LIMITS[planId].label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonRows.map((row) => (
                                <tr key={row.key} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 px-4 text-sm text-zinc-400">{row.label}</td>
                                    {PLAN_IDS.map((planId) => {
                                        const plan = PLAN_LIMITS[planId];
                                        const value = plan[row.key as keyof typeof plan];
                                        const isBool = typeof value === "boolean";
                                        const isInverted = row.inverted;

                                        if (isBool) {
                                            const positive = isInverted ? !value : value;
                                            return (
                                                <td key={planId} className="py-3 px-2 text-center">
                                                    {positive ? (
                                                        <Check size={16} className={planId === "pro" ? "text-primary mx-auto" : "text-emerald-400 mx-auto"} />
                                                    ) : (
                                                        <X size={16} className="text-zinc-600 mx-auto" />
                                                    )}
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={planId} className={`py-3 px-2 text-center text-sm font-semibold ${planId === "pro" ? "text-white" : "text-zinc-400"}`}>
                                                {row.format ? row.format(value as number) : String(value)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="border-b border-white/[0.04]">
                                <td className="py-4 px-4 text-sm font-bold text-white">Price</td>
                                {PLAN_IDS.map((planId) => {
                                    const plan = PLAN_LIMITS[planId];
                                    return (
                                        <td key={planId} className={`py-4 px-2 text-center text-lg font-black ${planId === "pro" ? "text-primary" : "text-white"}`}>
                                            {plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}{plan.priceUsd > 0 && <span className="text-xs text-zinc-500 font-normal">/mo</span>}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-8">Frequently asked questions</h2>

                <div className="space-y-4">
                    {[
                        {
                            q: "How do I pay with crypto?",
                            a: "Choose a plan, select your preferred network (USDC on Base, USDC on Ethereum, ETH, or BTC), send the exact amount to the displayed wallet address, then paste your transaction hash. We verify manually, typically within 1-12 hours.",
                        },
                        {
                            q: "Can I switch plans?",
                            a: "Yes. Upgrade or downgrade at any time from the Billing page. When upgrading, your new limits take effect immediately. When downgrading, your current plan runs until the period ends.",
                        },
                        {
                            q: "What happens when I hit my limit?",
                            a: "Post generation and publishing pause, and you see an upsell notification in the dashboard. Your existing posts and data are never deleted. Upgrade to resume.",
                        },
                        {
                            q: "Can I use my own AI API key?",
                            a: "Pro, Standard, and Enterprise tiers support Bring Your Own Key (BYOK). Connect your OpenAI, Anthropic, or Google AI key and choose any model — your key is stored encrypted and never sent to the client.",
                        },
                        {
                            q: "Is my Bluesky password safe?",
                            a: "Absolutely. Your App Password is encrypted at rest in Convex and never transmitted to the browser. We use the AT Protocol standard for API access, which is the recommended way to integrate with Bluesky.",
                        },
                    ].map((faq) => (
                        <div key={faq.q} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <h3 className="text-sm font-bold text-white mb-2">{faq.q}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
                        Ready to automate your Bluesky?
                    </h2>
                    <p className="text-base text-zinc-400 max-w-xl mx-auto mb-6">
                        Start free. No credit card. Instant access.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/sign-up"
                            className="px-8 h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                        >
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                        <a
                            href="/pricing"
                            className="px-8 h-12 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/[0.04] transition-all inline-flex items-center gap-2"
                        >
                            View Pricing
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}