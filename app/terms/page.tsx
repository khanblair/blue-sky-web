import Link from "next/link";
import { ArrowRight, FileText, Shield, CreditCard, AlertTriangle, Scale, Mail } from "lucide-react";

export default function TermsPage() {
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
                            <FileText size={14} className="text-primary" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">Terms of Service</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            Terms of{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-violet-400">
                                Service
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Last updated: February 15, 2026. By using BlueSky AI, you agree to these terms. Please read them carefully.
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
                                    <Shield size={18} className="text-primary" />
                                </div>
                                1. Acceptance of Terms
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>By accessing or using BlueSky AI (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.</p>
                                <p>These Terms apply to all users, visitors, and anyone who accesses or uses the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service after any changes constitutes acceptance of the new Terms.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <CreditCard size={18} className="text-primary" />
                                </div>
                                2. Accounts & Billing
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                                <p><strong className="text-white">Pricing:</strong> The Service offers six tiers — Starter (free), Lite ($2/mo), Basic ($5/mo), Pro ($10/mo), Standard ($15/mo), and Enterprise ($20/mo). Prices are listed in USD and payable in USDC, ETH, or BTC.</p>
                                <p><strong className="text-white">Payment:</strong> Crypto payments require manual verification. You must submit a valid transaction hash after sending the required amount. We verify payments within 1-12 hours. Your plan activates upon successful verification.</p>
                                <p><strong className="text-white">Refunds:</strong> Due to the nature of crypto payments, refunds are not automatically processed. If you believe you&apos;ve been charged in error, contact us at <a href="mailto:support@bluesky-ai.com" className="text-primary hover:underline">support@bluesky-ai.com</a>.</p>
                                <p><strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time. Your plan remains active until the end of the current billing period, after which it downgrades to Starter.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <AlertTriangle size={18} className="text-primary" />
                                </div>
                                3. Acceptable Use
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>You agree not to use the Service to:</p>
                                <ul className="space-y-2 list-none pl-0">
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Generate or publish content that is illegal, defamatory, harassing, or violates the rights of others</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Violate Bluesky&apos;s Terms of Service or Community Guidelines</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Attempt to bypass plan limits, manipulate usage tracking, or access features beyond your tier</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Submit fraudulent payment proofs or transaction hashes</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Use the Service to send spam, malware, or unsolicited communications</span></li>
                                    <li className="flex items-start gap-2"><span className="text-primary mt-1.5">•</span><span>Reverse engineer, decompile, or attempt to extract the source code of the Service</span></li>
                                </ul>
                                <p>We reserve the right to suspend or terminate accounts that violate these Terms without prior notice.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Scale size={18} className="text-primary" />
                                </div>
                                4. Intellectual Property
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>The Service, including its software, design, logos, trademarks, and content, is owned by BlueSky AI and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works from the Service without our express written consent.</p>
                                <p>Content generated by the AI on your behalf is yours to use. You retain all rights to your Bluesky posts, and we claim no ownership over them. However, you are responsible for ensuring that the generated content does not infringe on the intellectual property rights of others.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Shield size={18} className="text-primary" />
                                </div>
                                5. Limitation of Liability
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or secure.</p>
                                <p>To the maximum extent permitted by law, BlueSky AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising from your use of the Service.</p>
                                <p>Our total liability to you for any claim arising from the Service shall not exceed the amount you have paid us in the 12 months preceding the claim.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail size={18} className="text-primary" />
                                </div>
                                6. Contact
                            </h2>
                            <div className="space-y-4 text-zinc-400 leading-relaxed ml-13">
                                <p>For questions about these Terms, contact us at:</p>
                                <p><a href="mailto:legal@bluesky-ai.com" className="text-primary hover:underline">legal@bluesky-ai.com</a></p>
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
                            Ready to get started?
                        </h2>
                        <p className="text-base text-zinc-400 max-w-xl mx-auto mb-6">
                            Start free. No credit card. Full access to Starter features.
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