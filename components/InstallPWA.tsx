"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
    interface Window {
        __pwaInstallPrompt: BeforeInstallPromptEvent | null;
    }
}

export function InstallPWA() {
    const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Already running as installed PWA — hide the button
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setInstalled(true);
            return;
        }

        // The inline script in <head> captures beforeinstallprompt before React
        // hydrates and stores it on window.__pwaInstallPrompt. Pick it up here.
        if (window.__pwaInstallPrompt) {
            setPrompt(window.__pwaInstallPrompt);
        }

        // Also listen for the custom event in case the prompt fires after hydration
        const onReady = () => {
            if (window.__pwaInstallPrompt) setPrompt(window.__pwaInstallPrompt);
        };
        window.addEventListener("pwaPromptReady", onReady);

        // Listen for successful install
        const onInstalled = () => {
            setInstalled(true);
            setPrompt(null);
            window.__pwaInstallPrompt = null;
        };
        window.addEventListener("appinstalled", onInstalled);

        return () => {
            window.removeEventListener("pwaPromptReady", onReady);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    if (installed || !prompt) return null;

    const handleInstall = async () => {
        if (!prompt) return;
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
            setInstalled(true);
            setPrompt(null);
            window.__pwaInstallPrompt = null;
        }
    };

    return (
        <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-3 h-8 rounded-lg border border-primary/40 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
        >
            <Download size={13} />
            Install App
        </button>
    );
}
