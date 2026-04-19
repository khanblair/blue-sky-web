"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
    Cloud, LayoutDashboard, Settings, LogOut,
    Menu, X, Calendar, FileText, Sparkles, User,
    ChevronDown,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";

const appNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Posts", href: "/posts", icon: FileText },
    { name: "AI", href: "/ai", icon: Sparkles },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
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

    useEffect(() => { setMenuOpen(false); }, [pathname]);

    const openSignIn = () => setAuthModal({ open: true, mode: "signin" });
    const openSignUp = () => setAuthModal({ open: true, mode: "signup" });

    return (
        <>
            {/* ── Navbar ── */}
            <nav className="border-b border-white/10 backdrop-blur-md h-16 flex items-center justify-between px-4 sticky top-0 z-[60] bg-zinc-950/90">

                {/* Left: hamburger (mobile) + logo */}
                <div className="flex items-center gap-3">
                    {/* Hamburger — always rendered on mobile, no auth gate */}
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="flex md:hidden w-9 h-9 items-center justify-center rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors shrink-0"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        <Cloud className="text-primary w-7 h-7 shrink-0" />
                        <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">BlueSky AI</span>
                    </Link>
                </div>

                {/* Center: desktop nav links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Home</Link>
                    <Link href="/features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
                    <Link href="/docs" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Guide</Link>
                    {user && <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</Link>}
                </div>

                {/* Right: auth */}
                <div className="flex items-center gap-3">
                    {!isLoaded ? (
                        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                    ) : user ? (
                        /* User dropdown */
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen((v) => !v)}
                                className="flex items-center gap-2 px-1 md:px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                            >
                                <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                                <span className="text-sm font-bold text-white max-w-[120px] truncate hidden md:inline">
                                    {user.firstName || user.primaryEmailAddress?.emailAddress}
                                </span>
                                <ChevronDown size={14} className="text-zinc-500 hidden md:inline" />
                            </button>
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-white/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Signed in as</p>
                                                <p className="text-sm font-bold text-white truncate">{user.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                            {appNav.map((item) => (
                                                <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                                                    <item.icon size={16} className="text-zinc-500 shrink-0" />
                                                    {item.name}
                                                </Link>
                                            ))}
                                            <div className="border-t border-white/5">
                                                <button onClick={() => signOut()}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors w-full">
                                                    <LogOut size={16} /> Log Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <button onClick={openSignIn} className="text-sm font-black text-zinc-300 hover:text-white transition-colors">Login</button>
                            <button onClick={openSignUp} className="px-4 h-9 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary/90 transition-colors">Sign Up</button>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── Mobile drawer — portalled to body ── */}
            <BodyPortal>
                <AnimatePresence>
                    {menuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMenuOpen(false)}
                                style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
                            />

                            {/* Left-side panel */}
                            <motion.div
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                                style={{
                                    position: "fixed", top: 0, left: 0, bottom: 0,
                                    width: 280, zIndex: 9999,
                                    background: "#09090b",
                                    borderRight: "1px solid rgba(255,255,255,0.08)",
                                    boxShadow: "8px 0 40px rgba(0,0,0,0.7)",
                                    display: "flex", flexDirection: "column",
                                }}
                            >
                                {/* Panel header */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Cloud size={22} style={{ color: "#3b82f6" }} />
                                        <span style={{ fontWeight: 900, fontSize: 16, color: "white" }}>BlueSky AI</span>
                                    </div>
                                    <button onClick={() => setMenuOpen(false)}
                                        style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", color: "#71717a", background: "transparent", cursor: "pointer" }}>
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Links */}
                                <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                                    {user ? (
                                        <>
                                            <div style={{ padding: "8px 12px 12px", marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#52525b", marginBottom: 2 }}>Signed in as</p>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {user.primaryEmailAddress?.emailAddress}
                                                </p>
                                            </div>
                                            {appNav.map((item) => {
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 12,
                                                            padding: "11px 12px", borderRadius: 12, marginBottom: 2,
                                                            fontSize: 14, fontWeight: 700, textDecoration: "none",
                                                            background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                                                            color: isActive ? "#60a5fa" : "#d4d4d8",
                                                        }}>
                                                        <item.icon size={18} style={{ color: isActive ? "#60a5fa" : "#52525b", flexShrink: 0 }} />
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            {[{ name: "Home", href: "/" }, { name: "Features", href: "/features" }, { name: "Guide", href: "/docs" }].map((item) => (
                                                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                                                    style={{ display: "flex", alignItems: "center", padding: "11px 12px", borderRadius: 12, marginBottom: 2, fontSize: 14, fontWeight: 700, color: "#d4d4d8", textDecoration: "none" }}>
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* Footer */}
                                <div style={{ padding: "12px 12px 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                    {user ? (
                                        <button onClick={() => { signOut(); setMenuOpen(false); }}
                                            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 12px", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}>
                                            <LogOut size={18} /> Log Out
                                        </button>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            <button onClick={() => { openSignIn(); setMenuOpen(false); }}
                                                style={{ width: "100%", height: 42, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, fontWeight: 900, color: "white", background: "transparent", cursor: "pointer" }}>
                                                Login
                                            </button>
                                            <button onClick={() => { openSignUp(); setMenuOpen(false); }}
                                                style={{ width: "100%", height: 42, borderRadius: 12, fontSize: 13, fontWeight: 900, color: "white", background: "#2563eb", border: "none", cursor: "pointer" }}>
                                                Sign Up
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
