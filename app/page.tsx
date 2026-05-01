"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Zap, Shield, Sparkles, ArrowRight, Clock, Bot, BarChart3, Bell, Key, Globe, Check, Feather, Crown } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";
import { PLAN_LIMITS, type PlanId } from "@/lib/plans";

const planIcons: Record<PlanId, React.ReactNode> = {
    starter: <Zap size={18} className="text-zinc-400" />,
    lite: <Feather size={18} className="text-sky-400" />,
    basic: <Shield size={18} className="text-emerald-400" />,
    pro: <Sparkles size={18} className="text-primary" />,
    standard: <Globe size={18} className="text-violet-400" />,
    enterprise: <Crown size={18} className="text-amber-400" />,
};

const planColors: Record<PlanId, string> = {
    starter: "from-zinc-500/20 to-zinc-600/10",
    lite: "from-sky-500/20 to-sky-600/10",
    basic: "from-emerald-500/20 to-emerald-600/10",
    pro: "from-primary/20 to-blue-500/10",
    standard: "from-violet-500/20 to-violet-600/10",
    enterprise: "from-amber-500/20 to-amber-600/10",
};

const features = [
    {
        icon: Bot,
        title: "AI Content Generation",
        description: "Choose your niche, tone, and goals. AI creates on-brand posts that sound like you wrote them.",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: Clock,
        title: "Two-Stage Scheduling",
        description: "Posts are generated first, then published on your schedule. Full control with countdown timers.",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
    },
    {
        icon: Bell,
        title: "Instant Notifications",
        description: "Get alerted on Telegram and WhatsApp whenever a post is generated, published, or fails.",
        color: "text-amber-400",
        bg: "bg-amber-400/10",
    },
    {
        icon: Key,
        title: "Bring Your Own Key",
        description: "Pro+ users can plug in their own OpenAI, Anthropic, or Google API keys for full model control.",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
    },
    {
        icon: Globe,
        title: "Multi-Provider Models",
        description: "Access GPT-4o, Claude, Gemini, Llama and more through OpenRouter or direct provider APIs.",
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
    },
    {
        icon: Shield,
        title: "Privacy-First",
        description: "Your Bluesky App Password is encrypted at rest. Nothing ever touches the client side.",
        color: "text-rose-400",
        bg: "bg-rose-400/10",
    },
];

const steps = [
    {
        step: "01",
        title: "Connect Bluesky",
        description: "Sign in and link your Bluesky account with an App Password. Takes 30 seconds.",
        icon: Zap,
    },
    {
        step: "02",
        title: "Configure Your AI",
        description: "Pick your niche, tone, hashtags, and posting frequency. Or choose a custom AI model.",
        icon: Bot,
    },
    {
        step: "03",
        title: "Let It Run",
        description: "AI generates posts on schedule, publishes them, and notifies you in real time.",
        icon: Sparkles,
    },
];

