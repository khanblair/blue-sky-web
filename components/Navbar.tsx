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
import { useUser, useClerk } from "@clerk/nextjs";
import { Cloud, LayoutDashboard, Settings, LogOut } from "lucide-react";

export function Navbar() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();

    return (
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
                <Link href="/dashboard" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity text-foreground">
                    Dashboard
                </Link>
                <Link href="/docs" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity text-foreground">
                    Guide
                </Link>
            </nav>

            <div className="flex items-center gap-4">
                {!isLoaded ? null : user ? (
                    <DropdownRoot>
                        <Button variant="ghost" className="rounded-full w-10 h-10 p-0 overflow-hidden min-w-0">
                            <AvatarRoot className="w-full h-full">
                                <AvatarImage src={user.imageUrl} />
                                <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                            </AvatarRoot>
                        </Button>
                        <DropdownPopover>
                            <MenuRoot aria-label="Profile Actions" className="w-56 p-2 bg-content1 rounded-xl shadow-lg border border-divider">
                                <MenuSectionRoot>
                                    <MenuItemRoot key="profile" textValue="Signed in as" className="p-2 mb-2">
                                        <div className="flex flex-col">
                                            <p className="font-semibold text-xs opacity-50">Signed in as</p>
                                            <p className="font-semibold truncate text-sm">{user.primaryEmailAddress?.emailAddress}</p>
                                        </div>
                                    </MenuItemRoot>
                                </MenuSectionRoot>
                                <hr className="my-2 border-divider" />
                                <MenuItemRoot key="dashboard" href="/dashboard" className="flex items-center gap-2 p-2 hover:bg-default-100 rounded-md">
                                    <LayoutDashboard size={16} /> Dashboard
                                </MenuItemRoot>
                                <MenuItemRoot key="settings" className="flex items-center gap-2 p-2 hover:bg-default-100 rounded-md">
                                    <Settings size={16} /> Settings
                                </MenuItemRoot>
                                <hr className="my-2 border-divider" />
                                <MenuItemRoot
                                    key="logout"
                                    className="flex items-center gap-2 p-2 hover:bg-danger/20 text-danger rounded-md font-medium"
                                    onAction={() => signOut()}
                                >
                                    <LogOut size={16} /> Log Out
                                </MenuItemRoot>
                            </MenuRoot>
                        </DropdownPopover>
                    </DropdownRoot>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/sign-in" className={"text-sm font-medium"}>Login</Link>
                        <Link href="/sign-up" className={buttonVariants({ variant: "primary", size: "sm" })}>
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </Header>
    );
}
