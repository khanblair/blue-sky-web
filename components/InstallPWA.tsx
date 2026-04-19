"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
    const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Already running as installed PWA
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", () => {
            setInstalled(true);
            setPrompt(null);
        });

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    if (installed || !prompt) return null;

    const handleInstall = async () => {
        if (!prompt) return;
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
            setInstalled(true);
            setPrompt(null);
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
