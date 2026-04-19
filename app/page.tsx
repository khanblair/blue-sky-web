"use client";

import { useState } from "react";
import { buttonVariants } from "@heroui/styles";
import { Link } from "@heroui/react";
import { Cloud, Zap, Shield, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "signin" | "signup" }>({
    open: false,
    mode: "signup",
  });

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
      <section className="flex flex-col items-center justify-center gap-12 py-12 md:py-24 animate-in fade-in duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
          <Sparkles size={16} />
          <span className="text-xs font-bold tracking-widest uppercase">AI-Powered Social Automation</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center max-w-3xl gap-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 leading-tight">
            Automate Your <br />
            <span className="text-primary">BlueSky</span> Presence
          </h1>
          <p className="text-xl text-default-500 max-w-2xl leading-relaxed">
            The first serverless gateway for intelligent social posting.
            Connect your account, set your preferences, and let AI handle the rest.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGetStarted}
            className={buttonVariants({ variant: "primary", size: "lg", className: "font-bold text-lg px-12 shadow-lg shadow-primary/20" })}
          >
            <Cloud className="mr-2" />
            Get Started
          </button>
          <Link
            href="/docs"
            className={buttonVariants({ variant: "ghost", size: "lg", className: "font-bold text-lg px-12" })}
          >
            View Guide
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-5xl">
          <div className="p-8 rounded-3xl bg-surface border border-divider/50 hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-default-500">Built on Bun and Convex for sub-second execution and updates.</p>
          </div>
          <div className="p-8 rounded-3xl bg-surface border border-divider/50 hover:border-success/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="text-success" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Intelligence</h3>
            <p className="text-default-500">Powered by OpenRouter with access to the world's most capable models.</p>
          </div>
          <div className="p-8 rounded-3xl bg-surface border border-divider/50 hover:border-warning/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="text-warning" />
            </div>
            <h3 className="text-xl font-bold mb-3">Pure Privacy</h3>
            <p className="text-default-500">Your App Password stays encrypted and never touches the client side.</p>
          </div>
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
