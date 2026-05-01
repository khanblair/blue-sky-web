import Link from "next/link";
import { ArrowRight, Shield, Lock, Database, Eye, Key, Cloud, Bell } from "lucide-react";

export default function PrivacyPage() {
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
                            <Shield size={14} className="text-primary" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">Privacy Policy</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            Your privacy,{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-violet-400">
                                our priority
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Last updated: February 15, 2026. We collect minimal data, encrypt everything sensitive, and never sell your information.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-invert max-w-none space-y-12">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Database size={18} className="text-primary" />
                                </div>
                                1. Information We Collect
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>We collect only the information necessary to provide our service:</p>
                                <ul className="space-y-2 list-none pl-0">
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">Account Data:</strong> Your email address and display name from your authentication provider (Google, email/password via Clerk).</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">Bluesky Credentials:</strong> Your Bluesky handle and App Password, encrypted at rest using industry-standard encryption. These are used solely to publish posts on your behalf.</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">AI Provider Keys:</strong> If you use BYOK (Bring Your Own Key), your API keys for OpenAI, Anthropic, or Google are encrypted and stored securely. They are never transmitted to the client or any third party.</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">Usage Data:</strong> Post generation counts, publishing counts, and AI generation counts for plan limit tracking. This resets monthly.</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">Payment Data:</strong> Transaction hashes and wallet addresses you submit for crypto payment verification. We do not store your private keys or seed phrases.</span></li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Key size={18} className="text-primary" />
                                </div>
                                2. How We Use Your Data
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>Your data is used exclusively for:</p>
                                <ul className="space-y-2 list-none pl-0">
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Authenticating your identity and managing your account</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Generating and publishing posts to your Bluesky account</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Tracking usage against your plan limits</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Verifying crypto payment proofs</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Sending notifications (if you opt in)</span></li>
                                </ul>
                                <p>We do <strong className="text-white">not</strong> sell, trade, or share your data with advertisers, data brokers, or any third parties for marketing purposes.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Lock size={18} className="text-primary" />
                                </div>
                                3. Data Security
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>We take security seriously:</p>
                                <ul className="space-y-2 list-none pl-0">
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>All sensitive data (Bluesky passwords, API keys) is encrypted at rest in our Convex database</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Authentication is handled by Clerk, a SOC 2 Type II certified provider</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>All API communications use HTTPS/TLS encryption</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Your Bluesky App Password is never exposed to the browser or client-side JavaScript</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>AI provider keys are used server-side only and never transmitted to your device</span></li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Eye size={18} className="text-primary" />
                                </div>
                                4. Data Retention & Deletion
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>We retain your data for as long as your account is active. You can request deletion of your account and all associated data at any time by contacting us at <a href="mailto:manb10291@gmail.com" className="text-primary hover:underline">manb10291@gmail.com</a>.</p>
                                <p>Upon account deletion:</p>
                                <ul className="space-y-2 list-none pl-0">
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>All Bluesky credentials are permanently deleted</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>All AI provider keys are permanently deleted</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Post history and usage data are permanently deleted</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Subscription records are anonymized for accounting purposes</span></li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Cloud size={18} className="text-primary" />
                                </div>
                                5. Third-Party Services
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>We use the following third-party services, each with their own privacy policies:</p>
                                <ul className="space-y-2 list-none pl-0">
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">Clerk</strong> — Authentication and user management (<a href="https://clerk.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">Convex</strong> — Backend database and server functions (<a href="https://www.convex.dev/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">OpenRouter / OpenAI / Anthropic / Google</strong> — AI content generation (each provider&apos;s privacy policy applies)</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span><strong className="text-white">Bluesky</strong> — Social media platform via AT Protocol (<a href="https://bsky.social/about" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</span></li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bell size={18} className="text-primary" />
                                </div>
                                6. Notifications
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>If you opt in to notifications via Telegram or WhatsApp, we will send you alerts about post generation, publishing, and failures. These notifications contain only the minimum information necessary (e.g., &quot;Post published successfully&quot;). We do not share your notification preferences or send unsolicited messages.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Shield size={18} className="text-primary" />
                                </div>
                                7. Contact
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>If you have questions about this Privacy Policy or our data practices, contact us at:</p>
                                <p><a href="mailto:manb10291@gmail.com" className="text-primary hover:underline">manb10291@gmail.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
                            Privacy-first by design
                        </h2>
                        <p className="text-base text-zinc-400 max-w-xl mx-auto mb-6">
                            We built BlueSky AI to respect your data from day one. No tracking, no selling, no compromises.
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