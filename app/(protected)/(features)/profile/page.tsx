"use client";

import { CardRoot, CardContent, AvatarRoot, AvatarImage, AvatarFallback, Chip, Button } from "@heroui/react";
import { User, Shield, Mail, Calendar, ExternalLink, Globe } from "lucide-react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProfilePage() {
    const { user: clerkUser, isLoaded } = useUser();
    const convexUser = useQuery(api.users.getCurrentUser);

    if (!isLoaded) return <div className="flex items-center justify-center h-[50vh]">Loading...</div>;

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2">Profile</h1>
                <p className="text-default-500">Manage your identity and linked accounts</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <CardRoot className="lg:col-span-1 bg-surface border-divider border h-fit">
                    <CardContent className="flex flex-col items-center gap-6 p-8">
                        <AvatarRoot className="w-32 h-32 rounded-3xl border-4 border-primary/20 p-1">
                            <AvatarImage src={convexUser?.bskyAvatar || clerkUser?.imageUrl} className="rounded-2xl" />
                            <AvatarFallback className="rounded-2xl text-2xl font-black">{convexUser?.bskyDisplayName?.[0] || clerkUser?.firstName?.[0] || 'U'}</AvatarFallback>
                        </AvatarRoot>
                        <div className="text-center">
                            <h2 className="text-2xl font-black tracking-tight">{convexUser?.bskyDisplayName || clerkUser?.fullName}</h2>
                            <p className="text-primary font-medium text-sm">@{convexUser?.handle || "none"}</p>
                        </div>

                        {convexUser?.bskyDescription && (
                            <p className="text-center text-sm text-default-500 italic px-4">
                                {`"${convexUser.bskyDescription}"`}
                            </p>
                        )}

                        <div className="w-full h-px bg-divider/50 my-2" />

                        <div className="w-full flex flex-col gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2">Login Identity</p>
                                <div className="flex items-center justify-between p-2 bg-default-50 rounded-xl border border-divider">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-primary" />
                                        <span className="text-xs font-bold">Clerk Identity</span>
                                    </div>
                                    <span className="text-[10px] text-default-400">{clerkUser?.primaryEmailAddress?.emailAddress}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2">Automation Status</p>
                                <div className="flex items-center justify-between p-2 bg-default-50 rounded-xl border border-divider">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Globe size={14} className="text-success" />
                                        <span className="text-xs font-bold truncate">Bluesky Link</span>
                                    </div>
                                    <Chip variant="soft" color={convexUser?.isActive ? "success" : "default"} size="sm" className="h-4 p-0 px-1 text-[8px]">
                                        {convexUser?.isActive ? "ACTIVE" : "PAUSED"}
                                    </Chip>
                                </div>
                            </div>
                        </div>

                        <SignOutButton>
                            <Button variant="outline" className="w-full mt-4 text-danger border-danger/20 hover:bg-danger/10">Sign Out</Button>
                        </SignOutButton>
                    </CardContent>
                </CardRoot>

                <div className="lg:col-span-2 flex flex-col gap-8">
                    <CardRoot className="bg-surface border-divider border">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <User className="text-primary" size={20} />
                                </div>
                                <h3 className="text-xl font-bold">Personal Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-default-400">First Name</p>
                                    <p className="font-bold text-lg">{clerkUser?.firstName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-default-400">Last Name</p>
                                    <p className="font-bold text-lg">{clerkUser?.lastName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-default-400">Email Address</p>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-default-400" />
                                        <p className="font-bold text-lg">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-default-400">External ID</p>
                                    <p className="font-mono text-sm text-default-500">{clerkUser?.id}</p>
                                </div>
                            </div>
                        </CardContent>
                    </CardRoot>

                    <CardRoot className="bg-surface border-divider border">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-success/10">
                                    <Shield className="text-success" size={20} />
                                </div>
                                <h3 className="text-xl font-bold">Security</h3>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-default-50 rounded-2xl border border-divider">
                                <div className="flex flex-col">
                                    <p className="font-bold text-sm">Two-Factor Authentication</p>
                                    <p className="text-xs text-default-500">Manage your account security through Clerk</p>
                                </div>
                                <Button size="sm" variant="outline" className="font-bold">Manage</Button>
                            </div>
                        </CardContent>
                    </CardRoot>
                </div>
            </div>
        </div>
    );
}
