"use client";

import Link from "next/link";
import { Cloud, ExternalLink, Mail } from "lucide-react";
import { FaXTwitter, FaFacebookF, FaDiscord } from "react-icons/fa6";

const footerLinks = {
    product: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Tiers", href: "/tiers" },
        { name: "Guide", href: "/docs" },
    ],
    company: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Changelog", href: "/changelog" },
    ],
    legal: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
    ],
};

export function Footer() {
    return (
        <footer className="w-full border-t border-white/[0.06] bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                                <Cloud className="text-primary w-4 h-4" />
                            </div>
                            <span className="font-black text-lg tracking-tight text-white">
                                Blue<span className="text-primary">Sky</span> AI
                            </span>
                        </Link>
                        <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                            AI-powered Bluesky posting automation. Set your strategy, let the AI create, and never miss a post.
                        </p>
                        <div className="flex items-center gap-2.5 mt-6">
                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                                aria-label="X (Twitter)"
                            >
                                <FaXTwitter size={16} />
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                                aria-label="Facebook"
                            >
                                <FaFacebookF size={15} />
                            </a>
                            <a
                                href="https://discord.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                                aria-label="Discord"
                            >
                                <FaDiscord size={16} />
                            </a>
                            <a
                                href="mailto:hello@bluesky-ai.com"
                                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                                aria-label="Email"
                            >
                                <Mail size={16} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Product</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Company</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Legal</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-600">
                        &copy; {new Date().getFullYear()} BlueSky AI. All rights reserved.
                    </p>
                    <p className="text-xs text-zinc-600">
                        Powered by Convex &middot; OpenRouter &middot; Bluesky AT Protocol
                    </p>
                </div>
            </div>
        </footer>
    );
}