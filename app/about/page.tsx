import Link from "next/link";
import { Cloud, ArrowRight, Zap, Shield, Globe, Sparkles } from "lucide-react";

export default function AboutPage() {
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
                            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">Our Story</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            Building the future of{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-violet-400">
                                social automation
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            BlueSky AI was born from a simple frustration: great content shouldn&apos;t require great effort. We built a platform that combines the power of AI with the simplicity of crypto payments to help creators, agencies, and brands stay consistent on Bluesky.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Our Mission</p>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
                                Make social media effortless
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed">
                                <p>
                                    We believe that the best social media presence is a consistent one. But consistency is hard — it takes time, creativity, and discipline that most creators and businesses simply don&apos;t have.
                                </p>
                                <p>
                                    BlueSky AI solves this by combining cutting-edge AI language models with intelligent scheduling. You set your niche, tone, and goals. Our AI handles the rest — writing posts that sound like you, publishing on your schedule, and even notifying you when things happen.
                                </p>
                                <p>
                                    We&apos;re also committed to privacy-first architecture. Your Bluesky credentials are encrypted at rest and never exposed to the browser. No tracking, no data selling, no compromises.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Zap, label: "AI-Powered", desc: "Multi-provider AI generation" },
                                { icon: Shield, label: "Privacy-First", desc: "Encrypted at rest" },
                                { icon: Globe, label: "Crypto Native", desc: "Pay with USDC, ETH, BTC" },
                                { icon: Sparkles, label: "Serverless", desc: "Zero DevOps required" },
                            ].map((item) => (
                                <div key={item.label} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                                    <item.icon size={24} className="text-primary mb-3" />
                                    <h3 className="text-sm font-bold text-white mb-1">{item.label}</h3>
                                    <p className="text-xs text-zinc-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 md:py-28 relative">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Our Values</p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            What drives us
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Creator-First",
                                desc: "Every feature we build is designed with creators in mind. We don't add complexity — we remove it. Our goal is to make social media automation feel invisible.",
                            },
                            {
                                title: "Transparency",
                                desc: "No hidden fees, no surprise charges, no dark patterns. What you see is what you get. Our pricing is public, our limits are clear, and our code is honest.",
                            },
                            {
                                title: "Innovation",
                                desc: "We're constantly pushing the boundaries of what AI can do for social media. From multi-provider model selection to crypto-native payments, we lead, we don't follow.",
                            },
                        ].map((value) => (
                            <div key={value.title} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                                <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team / CTA */}
            <section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-16 text-center">
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
                        </div>
                        <Cloud size={40} className="text-primary mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
                            Ready to automate your Bluesky?
                        </h2>
                        <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mb-8">
                            Join thousands of creators who trust BlueSky AI to keep their presence active and engaging.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/sign-up"
                                className="px-8 h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                            >
                                Get Started Free <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/pricing"
                                className="px-8 h-12 rounded-xl border border-white/10 text-white font-bold text-base hover:bg-white/[0.04] transition-all inline-flex items-center gap-2"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}