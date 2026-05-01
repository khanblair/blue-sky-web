import { Calendar, Sparkles, ArrowRight, Check, Zap, Shield, Globe, Key, Bell } from "lucide-react";
import Link from "next/link";

const changelog = [
    {
        version: "v1.5.0",
        date: "Feb 15, 2026",
        type: "feature",
        title: "6-Tier Pricing & Crypto Payments",
        description: "Introduced Lite ($2/mo) tier and restructured all 6 pricing tiers. Added crypto wallet payment flow with USDC, ETH, and BTC support.",
        changes: [
            "Added Lite tier at $2/mo with 20 posts and 30 AI generations",
            "Restructured Basic, Pro, Standard, and Enterprise tiers",
            "Crypto payment proof submission with TX hash verification",
            "Admin verification dashboard for manual payment approval",
        ],
    },
    {
        version: "v1.4.0",
        date: "Feb 8, 2026",
        type: "feature",
        title: "Multi-Provider AI with BYOK",
        description: "Users can now connect their own API keys for OpenAI, Anthropic, and Google AI. Choose from 15+ models across providers.",
        changes: [
            "Bring Your Own Key (BYOK) for OpenAI, Anthropic, Google",
            "15+ AI models available through OpenRouter and direct providers",
            "Provider configuration management in AI settings",
            "Encrypted API key storage — never sent to the client",
        ],
    },
    {
        version: "v1.3.0",
        date: "Jan 28, 2026",
        type: "feature",
        title: "Usage Tracking & Plan Limits",
        description: "Implemented usage metering for posts and AI generations per billing cycle. Added plan limit enforcement across all actions.",
        changes: [
            "Monthly usage tracking for posts and AI generations",
            "Plan-based limit enforcement on generation and publishing",
            "Usage bars in dashboard with remaining counts",
            "Upsell banners when approaching plan limits",
        ],
    },
    {
        version: "v1.2.0",
        date: "Jan 20, 2026",
        type: "feature",
        title: "Notifications & Scheduling",
        description: "Added Telegram and WhatsApp notifications for post events. Enhanced scheduling with two-stage generation and publishing.",
        changes: [
            "Telegram notification integration",
            "WhatsApp notification integration",
            "Two-stage scheduling: generate first, publish later",
            "Pending post queue with countdown timers",
        ],
    },
    {
        version: "v1.1.0",
        date: "Jan 12, 2026",
        type: "improvement",
        title: "Dashboard & UX Redesign",
        description: "Complete redesign of the dashboard with better navigation, usage stats, and a modern dark UI.",
        changes: [
            "New responsive navbar with mobile hamburger menu",
            "Sidebar navigation with quick access to all features",
            "Dashboard stats cards with real-time data",
            "Dark theme with proper contrast and accessibility",
        ],
    },
    {
        version: "v1.0.0",
        date: "Jan 5, 2026",
        type: "release",
        title: "Initial Launch",
        description: "BlueSky AI launched with core AI generation, Bluesky posting, and basic scheduling capabilities.",
        changes: [
            "AI-powered post generation via OpenRouter",
            "Bluesky AT Protocol integration",
            "Topic and subtopic configuration",
            "Tone and goal customization",
            "Basic post scheduling",
            "Clerk authentication with Google SSO",
        ],
    },
];

const typeIcons: Record<string, React.ReactNode> = {
    feature: <Sparkles size={16} className="text-primary" />,
    improvement: <Zap size={16} className="text-emerald-400" />,
    fix: <Shield size={16} className="text-amber-400" />,
    release: <Globe size={16} className="text-blue-400" />,
};

const typeColors: Record<string, string> = {
    feature: "bg-primary/10 text-primary border-primary/20",
    improvement: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    fix: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    release: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero */}
            <section className="relative overflow-hidden py-20 md:py-28">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.08] border border-primary/20 mb-8">
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">Changelog</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            What&apos;s{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-violet-400">
                                new
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Track every update, improvement, and feature we ship. We believe in transparency — here&apos;s everything that&apos;s changed in BlueSky AI.
                        </p>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-white/[0.06]" />

                        {changelog.map((entry, i) => (
                            <div key={entry.version} className="relative pl-16 md:pl-20 pb-12 last:pb-0">
                                {/* Dot */}
                                <div className="absolute left-[19px] md:left-[27px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-black" />

                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-all">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${typeColors[entry.type]}`}>
                                            {typeIcons[entry.type]}
                                            {entry.type}
                                        </span>
                                        <span className="text-xs font-mono text-zinc-500">{entry.version}</span>
                                        <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                                            <Calendar size={12} />
                                            {entry.date}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2">{entry.title}</h3>
                                    <p className="text-sm text-zinc-500 mb-4">{entry.description}</p>

                                    <ul className="space-y-2">
                                        {entry.changes.map((change) => (
                                            <li key={change} className="flex items-start gap-2 text-sm text-zinc-400">
                                                <Check size={14} className="text-primary shrink-0 mt-0.5" />
                                                {change}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
                            Want early access to new features?
                        </h2>
                        <p className="text-base text-zinc-400 max-w-xl mx-auto mb-6">
                            Sign up today and be the first to try everything we build.
                        </p>
                        <Link
                            href="/sign-up"
                            className="px-8 h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                        >
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}