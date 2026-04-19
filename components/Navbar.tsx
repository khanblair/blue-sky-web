"use client";

import {
    Header,
    Button,
    Link,
    AvatarRoot,
    AvatarImage,
    AvatarFallback,
    DropdownRoot,
    DropdownPopover,
    MenuRoot,
    MenuItemRoot,
    MenuSectionRoot,
} from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Cloud, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { InstallPWA } from "./InstallPWA";

export function Navbar() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const [authModal, setAuthModal] = useState<{ open: boolean; mode: "signin" | "signup" }>({
        open: false,
        mode: "signin",
    });

    const openSignIn = () => setAuthModal({ open: true, mode: "signin" });
    const openSignUp = () => setAuthModal({ open: true, mode: "signup" });

    return (
        <>
            <Header className="border-b border-divider/50 backdrop-blur-md h-16 flex items-center justify-between px-6 sticky top-0 z-50 bg-background/80">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 text-foreground">
                        <Cloud className="text-primary w-8 h-8" />
                        <span className="font-bold text-xl tracking-tight hidden sm:inline">BlueSky AI</span>
                    </Link>
                </div>

                <nav className="hidden sm:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity text-foreground">
                        Home
                    </Link>
                    <Link href="/features" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity text-foreground">
                        Features
                    </Link>
                    <Link href="/docs" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity text-foreground">
                        Guide
                    </Link>
                    {user && (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity text-foreground">
                                Dashboard
                            </Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    <InstallPWA />
                    {!isLoaded ? null : user ? (
                        <DropdownRoot>
                            <Button variant="ghost" className="rounded-full w-10 h-10 p-0 overflow-hidden min-w-0 border-none bg-transparent hover:bg-default-100">
                                <AvatarRoot className="w-10 h-10">
                                    <AvatarImage src={user.imageUrl} />
                                    <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                                </AvatarRoot>
                            </Button>
                            <DropdownPopover>
                                <MenuRoot aria-label="Profile Actions" className="w-56 p-2 bg-content1 rounded-xl shadow-lg border border-divider">
                                    <MenuSectionRoot>
                                        <MenuItemRoot key="profile" textValue="Signed in as" className="p-2 mb-2 pointer-events-none">
                                            <div className="flex flex-col">
                                                <p className="font-semibold text-[10px] opacity-50 uppercase tracking-widest">Signed in as</p>
                                                <p className="font-bold truncate text-sm">{user.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                        </MenuItemRoot>
                                    </MenuSectionRoot>
                                    <hr className="my-2 border-divider" />
                                    <MenuItemRoot key="dashboard" href="/dashboard" className="flex items-center gap-2 p-3 hover:bg-default-100 rounded-xl transition-colors">
                                        <LayoutDashboard size={18} /> <span className="font-bold">Dashboard</span>
                                    </MenuItemRoot>
                                    <MenuItemRoot key="settings" href="/settings" className="flex items-center gap-2 p-3 hover:bg-default-100 rounded-xl transition-colors">
                                        <Settings size={18} /> <span className="font-bold">Settings</span>
                                    </MenuItemRoot>
                                    <hr className="my-2 border-divider" />
                                    <MenuItemRoot
                                        key="logout"
                                        className="flex items-center gap-2 p-3 hover:bg-danger/10 text-danger rounded-xl font-bold transition-colors"
                                        onAction={() => signOut()}
                                    >
                                        <LogOut size={18} /> <span>Log Out</span>
                                    </MenuItemRoot>
                                </MenuRoot>
                            </DropdownPopover>
                        </DropdownRoot>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button className="text-sm font-black hover:opacity-70 transition-opacity" onClick={openSignIn}>Login</button>
                            <button className={buttonVariants({ variant: "primary", size: "sm" })} onClick={openSignUp}>
                                <span className="px-2">Sign Up</span>
                            </button>
                        </div>
                    )}
                </div>
            </Header>

            <AuthModal
                isOpen={authModal.open}
                initialMode={authModal.mode}
                onClose={() => setAuthModal({ ...authModal, open: false })}
            />
        </>
    );
}
