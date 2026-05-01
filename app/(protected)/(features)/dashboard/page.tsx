"use client";

import { useState, useEffect } from "react";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
    Label,
    Input,
    Switch,
    Chip,
    TabsRoot,
    TabList,
    Tab,
    TabPanel,
} from "@heroui/react";
import {
    Cloud,
    Settings,
    Play,
    Send,
    MessageSquare,
    Clock,
    Loader2,
    Zap,
    Crown,
} from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { UsageBar, UpsellBanner } from "@/components/ui";
import { PLAN_LIMITS, type PlanId } from "@/lib/plans";

export default function DashboardPage() {
    const user = useQuery(api.users.getCurrentUser);
    const preferences = useQuery(api.users.getPreferences);
    const stats = useQuery(api.posting.getStats);
    const history = useQuery(api.posting.getPostHistory);
    const planDetails = useQuery(api.subscriptions.getPlanDetails);

    const currentPlan = planDetails?.plan ?? "starter";
    const limits = planDetails?.limits ?? PLAN_LIMITS.starter;
    const usage = planDetails?.usage;

    const updateUser = useMutation(api.users.createOrUpdateUser);
    const updatePrefs = useMutation(api.users.updatePreferences);
    const postNow = useAction(api.posting.postNow);

    const [isSaving, setIsSaving] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [topicsStr, setTopicsStr] = useState("");
    const [localPrefs, setLocalPrefs] = useState({
        tone: "professional",
        frequency: 24
    });

    useEffect(() => {
        if (!preferences) return;
        
        const timer = setTimeout(() => {
            setTopicsStr(preferences.topics.join(", "));
            setLocalPrefs({
                tone: preferences.tone,
                frequency: preferences.frequency
            });
        }, 0);

        return () => clearTimeout(timer);
    }, [preferences]);

    const handleSavePreferences = async () => {
        setIsSaving(true);
        try {
            await updatePrefs({
                topics: topicsStr.split(",").map(t => t.trim()).filter(Boolean),
                tone: localPrefs.tone,
                frequency: localPrefs.frequency,
            });
            alert("Preferences saved!");
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save preferences");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async () => {
        if (!user) return;
        try {
            await updateUser({
                handle: user.handle || "",
                appPassword: user.appPassword || "",
                isActive: !user.isActive,
            });
        } catch (error) {
            alert("Toggle failed");
        }
    };

    const handlePostNow = async () => {
        setIsPosting(true);
        try {
            alert("Triggering AI broadcast based on current strategy...");
            await postNow({ text: `AI Broadcast: Exploring ${topicsStr}` });
            alert("Posted successfully!");
        } catch (error) {
            alert("Broadcast failed");
        } finally {
            setIsPosting(false);
        }
    };

    if (user === undefined || preferences === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const nextScheduledDate = preferences?.lastPostTime
        ? new Date(preferences.lastPostTime + (preferences.frequency * 60 * 60 * 1000))
        : null;

    return (
        <div className="flex flex-col gap-6 pb-12">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 uppercase text-white">Dashboard</h1>
                    <p className="text-default-500 text-sm">Manage your automated BlueSky presence</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button
                        variant="outline"
                        className="font-bold border-divider bg-surface flex-1 sm:flex-none"
                        onPress={handleToggleActive}
                    >
                        {user?.isActive ? (
                            <><Play size={16} className="mr-1.5 text-warning fill-warning" /> Pause</>
                        ) : (
                            <><Play size={16} className="mr-1.5 text-success fill-success" /> Resume</>
                        )}
                    </Button>
                    <Button
                        variant="primary"
                        className="font-bold shadow-lg shadow-primary/20 flex-1 sm:flex-none"
                        onPress={handlePostNow}
                        isDisabled={isPosting}
                    >
                        {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="mr-1.5" />}
                        Post Now
                    </Button>
                </div>
            </header>

            <UpsellBanner currentPlan={currentPlan} />

            {currentPlan !== "starter" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-default-400">Usage This Period</h3>
                        <Chip
                            variant="soft"
                            color={currentPlan === "enterprise" ? "warning" : "success"}
                            size="sm"
                            className="font-black text-[9px] uppercase tracking-widest px-2 h-5"
                        >
                            {limits.label}
                        </Chip>
                    </div>
                    <UsageBar
                        label="AI Generations"
                        current={usage?.aiGenerationsUsed ?? 0}
                        limit={limits.aiGenerationsPerMonth}
                    />
                    <UsageBar
                        label="Posts Published"
                        current={usage?.postsPublished ?? 0}
                        limit={limits.postsPerMonth}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Connection Status */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6 overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                            <Cloud className="text-success" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] text-default-500 font-black uppercase tracking-widest mb-1 opacity-70">Account Connection</p>
                            <div className="flex flex-col gap-1">
                                <span className="font-black text-lg tracking-tight truncate leading-none text-white" title={user?.handle}>
                                    {user?.handle || "Not Connected"}
                                </span>
                                <div className="flex items-center">
                                    <Chip
                                        variant="soft"
                                        color={user?.isActive ? "success" : "default"}
                                        size="sm"
                                        className="text-[9px] uppercase font-bold tracking-[0.1em] px-2 h-5 min-h-0"
                                    >
                                        {user?.isActive ? "Active" : "Inactive"}
                                    </Chip>
                                </div>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" className="w-8 h-8 min-w-0 p-0 flex-shrink-0" onPress={() => window.location.href = "/settings"}>
                            <Settings size={18} className="text-default-400" />
                        </Button>
                    </CardContent>
                </CardRoot>

                {/* Post Stats */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] text-default-500 font-black uppercase tracking-widest mb-1 opacity-70">Total Posts Made</p>
                            <p className="text-2xl font-black text-primary leading-none">{stats?.totalPosts || 0}</p>
                        </div>
                    </CardContent>
                </CardRoot>

                {/* Next Scheduled */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="text-warning" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] text-default-500 font-black uppercase tracking-widest mb-1 opacity-70">Next Scheduled</p>
                            <p className="text-lg font-bold tracking-tight leading-none truncate text-white">
                                {nextScheduledDate
                                    ? nextScheduledDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : "Not Scheduled"}
                            </p>
                        </div>
                    </CardContent>
                </CardRoot>
            </div>

            <TabsRoot aria-label="Dashboard Tabs" className="w-full">
                <TabList className="gap-4 sm:gap-6 w-full relative rounded-none p-0 border-b border-divider mb-6">
                    <Tab id="preferences" className="font-bold text-base sm:text-lg px-0 pb-3 h-auto data-[selected=true]:text-primary data-[selected=true]:border-b-2 data-[selected=true]:border-primary transition-all rounded-none bg-transparent uppercase tracking-tight">
                        Strategy
                    </Tab>
                    <Tab id="history" className="font-bold text-base sm:text-lg px-0 pb-3 h-auto data-[selected=true]:text-primary data-[selected=true]:border-b-2 data-[selected=true]:border-primary transition-all rounded-none bg-transparent uppercase tracking-tight">
                        History
                    </Tab>
                </TabList>

                <TabPanel id="preferences">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CardRoot className="p-4 bg-surface border-divider border shadow-sm">
                            <CardHeader className="flex gap-3 pb-4">
                                <Cloud className="text-primary" />
                                <div className="flex flex-col">
                                    <p className="text-md font-bold uppercase tracking-tight text-white">Content Strategy</p>
                                    <p className="text-small text-default-500 uppercase tracking-tighter text-[9px]">Refine your AI&apos;s writing style</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-6 pt-4">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Topics (comma separated)</Label>
                                        <Input
                                            placeholder="Tech, Philosophy, AI"
                                            value={topicsStr}
                                            onChange={(e) => setTopicsStr(e.target.value)}
                                            className="bg-default-50 border-divider"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Writing Tone</Label>
                                        <Input
                                            placeholder="Professional yet witty"
                                            value={localPrefs.tone}
                                            onChange={(e) => setLocalPrefs({ ...localPrefs, tone: e.target.value })}
                                            className="bg-default-50 border-divider"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Posting Frequency (Hours)</Label>
                                        <Input
                                            placeholder="24"
                                            type="number"
                                            value={localPrefs.frequency.toString()}
                                            onChange={(e) => setLocalPrefs({ ...localPrefs, frequency: parseInt(e.target.value) || 1 })}
                                            className="bg-default-50 border-divider"
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    className="mt-4 font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20"
                                    onPress={handleSavePreferences}
                                    isDisabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Save Strategy"}
                                </Button>
                            </CardContent>
                        </CardRoot>

                        <div className="flex flex-col gap-8">
                            <CardRoot className="p-4 bg-surface border-divider border shadow-sm">
                                <CardContent className="flex flex-row items-center justify-between p-4">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-md font-bold uppercase tracking-tight text-white">Automated Posting</p>
                                        <p className="text-[10px] text-default-500 uppercase tracking-widest opacity-60">Toggle entire automation system</p>
                                    </div>
                                    <Switch
                                        isSelected={user?.isActive}
                                        onChange={handleToggleActive}
                                    />
                                </CardContent>
                            </CardRoot>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel id="history">
                    <CardRoot className="bg-surface border-divider border shadow-sm">
                        <CardContent className="p-0">
                            {/* Mobile card list */}
                            <div className="sm:hidden divide-y divide-divider/40">
                                {(history || []).length === 0 ? (
                                    <p className="px-6 py-12 text-center text-default-500 font-bold text-sm">No post history yet</p>
                                ) : (
                                    (history || []).map((post) => (
                                        <div key={post._id} className="p-4 flex flex-col gap-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <Chip
                                                    variant="soft"
                                                    color={post.status === "success" ? "success" : "danger"}
                                                    size="sm"
                                                    className="font-black text-[9px] uppercase tracking-widest h-5 px-2 shrink-0"
                                                >
                                                    {post.status}
                                                </Chip>
                                                <span className="text-[10px] font-bold text-default-500 uppercase">
                                                    {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-white/90 line-clamp-2">{post.content || post.error || "No content"}</p>
                                            {post.blueskyUri && (
                                                <a
                                                    href={`https://bsky.app/profile/${user?.handle}/post/${post.blueskyUri.split('/').pop()}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-black uppercase tracking-widest text-primary"
                                                >
                                                    View Post →
                                                </a>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            {/* Desktop table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full min-w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-divider bg-default-50/50">
                                            {["CONTENT", "TIMESTAMP", "STATUS", "ACTION"].map((col) => (
                                                <th key={col} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-default-400 ${col === "ACTION" ? "text-right pr-8" : "text-left"}`}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(history || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-default-500 font-bold text-sm">
                                                    No post history yet
                                                </td>
                                            </tr>
                                        ) : (
                                            (history || []).map((post) => (
                                                <tr key={post._id} className="border-b border-divider/40 last:border-0 hover:bg-default-50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <p className="line-clamp-1 text-sm font-bold tracking-tight text-white/90">{post.content || post.error || "No content"}</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-[11px] font-bold text-default-500 uppercase">
                                                            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <Chip
                                                            variant="soft"
                                                            color={post.status === "success" ? "success" : "danger"}
                                                            size="sm"
                                                            className="font-black text-[9px] uppercase tracking-widest h-6 px-3"
                                                        >
                                                            {post.status}
                                                        </Chip>
                                                    </td>
                                                    <td className="px-6 py-5 text-right pr-8">
                                                        {post.blueskyUri ? (
                                                            <a
                                                                href={`https://bsky.app/profile/${user?.handle}/post/${post.blueskyUri.split('/').pop()}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                                            >
                                                                View Post
                                                            </a>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">N/A</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </CardRoot>
                </TabPanel>
            </TabsRoot>
        </div>
    );
}