const floatingWords = ["Automate", "Schedule", "Create", "Publish", "Notify", "Optimize"];

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function GridBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]" />
        </div>
    );
}

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-[100px] ${className}`}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 20, 0],
                y: [0, -20, 0],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
            }}
        />
    );
}

export default function Home() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [authModal, setAuthModal] = useState<{ open: boolean; mode: "signin" | "signup" }>({
        open: false,
        mode: "signup",
    });
    const [activeWord, setActiveWord] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();

    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveWord((prev) => (prev + 1) % floatingWords.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const handleGetStarted = () => {
        if (!isLoaded) return;
        if (user) {
            router.push("/dashboard");
        } else {
            setAuthModal({ open: true, mode: "signup" });
        }
    };

    return (
        <>
            {/* ── Hero ── */}
            <section className="relative overflow-hidden min-h-[90vh] flex items-center">
                <GridBackground />
                <FloatingOrb className="w-[600px] h-[600px] bg-primary/20 top-[-200px] left-1/2 -translate-x-1/2" />
                <FloatingOrb className="w-[400px] h-[400px] bg-blue-500/10 bottom-[-100px] right-[-100px]" delay={3} />
                <FloatingOrb className="w-[300px] h-[300px] bg-violet-500/10 top-1/3 left-[-100px]" delay={5} />

                {/* Floating scrolling words */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-[80px] md:text-[120px] font-black text-white/[0.015] whitespace-nowrap select-none"
                            style={{
                                top: `${(i * 17) % 100}%`,
                                left: `${(i * 23) % 100}%`,
                            }}
                            animate={{ x: [0, -200] }}
                            transition={{
                                duration: 20 + i * 4,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 2,
                            }}
                        >
                            {floatingWords[i % floatingWords.length]}
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    ref={heroRef}
                    style={{ opacity: heroOpacity, y: heroY }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-36 w-full"
                >
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.08] border border-primary/20 mb-8"
                        >
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">AI-Powered Social Automation</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6"
                        >
                            Your Bluesky Presence,{" "}
                            <span className="relative inline-block">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={activeWord}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-violet-400"
                                    >
                                        {floatingWords[activeWord]}
                                    </motion.span>
                                </AnimatePresence>
                                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-blue-400 to-violet-400 rounded-full" />
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10"
                        >
                            Set your niche and tone. AI writes your posts, publishes on schedule, and sends you real-time alerts. No server, no DevOps — just results.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
                        >
                            <button
                                onClick={handleGetStarted}
                                className="group w-full sm:w-auto px-8 h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a
                                href="/docs"
                                className="w-full sm:w-auto px-8 h-12 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/[0.04] hover:border-white/20 transition-all inline-flex items-center justify-center gap-2"
                            >
                                View Guide
                            </a>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="mt-6 text-xs text-zinc-600"
                        >
                            No credit card required &middot; Start with 5 free posts/month &middot; Cancel anytime
                        </motion.p>

                        {/* Stats bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="mt-12 grid grid-cols-3 gap-8 md:gap-16"
                        >
                            {[
                                { value: "6", label: "Crypto Tiers" },
                                { value: "24/7", label: "Auto Posting" },
                                { value: "5+", label: "AI Providers" },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
                        <div className="w-1 h-2 rounded-full bg-white/40" />
                    </div>
                </motion.div>
            </section>

            {/* ── Features Grid ── */}
            <section className="py-20 md:py-28 relative">
                <FloatingOrb className="w-[400px] h-[400px] bg-emerald-500/5 top-0 right-0" delay={2} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <AnimatedSection className="text-center mb-12 md:mb-16">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Features</p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            Everything you need to automate Bluesky
                        </h2>
                        <p className="text-base text-zinc-500 mt-3 max-w-xl mx-auto">
                            From content generation to publishing, notifications to scheduling — all serverless, all automated.
                        </p>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, i) => (
                            <AnimatedSection key={feature.title} delay={i * 0.1}>
                                <div className="group p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 h-full">
                                    <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon size={20} className={feature.color} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="py-20 md:py-28 relative">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <AnimatedSection className="text-center mb-12 md:mb-16">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">How It Works</p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            Three steps. Zero hassle.
                        </h2>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {steps.map((s, i) => (
                            <AnimatedSection key={s.step} delay={i * 0.15}>
                                <div className="relative flex flex-col items-center text-center">
                                    {i < steps.length - 1 && (
                                        <div className="hidden md:block absolute top-10 left-[60%] w-[calc(100%-20px)] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                                    )}
                                    <motion.div
                                        className="w-20 h-20 rounded-2xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center mb-5"
                                        whileHover={{ scale: 1.05, borderColor: "rgba(var(--color-primary-rgb), 0.3)" }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <s.icon size={28} className="text-primary" />
                                    </motion.div>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Step {s.step}</span>
                                    <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">{s.description}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section className="py-20 md:py-28 relative">
                <FloatingOrb className="w-[500px] h-[500px] bg-primary/10 bottom-0 left-0" delay={4} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <AnimatedSection className="text-center mb-12 md:mb-16">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Pricing</p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            Start free. Scale with crypto.
                        </h2>
                        <p className="text-base text-zinc-500 mt-3 max-w-xl mx-auto">
                            No credit card required. Pay with USDC, ETH, or BTC when you&apos;re ready to upgrade.
                        </p>
                    </AnimatedSection>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        {(["starter", "lite", "basic", "pro", "standard", "enterprise"] as PlanId[]).map((planId, i) => {
                            const plan = PLAN_LIMITS[planId];
                            const isPopular = planId === "pro";
                            const isFree = planId === "starter";
                            return (
                                <AnimatedSection key={planId} delay={i * 0.08}>
                                    <div className={`relative flex flex-col p-4 md:p-5 rounded-2xl border transition-all h-full hover:border-white/[0.15] ${
                                        isPopular
                                            ? "border-primary/30 bg-primary/[0.03] shadow-lg shadow-primary/5"
                                            : "border-white/[0.06] bg-white/[0.02]"
                                    }`}>
                                        {isPopular && (
                                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-[9px] font-bold text-white uppercase tracking-widest whitespace-nowrap">
                                                Popular
                                            </div>
                                        )}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br ${planColors[planId]}`}>
                                            {planIcons[planId]}
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-0.5">{plan.label}</h3>
                                        <p className="text-[10px] text-zinc-500 mb-3 hidden sm:block">{plan.description}</p>
                                        <div className="mb-4">
                                            <span className="text-2xl md:text-3xl font-black text-white">
                                                {plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}
                                            </span>
                                            {plan.priceUsd > 0 && <span className="text-xs text-zinc-500 ml-0.5">/mo</span>}
                                        </div>
                                        <div className="flex-1 space-y-1 mb-4">
                                            {plan.features.slice(0, isFree ? 3 : 4).map((f) => (
                                                <div key={f} className="flex items-start gap-1.5">
                                                    <Check size={12} className={isPopular ? "text-primary shrink-0 mt-0.5" : "text-zinc-600 shrink-0 mt-0.5"} />
                                                    <span className="text-[11px] text-zinc-400 leading-snug">{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleGetStarted}
                                            className={`w-full h-9 rounded-lg text-xs font-bold transition-all ${
                                                isPopular
                                                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90"
                                                    : "bg-white/[0.06] text-white border border-white/[0.08] hover:bg-white/[0.1]"
                                            }`}
                                        >
                                            {isFree ? "Start Free" : "Get Started"}
                                        </button>
                                    </div>
                                </AnimatedSection>
                            );
                        })}
                    </div>

                    <AnimatedSection className="text-center mt-8">
                        <a href="/tiers" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5 group">
                            Compare all tiers in detail <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    </AnimatedSection>

                    <AnimatedSection className="text-center mt-6">
                        <p className="text-sm text-zinc-600">
                            All plans include Bluesky AT Protocol integration. Crypto payments via USDC, ETH, or BTC.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20 md:py-28 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedSection>
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-16 text-center">
                            <FloatingOrb className="w-[300px] h-[300px] bg-primary/15 -top-[150px] -left-[100px]" delay={1} />
                            <FloatingOrb className="w-[200px] h-[200px] bg-blue-500/10 -bottom-[100px] -right-[80px]" delay={3} />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative"
                            >
                                <BarChart3 size={40} className="text-primary mx-auto mb-6" />
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
                                    Start automating your Bluesky today
                                </h2>
                                <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mb-8">
                                    Free to start. No credit card. Set your strategy, pick your AI model, and watch the posts roll in.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <button
                                        onClick={handleGetStarted}
                                        className="group px-8 h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 hover:shadow-xl transition-all inline-flex items-center gap-2"
                                    >
                                        Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <a
                                        href="/docs"
                                        className="px-8 h-12 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/[0.04] transition-all inline-flex items-center gap-2"
                                    >
                                        Read the Guide
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <AuthModal
                isOpen={authModal.open}
                initialMode={authModal.mode}
                onClose={() => setAuthModal((p) => ({ ...p, open: false }))}
            />
        </>
    );
}