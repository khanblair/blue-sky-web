"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
    Chip
} from "@heroui/react";
import {
    Timer,
    Zap,
    Activity,
    Loader2,
    Settings,
    ArrowRight
} from "lucide-react";
import { format, addHours, differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SchedulePage() {
    const preferences = useQuery(api.users.getPreferences);
    const postHistory = useQuery(api.posting.getPostHistory);
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        if (!preferences) return;

        const timer = setInterval(() => {
            const lastPost = preferences.lastPostTime || Date.now() - (preferences.frequency * 60 * 60 * 1000);
            const nextPost = addHours(new Date(lastPost), preferences.frequency);
            const diffSeconds = differenceInSeconds(nextPost, new Date());

            if (diffSeconds > 0) {
                const h = Math.floor(diffSeconds / 3600);
                const m = Math.floor((diffSeconds % 3600) / 60);
                const s = diffSeconds % 60;
                setTimeLeft({ hours: h, minutes: m, seconds: s });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [preferences]);

    if (preferences === undefined || postHistory === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (preferences === null) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-default-500 font-bold uppercase tracking-widest text-center">No AI configuration found.<br />Please set up your strategy first.</p>
                <Link href="/ai">
                    <Button variant="primary" className="font-bold">Configure AI Strategy</Button>
                </Link>
            </div>
        );
    }

    const nextPostTime = preferences.lastPostTime
        ? addHours(new Date(preferences.lastPostTime), preferences.frequency)
        : null;

    const progressValue = timeLeft ? 100 - ((timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds) / (preferences.frequency * 36) * 100) : 0;

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase text-white">Posting Schedule</h1>
                <p className="text-default-500">Monitor and manage your AI's automated broadcast timing</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Countdown Card */}
                <CardRoot className="lg:col-span-2 bg-black border-divider border relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
                    <CardHeader className="flex gap-3 p-8 border-b border-white/10 relative z-10">
                        <Timer className="text-primary" size={24} />
                        <p className="font-black uppercase tracking-widest text-lg text-white">Next Automation</p>
                    </CardHeader>
                    <CardContent className="p-12 flex flex-col items-center justify-center gap-8 relative z-10">
                        <div className="flex gap-6 items-center">
                            <div className="flex flex-col items-center">
                                <span className="text-7xl font-black tracking-tighter text-white">
                                    {timeLeft?.hours.toString().padStart(2, '0') || "00"}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-default-500 mt-2">Hours</span>
                            </div>
                            <span className="text-5xl font-black text-divider">:</span>
                            <div className="flex flex-col items-center">
                                <span className="text-7xl font-black tracking-tighter text-white">
                                    {timeLeft?.minutes.toString().padStart(2, '0') || "00"}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-default-500 mt-2">Minutes</span>
                            </div>
                            <span className="text-5xl font-black text-divider">:</span>
                            <div className="flex flex-col items-center">
                                <span className="text-7xl font-black tracking-tighter text-white">
                                    {timeLeft?.seconds.toString().padStart(2, '0') || "00"}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-default-500 mt-2">Seconds</span>
                            </div>
                        </div>

                        <div className="w-full max-w-md space-y-4">
                            <div className="h-2 w-full bg-divider rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000"
                                    style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-default-500">
                                <span>Last: {preferences.lastPostTime ? format(preferences.lastPostTime, "h:mm a") : "Never"}</span>
                                <span>Target: {nextPostTime ? format(nextPostTime, "h:mm a") : "ASAP"}</span>
                            </div>
                        </div>
                    </CardContent>
                </CardRoot>

                {/* Status Card */}
                <div className="flex flex-col gap-8">
                    <CardRoot className="bg-surface border-divider border">
                        <CardHeader className="p-6 border-b border-divider">
                            <div className="flex items-center gap-3">
                                <Zap className="text-warning" size={20} />
                                <p className="font-black uppercase tracking-widest text-sm text-white">System Health</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-default-50 rounded-xl border border-white/5">
                                <span className="text-xs font-bold text-default-500 uppercase tracking-wider">Frequency</span>
                                <span className="text-sm font-black text-primary">Every {preferences.frequency}h</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-default-50 rounded-xl border border-white/5">
                                <span className="text-xs font-bold text-default-500 uppercase tracking-wider">AI Confidence</span>
                                <span className="text-sm font-black text-success">HIGH</span>
                            </div>
                            <Link href="/ai" className="block w-full">
                                <Button variant="outline" className="w-full font-black uppercase text-[10px] tracking-widest h-10 border-divider bg-black/20">
                                    <Settings size={14} className="mr-2" />
                                    Adjust Settings
                                </Button>
                            </Link>
                        </CardContent>
                    </CardRoot>

                    <CardRoot className="bg-surface border-divider border overflow-hidden">
                        <CardHeader className="p-6 border-b border-divider bg-default-50">
                            <div className="flex items-center gap-3">
                                <Activity className="text-primary" size={20} />
                                <p className="font-black uppercase tracking-widest text-sm text-white">Recent Activity</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-divider/50">
                                {(postHistory || []).slice(0, 3).map((post) => (
                                    <div key={post._id} className="p-4 flex items-center justify-between hover:bg-default-50/50 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-bold text-default-400">{format(post.timestamp, "MMM d, h:mm a")}</p>
                                            <p className="text-xs font-black truncate max-w-[150px] text-white">
                                                {post.status === "success" ? "Post Successful" : "Post Failed"}
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
                            </div>
                            <Link href="/posts" className="block w-full">
                                <Button variant="ghost" className="w-full rounded-none h-10 font-black uppercase text-[10px] tracking-widest text-default-400 hover:text-primary hover:bg-primary/5 transition-all">
                                    View Full History
                                    <ArrowRight size={12} className="ml-1" />
                                </Button>
                            </Link>
                        </CardContent>
                    </CardRoot>
                </div>
            </div>
        </div>
    );
}
