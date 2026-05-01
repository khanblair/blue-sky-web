"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
    Cloud, LayoutDashboard, Settings, LogOut,
    Menu, X, Calendar, FileText, Sparkles, User,
    ChevronDown, WalletCards, Zap, Shield, Sparkles as SparkleIcon,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";

const publicNav = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Guide", href: "/docs" },
];

const coreNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Posts", href: "/posts", icon: FileText },
    { name: "AI", href: "/ai", icon: Sparkles },
];

const userNav = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Billing", href: "/billing", icon: WalletCards },
];

function BodyPortal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

export function Navbar() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [authModal, setAuthModal] = useState<{ open: boolean; mode: "signin" | "signup" }>({
        open: false, mode: "signin",
    });

    useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [pathname]);

    const openSignIn = () => setAuthModal({ open: true, mode: "signin" });
    const openSignUp = () => setAuthModal({ open: true, mode: "signup" });

    const isDashboard = pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/schedule") ||
        pathname?.startsWith("/posts") ||
        pathname?.startsWith("/ai") ||
        pathname?.startsWith("/settings") ||
        pathname?.startsWith("/profile") ||
        pathname?.startsWith("/billing") ||
        pathname?.startsWith("/onboarding");

    return (
        <>
            <nav className="sticky top-0 z-[60] w-full backdrop-blur-xl bg-zinc-950/80 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                                    <Cloud className="text-primary w-4.5 h-4.5" />
                                </div>
                                <span className="font-black text-lg tracking-tight text-white">
                                    Blue<span className="text-primary">Sky</span> AI
                                </span>
                            </Link>

                            <div className="hidden md:flex items-center gap-1">
                                {publicNav.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                            pathname === item.href
                                                ? "text-white bg-white/[0.06]"
                                                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {user && (
                                    <Link
                                        href="/dashboard"
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                            pathname?.startsWith("/dashboard")
                                                ? "text-white bg-white/[0.06]"
                                                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                                        }`}
                                    >
                                        Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {!isLoaded ? (
                                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                            ) : user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen((v) => !v)}
                                        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-white/[0.06] transition-colors"
                                    >
                                        <img
                                            src={user.imageUrl}
                                            alt=""
                                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white/10"
                                            referrerPolicy="no-referrer"
                                        />
                                        <span className="text-sm font-semibold text-white max-w-[100px] truncate hidden lg:inline">
                                            {user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0]}
                                        </span>
                                        <ChevronDown size={14} className="text-zinc-500 hidden lg:inline" />
                                    </button>
                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 top-full mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-[70] overflow-hidden"
                                                >
                                                    <div className="px-3 py-2.5 border-b border-white/[0.06]">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Account</p>
                                                        <p className="text-xs font-semibold text-white truncate mt-0.5">{user.primaryEmailAddress?.emailAddress}</p>
                                                    </div>
                                                    <div className="p-1.5">
                                                        {coreNav.map((item) => {
                                                            const isActive = pathname === item.href;
                                                            return (
                                                                <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                                                                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-zinc-300 hover:bg-white/[0.04]"}`}>
                                                                    <item.icon size={15} className={isActive ? "text-primary" : "text-zinc-500"} />
                                                                    {item.name}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="border-t border-white/[0.06] p-1.5">
                                                        {userNav.map((item) => {
                                                            const isActive = pathname === item.href;
                                                            return (
                                                                <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                                                                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-zinc-300 hover:bg-white/[0.04]"}`}>
                                                                    <item.icon size={15} className={isActive ? "text-primary" : "text-zinc-500"} />
                                                                    {item.name}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="border-t border-white/[0.06] p-1.5">
                                                        <button onClick={() => signOut()}
                                                            className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-semibold text-red-400 rounded-lg hover:bg-red-500/10 transition-colors w-full">
                                                            <LogOut size={15} /> Sign Out
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button onClick={openSignIn} className="px-3.5 h-8 rounded-lg text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
                                        Log in
                                    </button>
                                    <button onClick={openSignUp} className="px-4 h-8 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                                        Get Started
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => setMenuOpen(true)}
                                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                                aria-label="Menu"
                            >
                                <Menu size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <BodyPortal>
                <AnimatePresence>
                    {menuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMenuOpen(false)}
                                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                className="fixed inset-y-0 left-0 w-[280px] z-[9999] bg-zinc-950 border-r border-white/[0.06] flex flex-col"
                            >
                                <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06]">
                                    <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                                        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                                            <Cloud className="text-primary w-4 h-4" />
                                        </div>
                                        <span className="font-black text-base text-white">
                                            Blue<span className="text-primary">Sky</span> AI
                                        </span>
                                    </Link>
                                    <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto py-2">
                                    {user ? (
                                        <div className="px-2">
                                            <div className="px-3 py-2 mb-2">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Signed in as</p>
                                                <p className="text-xs font-semibold text-white truncate">{user.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                            {coreNav.map((item) => {
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-zinc-300 hover:bg-white/[0.04]"}`}>
                                                        <item.icon size={17} className={isActive ? "text-primary" : "text-zinc-500"} />
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}
                                            <div className="border-t border-white/[0.06] my-2" />
                                            {userNav.map((item) => (
                                                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-white/[0.04] transition-colors">
                                                    <item.icon size={17} className="text-zinc-500" />
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-2">
                                            {publicNav.map((item) => (
                                                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                                                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-white/[0.04] transition-colors">
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-white/[0.06]">
                                    {user ? (
                                        <button onClick={() => { signOut(); setMenuOpen(false); }}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => { openSignIn(); setMenuOpen(false); }}
                                                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white border border-white/10 hover:bg-white/[0.04] transition-colors">
                                                Log in
                                            </button>
                                            <button onClick={() => { openSignUp(); setMenuOpen(false); }}
                                                className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors">
                                                Get Started
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </BodyPortal>

            <AuthModal
                isOpen={authModal.open}
                initialMode={authModal.mode}
                onClose={() => setAuthModal({ ...authModal, open: false })}
            />
        </>
    );
}