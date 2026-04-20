"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
    Chip,
} from "@heroui/react";
import {
    Zap,
    Activity,
    Loader2,
    Settings,
    ArrowRight,
    Sparkles,
    Send,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";

function msUntilNext(lastTime: number | string, intervalHours: number): number {
    const intervalMs = (Number(intervalHours) || 0) * 60 * 60 * 1000;
    const parsedTime = new Date(lastTime).getTime();
    const validTime = isNaN(parsedTime) ? 0 : parsedTime;
    const elapsed = Date.now() - validTime;
    const result = Math.max(0, intervalMs - elapsed);
    return isNaN(result) ? 0 : result;
}

function useCountdown(lastTime: number | undefined, intervalHours: number) {
    const target = useMemo(() => {
        if (!lastTime) return null;
        const base = new Date(lastTime).getTime();
        return base + (intervalHours * 60 * 60 * 1000);
    }, [lastTime, intervalHours]);

    const [remaining, setRemaining] = useState(() =>
        target ? Math.max(0, target - Date.now()) : 0
    );

    // Track previous target to avoid redundant setRemaining(0) calls
    const prevTargetRef = useRef<number | null>(null);

    useEffect(() => {
        if (!target) {
            // Only update state if we actually need to clear it
            if (prevTargetRef.current !== null) {
                setRemaining(0);
            }
            prevTargetRef.current = null;
            return;
        }

        prevTargetRef.current = target;
        const update = () => {
            setRemaining(Math.max(0, target - Date.now()));
        };

        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [target]);

    const totalSec = Math.floor(remaining / 1000);
    return {
        h: Math.floor(totalSec / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
    };
}

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

function CountdownCard({
    label,
    icon,
    countdown,
    intervalHours,
    lastTime,
    color,
}: {
    label: string;
    icon: React.ReactNode;
    countdown: { h: number; m: number; s: number };
    intervalHours: number;
    lastTime: number | undefined;
    color: string;
}) {
    const isDue = countdown.h === 0 && countdown.m === 0 && countdown.s === 0;

    return (
        <CardRoot className="bg-black border-divider border relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-48 h-48 ${color} blur-[80px] rounded-full -mr-24 -mt-24`} />
            <CardHeader className="flex gap-3 p-6 border-b border-white/10 relative z-10">
                {icon}
                <p className="font-black uppercase tracking-widest text-sm text-white">{label}</p>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center gap-4 relative z-10">
                {isDue ? (
                    <p className="text-2xl font-black text-success uppercase tracking-widest animate-pulse">
                        Due now
                    </p>
                ) : (
                    <div className="flex gap-4 items-center">
                        {[
                            { val: countdown.h, unit: "HRS" },
                            { val: countdown.m, unit: "MIN" },
                            { val: countdown.s, unit: "SEC" },
                        ].map(({ val, unit }, i) => (
                            <div key={unit} className="flex items-center gap-4">
                                {i > 0 && <span className="text-3xl font-black text-divider">:</span>}
                                <div className="flex flex-col items-center">
                                    <span className="text-5xl font-black tracking-tighter text-white">
                                        {pad(val)}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-default-500 mt-1">
                                        {unit}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex flex-col items-center gap-1 mt-2">
                    <p className="text-[10px] font-bold text-default-500 uppercase tracking-widest">
                        Every {intervalHours}h
                    </p>
                    {lastTime ? (
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] text-default-600">
                                Last: {format(lastTime, "MMM d, h:mm a")}
                            </p>
                            <p className={`text-[11px] font-black ${color.replace("bg-", "text-").split("/")[0]} mt-1 uppercase tracking-tighter`}>
                                Next: {format(new Date(lastTime).getTime() + (intervalHours * 3600000), "h:mm a")}
                            </p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-default-600">Never run yet</p>
                    )}
                </div>
            </CardContent>
        </CardRoot>
    );
}

export default function SchedulePage() {
    const preferences = useQuery(api.users.getPreferences);
    const postHistory = useQuery(api.posting.getPostHistory);
    const pendingPosts = useQuery(api.posting.getPendingPosts);

    const generateInterval = preferences?.generateIntervalHours ?? 6;
    const postInterval = preferences?.postIntervalHours ?? 8;

    // Stabilise primitives: pass 0 while loading so hook deps don't flicker
    const lastGenTime = preferences?.lastGenerateTime ?? 0;
    const lastPostTime = preferences?.lastPostTime ?? 0;

    const generateCountdown = useCountdown(lastGenTime || undefined, generateInterval);
    const postCountdown = useCountdown(lastPostTime || undefined, postInterval);

    if (preferences === undefined || postHistory === undefined || pendingPosts === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (preferences === null) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-default-500 font-bold uppercase tracking-widest text-center">
                    No AI configuration found.<br />Please set up your strategy first.
                </p>
                <Link href="/ai">
                    <Button variant="primary" className="font-bold">Configure AI Strategy</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase text-white">Posting Schedule</h1>
                <p className="text-default-500">Two-stage automation: generate first, then publish</p>
            </header>

            {/* Countdown timers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CountdownCard
                    label="Next Generation"
                    icon={<Sparkles className="text-primary" size={20} />}
                    countdown={generateCountdown}
                    intervalHours={generateInterval}
                    lastTime={preferences.lastGenerateTime}
                    color="bg-primary/20"
                />
                <CountdownCard
                    label="Next Publish"
                    icon={<Send className="text-success" size={20} />}
                    countdown={postCountdown}
                    intervalHours={postInterval}
                    lastTime={preferences.lastPostTime}
                    color="bg-success/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Posts */}
                <CardRoot className="lg:col-span-2 bg-surface border-divider border">
                    <CardHeader className="p-6 border-b border-divider">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <Zap className="text-warning" size={20} />
                                <p className="font-black uppercase tracking-widest text-sm text-white">Pending Posts</p>
                            </div>
                            <Chip size="sm" variant="soft" color="warning" className="text-[10px] font-black uppercase">
                                {pendingPosts.length} queued
                            </Chip>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingPosts.length === 0 ? (
                            <div className="p-8 text-center text-default-500 text-sm">
                                No pending posts. The generate cron runs every {generateInterval}h.
                            </div>
                        ) : (
                            <div className="divide-y divide-divider/50">
                                {pendingPosts.map((post) => (
                                    <div
                                        key={post._id}
                                        className="p-4 flex items-start justify-between gap-4 hover:bg-default-50/30 transition-colors"
                                    >
                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-default-400">
                                                Generated {format(post.generatedAt, "MMM d, h:mm a")}
                                            </p>
                                            <p className="text-xs text-white line-clamp-2">{post.content}</p>
                                        </div>
                                        <Chip
                                            size="sm"
                                            variant="soft"
                                            color="warning"
                                            className="shrink-0 text-[8px] font-black uppercase"
                                        >
                                            pending
                                        </Chip>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-4 border-t border-divider">
                            <Link href="/ai">
                                <Button
                                    variant="outline"
                                    className="w-full font-black uppercase text-[10px] tracking-widest h-10 border-divider"
                                >
                                    <Settings size={14} className="mr-2" />
                                    Adjust Schedule
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </CardRoot>

                {/* Recent Activity */}
                <CardRoot className="bg-surface border-divider border overflow-hidden">
                    <CardHeader className="p-6 border-b border-divider bg-default-50">
                        <div className="flex items-center gap-3">
                            <Activity className="text-primary" size={20} />
                            <p className="font-black uppercase tracking-widest text-sm text-white">Recent Activity</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-divider/50">
                            {(postHistory || []).slice(0, 5).map((post) => (
                                <div
                                    key={post._id}
                                    className="p-4 flex items-center justify-between hover:bg-default-50/50 transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-default-400">
                                            {format(post.timestamp, "MMM d, h:mm a")}
                                        </p>
                                        <p className="text-xs font-black truncate max-w-[150px] text-white">
                                            {post.status === "success" ? "Post Published" : "Post Failed"}
                                        </p>
                                    </div>
                                    <Chip
                                        size="sm"
                                        variant="soft"
                                        color={post.status === "success" ? "success" : "danger"}
                                        className="h-5 p-0 px-2 text-[8px] font-black uppercase tracking-widest"
                                    >
                                        {post.status}
                                    </Chip>
                                </div>
                            ))}
                            {postHistory?.length === 0 && (
                                <div className="p-6 text-center text-default-500 text-xs">No posts yet</div>
                            )}
                        </div>
                        <Link href="/posts" className="block w-full">
                            <Button
                                variant="ghost"
                                className="w-full rounded-none h-10 font-black uppercase text-[10px] tracking-widest text-default-400 hover:text-primary hover:bg-primary/5 transition-all"
                            >
                                View Full History
                                <ArrowRight size={12} className="ml-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </CardRoot>
            </div>
        </div>
    );
}
