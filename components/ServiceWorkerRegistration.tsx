"use client";

import { useEffect, useState } from "react";
import { X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => console.log("[SW] Registered:", reg.scope))
                .catch((err) => console.error("[SW] Registration failed:", err));
        }

        window.__pwaInstallPrompt = null;
        const handler = (e: Event) => {
            e.preventDefault();
            window.__pwaInstallPrompt = e as BeforeInstallPromptEvent;
            window.dispatchEvent(new Event("pwaPromptReady"));
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    return null;
}

// ---------------------------------------------------------------------------
// PWA Install Popup — bottom-right corner
// Shows unconditionally (not gated on beforeinstallprompt) so it always
// appears on Vercel. Uses the native prompt if available, otherwise shows
// manual install instructions.
// ---------------------------------------------------------------------------

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
    interface Window {
        __pwaInstallPrompt: BeforeInstallPromptEvent | null;
    }
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function InstallPWAPopup() {
    const [visible, setVisible] = useState(false);
    const [nativePrompt, setNativePrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showManual, setShowManual] = useState(false);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        // Don't show if already running as installed PWA
        if (window.matchMedia("(display-mode: standalone)").matches) return;

        // Don't show if user already dismissed
        if (sessionStorage.getItem(DISMISSED_KEY)) return;

        // Pick up native prompt if already captured by the inline <head> script
        if (window.__pwaInstallPrompt) setNativePrompt(window.__pwaInstallPrompt);

        // Also catch it if it fires after hydration
        const onReady = () => {
            if (window.__pwaInstallPrompt) setNativePrompt(window.__pwaInstallPrompt);
        };
        window.addEventListener("pwaPromptReady", onReady);

        // Hide on successful install
        window.addEventListener("appinstalled", () => setVisible(false));

        // Show popup after a short delay so it doesn't flash on load
        const t = setTimeout(() => setVisible(true), 2500);

        return () => {
            clearTimeout(t);
            window.removeEventListener("pwaPromptReady", onReady);
        };
    }, []);

    const dismiss = () => {
        sessionStorage.setItem(DISMISSED_KEY, "1");
        setVisible(false);
    };

    const handleInstall = async () => {
        if (nativePrompt) {
            setInstalling(true);
            try {
                await nativePrompt.prompt();
                const { outcome } = await nativePrompt.userChoice;
                if (outcome === "accepted") {
                    setVisible(false);
                    return;
                }
            } finally {
                setInstalling(false);
            }
        }
        // No native prompt available — show manual instructions
        setShowManual(true);
    };

    // Detect iOS for specific instructions
    const isIOS = typeof navigator !== "undefined" &&
        /iphone|ipad|ipod/i.test(navigator.userAgent);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.95 }}
                    transition={{ type: "spring", damping: 24, stiffness: 300 }}
                    className="fixed bottom-6 right-6 z-[200] w-72 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
                >
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-10 -mt-10 pointer-events-none" />

                    {/* Dismiss */}
                    <button
                        onClick={dismiss}
                        className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 z-10"
                    >
                        <X size={14} />
                    </button>

                    {!showManual ? (
                        <div className="p-5 pt-4 flex flex-col gap-4 relative z-10">
                            {/* Header */}
                            <div className="flex items-center gap-3 pr-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                                    <Smartphone size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white leading-tight">Install BlueSky AI</p>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">Add to your home screen</p>
                                </div>
                            </div>

                            {/* Benefits */}
                            <ul className="space-y-1.5 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/5">
                                {[
                                    "Works offline",
                                    "Faster load times",
                                    "Native app experience",
                                ].map((b) => (
                                    <li key={b} className="flex items-center gap-2 text-[11px] text-zinc-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        {b}
                                    </li>
                                ))}
                            </ul>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={dismiss}
                                    className="flex-1 h-9 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Not now
                                </button>
                                <button
                                    onClick={handleInstall}
                                    disabled={installing}
                                    className="flex-[2] h-9 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                                >
                                    {installing ? "Installing\u2026" : "Install"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 flex flex-col gap-3 relative z-10">
                            <p className="text-sm font-black text-white pr-6">Install manually</p>
                            {isIOS ? (
                                <ol className="space-y-2 text-[11px] text-zinc-400 list-none">
                                    <li className="flex gap-2"><span className="text-primary font-black">1.</span> Tap the <span className="text-white font-bold">Share</span> button in Safari</li>
                                    <li className="flex gap-2"><span className="text-primary font-black">2.</span> Scroll down and tap <span className="text-white font-bold">"Add to Home Screen"</span></li>
                                    <li className="flex gap-2"><span className="text-primary font-black">3.</span> Tap <span className="text-white font-bold">Add</span></li>
                                </ol>
                            ) : (
                                <ol className="space-y-2 text-[11px] text-zinc-400 list-none">
                                    <li className="flex gap-2"><span className="text-primary font-black">1.</span> Click the <span className="text-white font-bold">⋮ menu</span> in Chrome</li>
                                    <li className="flex gap-2"><span className="text-primary font-black">2.</span> Select <span className="text-white font-bold">"Install BlueSky AI…"</span></li>
                                    <li className="flex gap-2"><span className="text-primary font-black">3.</span> Click <span className="text-white font-bold">Install</span></li>
                                </ol>
                            )}
                            <button
                                onClick={dismiss}
                                className="w-full h-9 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-colors mt-1"
                            >
                                Got it
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
