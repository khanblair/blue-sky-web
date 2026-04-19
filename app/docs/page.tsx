"use client";

import { CardRoot, CardHeader, CardContent, Chip, Link, Button } from "@heroui/react";
import { BookOpen, Key, Zap, Shield, ArrowRight, HelpCircle } from "lucide-react";
import { buttonVariants } from "@heroui/styles";

export default function GuidePage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col gap-12">
            <header className="text-center space-y-4">
                <Chip variant="tertiary" className="text-primary border-primary/20 bg-primary/5 font-bold uppercase tracking-widest text-[10px] px-3">
                    User Guide
                </Chip>
                <h1 className="text-5xl font-black tracking-tight">How it Works</h1>
                <p className="text-default-500 text-lg max-w-2xl mx-auto">
                    A simple guide to connecting your Bluesky account and automating your presence with AI.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1: App Password */}
                <CardRoot className="p-2 border-divider border bg-surface flex flex-col h-full">
                    <CardHeader className="flex gap-4 p-6 pb-2">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0">
                            <Key className="text-warning" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold">1. Security First</h3>
                            <p className="text-xs text-default-400 lowercase italic">Generate an App Password</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-4 flex flex-col gap-4 flex-grow">
                        <p className="text-sm opacity-80 leading-relaxed">
                            Bluesky recommends using <b>App Passwords</b> for third-party applications. This keeps your main password safe.
                        </p>
                        <div className="bg-default-100 p-4 rounded-xl border border-divider text-xs space-y-2">
                            <p className="font-bold uppercase text-[10px] opacity-50">Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1 opacity-80">
                                <li>Open Bluesky Settings</li>
                                <li>Go to App Passwords</li>
                                <li>Click "Add App Password"</li>
                                <li>Name it "BlueSky AI" and copy the code</li>
                            </ol>
                        </div>
                    </CardContent>
                </CardRoot>

                {/* Step 2: Automation */}
                <CardRoot className="p-2 border-divider border bg-surface flex flex-col h-full">
                    <CardHeader className="flex gap-4 p-6 pb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Zap className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold">2. AI Automation</h3>
                            <p className="text-xs text-default-400 lowercase italic">Configuring your persona</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-4 flex flex-col gap-4 flex-grow">
                        <p className="text-sm opacity-80 leading-relaxed">
                            Once connected, set your <b>Topics</b>, <b>Tone</b>, and <b>Frequency</b>. Our AI uses OpenRouter to generate native-feeling content.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Chip size="sm" variant="soft">Philosophical</Chip>
                            <Chip size="sm" variant="soft">Witty</Chip>
                            <Chip size="sm" variant="soft">Tech-Heavy</Chip>
                        </div>
                    </CardContent>
                </CardRoot>
            </div>

            <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="text-primary size-8" />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black">Is it safe?</h2>
                    <p className="text-sm opacity-70 max-w-xl">
                        Yes. Your App Password is encrypted and stored securely in Convex. It is only used server-side to publish posts. We never have access to your main account password or personal DMs.
                    </p>
                </div>
                <Link href="/dashboard" className={buttonVariants({ variant: "primary", className: "md:ml-auto whitespace-nowrap" })}>
                    Start Now
                </Link>
            </section>

            <footer className="text-center pb-12">
                <p className="text-xs text-default-400">
                    Need help? Contact us on Bluesky <Link href="https://bsky.app" className="underline font-bold">@ KhanBlair</Link>
                </p>
            </footer>
        </div>
    );
}
