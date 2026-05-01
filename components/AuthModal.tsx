"use client";

import { useClerk, useAuth } from "@clerk/nextjs";
import { Cloud, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
    const { isLoaded } = useAuth();
    const clerk = useClerk();
    const [mode, setMode] = useState<"signin" | "signup">(initialMode);
    const [isLoading, setIsLoading] = useState(false);

    // Prevent scrolling on body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setMode(initialMode); // Reset mode when opened
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            setIsLoading(false);
        };
    }, [isOpen, initialMode]);

    const handleGoogleAuth = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        try {
            if (mode === "signin") {
                await clerk.redirectToSignIn({
                    redirectUrl: "/dashboard",
                });
            } else {
                await clerk.redirectToSignUp({
                    redirectUrl: "/onboarding",
                });
            }
        } catch (err) {
            console.error("Error with Google auth:", err);
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden flex flex-col z-10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 pb-4 flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2 ring-1 ring-blue-500/20">
                                <Cloud className="text-blue-500 w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black tracking-tight text-white">
                                    {mode === "signin" ? "Welcome Back" : "Create Account"}
                                </h2>
                                <p className="text-zinc-400 text-sm px-4">
                                    {mode === "signin"
                                        ? "Sign in to BlueSky AI to manage your presence"
                                        : "Join the future of automated social posting"}
                                </p>
                            </div>
                        </div>

                        <div className="p-8 pt-4 flex flex-col gap-6">
                            <button
                                onClick={handleGoogleAuth}
                                disabled={isLoading}
                                className="group relative w-full h-14 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-600/20 transition-all border-none font-bold overflow-hidden px-4 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-0 transition-opacity" />
                                <svg className="w-5 h-5 shrink-0 z-10" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                                <span className="font-black text-lg z-10">
                                    {isLoading ? "Connecting..." : "Continue with Google"}
                                </span>
                            </button>

                            <div className="relative flex items-center gap-4">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Secured by Clerk</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-zinc-400">
                                    {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                                    <button
                                        type="button"
                                        className="text-blue-500 font-black hover:text-blue-400 hover:underline ml-1 transition-colors"
                                        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                                    >
                                        {mode === "signin" ? "Sign up" : "Sign in"}
                                    </button>
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] p-8 border-t border-white/5 text-center mt-auto">
                            <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold tracking-normal">
                                By continuing, you agree to our <br />
                                <span className="text-zinc-300 hover:text-white cursor-pointer transition-colors">Terms of Service</span> and <span className="text-zinc-300 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                            </p>
                        </div>
                        <div id="clerk-captcha"></div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
