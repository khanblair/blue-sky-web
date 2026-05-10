"use client";

import { useState, useEffect } from "react";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
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
    Users,
    ExternalLink,
    X,
    Calendar,
    Tag,
    Mic,
    Hash,
    Layers,
    Bot,
    Zap,
    Key,
} from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { UsageBar, UpsellBanner } from "@/components/ui";
import { PLAN_LIMITS, type PlanId } from "@/lib/plans";

type PostRecord = {
    _id: string;
    content?: string;
    error?: string;
    status: string;
    timestamp: number;
    blueskyUri?: string;
};

export default function DashboardPage() {
    const user = useQuery(api.users.getCurrentUser);
    const preferences = useQuery(api.users.getPreferences);
    const stats = useQuery(api.posting.getStats);
    const history = useQuery(api.posting.getPostHistory);
    const planDetails = useQuery(api.subscriptions.getPlanDetails);
    const engagementStats = useQuery(api.engagement.getEngagementStats);
    const providerConfigs = useQuery(api.aiGeneration.getProviderConfigs);

    const currentPlan = planDetails?.plan ?? "starter";
    const limits = planDetails?.limits ?? PLAN_LIMITS.starter;
    const usage = planDetails?.usage;

    const updateUser = useMutation(api.users.createOrUpdateUser);
    const postNow = useAction(api.posting.postNow);

    const [isPosting, setIsPosting] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostRecord | null>(null);

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
            await postNow({ text: "" });
            alert("Post triggered successfully!");
        } catch (error) {
            alert("Post failed");
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

    const activeProvider = providerConfigs?.find((c: { isActive: boolean }) => c.isActive);

    const planFeatures = [
        { label: "Topics", value: `${limits.maxTopics === Infinity ? "Unlimited" : limits.maxTopics}`, icon: Hash },
        { label: "Subtopics", value: `${limits.maxSubtopics === Infinity ? "Unlimited" : limits.maxSubtopics}`, icon: Layers },
        { label: "Post Interval", value: `${limits.minGenerateIntervalHours}h min`, icon: Clock },
        { label: "Custom Model", value: limits.customModel ? "Yes" : "No", icon: Bot },
        { label: "BYOK", value: limits.byok ? "Yes" : "No", icon: Key },
        { label: "Notifications", value: limits.notifications ? "Yes" : "No", icon: Zap },
    ];

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
                    {limits.autoReply && (
                        <UsageBar
                            label="Auto-Replies"
                            current={usage?.autoRepliesUsed ?? 0}
                            limit={limits.autoRepliesPerMonth}
                        />
                    )}
                    {limits.reciprocalEngagement && (
                        <UsageBar
                            label="Reciprocal Engagement"
                            current={usage?.reciprocalEngagementsUsed ?? 0}
                            limit={limits.reciprocalEngagementsPerMonth}
                        />
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* People Reached */}
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Users className="text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] text-default-500 font-black uppercase tracking-widest mb-1 opacity-70">People Reached</p>
                            <p className="text-2xl font-black text-blue-500 leading-none">{engagementStats?.totalInteractors || 0}</p>
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

                {/* Strategy — read-only display */}
                <TabPanel id="preferences">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CardRoot className="bg-surface border-divider border shadow-sm">
                            <CardHeader className="flex items-center justify-between p-6 pb-4">
                                <div className="flex items-center gap-3">
                                    <Bot className="text-primary" size={18} />
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight text-white">Current Strategy</p>
                                        <p className="text-[9px] text-default-500 uppercase tracking-widest">Your AI configuration at a glance</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-[10px] font-bold uppercase tracking-widest text-primary"
                                    onPress={() => window.location.href = "/settings"}
                                >
                                    Edit <Settings size={12} className="ml-1" />
                                </Button>
                            </CardHeader>
                            <div className="h-px bg-divider" />
                            <CardContent className="p-6 space-y-5">
                                {/* Topics */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-default-400 flex items-center gap-1.5">
                                        <Hash size={11} /> Topics
                                    </p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {preferences?.topics.length ? preferences.topics.map((t: string) => (
                                            <Chip key={t} size="sm" variant="soft" className="bg-primary/10 text-primary font-bold text-[10px]">
                                                {t}
                                            </Chip>
                                        )) : (
                                            <span className="text-xs text-default-500 italic">No topics configured</span>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-default-500">
                                        {preferences?.topics.length ?? 0}/{limits.maxTopics === Infinity ? "∞" : limits.maxTopics} topics used
                                    </p>
                                </div>

                                {/* Tone */}
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-default-400 flex items-center gap-1.5">
                                        <Mic size={11} /> Writing Tone
                                    </p>
                                    <p className="text-sm font-bold text-white capitalize">{preferences?.tone || "Professional"}</p>
                                </div>

                                {/* Frequency */}
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-default-400 flex items-center gap-1.5">
                                        <Calendar size={11} /> Posting Frequency
                                    </p>
                                    <p className="text-sm font-bold text-white">Every {preferences?.frequency ?? 24} hours</p>
                                    <p className="text-[9px] text-default-500">Min {limits.minGenerateIntervalHours}h for {limits.label} plan</p>
                                </div>

                                {/* AI Model */}
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-default-400 flex items-center gap-1.5">
                                        <Bot size={11} /> AI Model
                                    </p>
                                    <p className="text-sm font-bold text-white">
                                        {activeProvider ? `${activeProvider.model}` : "DeepSeek (default)"}
                                    </p>
                                    <p className="text-[9px] text-default-500">
                                        {activeProvider ? `via ${activeProvider.provider}` : "Platform default"}
                                    </p>
                                </div>
                            </CardContent>
                        </CardRoot>

                        <div className="flex flex-col gap-6">
                            {/* Automation toggle */}
                            <CardRoot className="bg-surface border-divider border shadow-sm">
                                <CardContent className="flex flex-row items-center justify-between p-5">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-bold uppercase tracking-tight text-white">Automated Posting</p>
                                        <p className="text-[10px] text-default-500 uppercase tracking-widest opacity-60">Toggle entire automation system</p>
                                    </div>
                                    <Switch
                                        isSelected={user?.isActive}
                                        onChange={handleToggleActive}
                                    />
                                </CardContent>
                            </CardRoot>

                            {/* Plan limits */}
                            <CardRoot className="bg-surface border-divider border shadow-sm">
                                <CardHeader className="p-5 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Tag size={14} className="text-warning" />
                                        <p className="text-xs font-black uppercase tracking-widest text-white">{limits.label} Plan</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 pt-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        {planFeatures.map(({ label, value, icon: Icon }) => (
                                            <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03]">
                                                <Icon size={12} className="text-default-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black uppercase text-default-500">{label}</p>
                                                    <p className="text-xs font-bold text-white">{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="mt-3 w-full text-[10px] font-bold uppercase tracking-widest text-primary"
                                        onPress={() => window.location.href = "/billing"}
                                    >
                                        Upgrade Plan
                                    </Button>
                                </CardContent>
                            </CardRoot>
                        </div>
                    </div>
                </TabPanel>

                {/* History — clickable records with detail modal */}
                <TabPanel id="history">
                    <CardRoot className="bg-surface border-divider border shadow-sm">
                        <CardContent className="p-0">
                            {/* Mobile card list */}
                            <div className="sm:hidden divide-y divide-divider/40">
                                {(history || []).length === 0 ? (
                                    <p className="px-6 py-12 text-center text-default-500 font-bold text-sm">No post history yet</p>
                                ) : (
                                    (history || []).map((post: PostRecord) => (
                                        <div
                                            key={post._id}
                                            className="p-4 flex flex-col gap-2.5 cursor-pointer active:bg-default-50/20 transition-colors"
                                            onClick={() => setSelectedPost(post)}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <Chip
                                                    variant="soft"
                                                    color={post.status === "success" ? "success" : "danger"}
                                                    size="sm"
                                                    className="font-black text-[9px] uppercase tracking-widest h-5 px-2 shrink-0"
                                                >
                                                    {post.status}
                                                </Chip>
                                                <span className="text-[10px] font-bold text-default-500">
                                                    {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-white/90 line-clamp-2">{post.content || post.error || "No content"}</p>
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
                                            (history || []).map((post: PostRecord) => (
                                                <tr
                                                    key={post._id}
                                                    className="border-b border-divider/40 last:border-0 hover:bg-default-50 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedPost(post)}
                                                >
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
                                                                onClick={(e) => e.stopPropagation()}
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

            {/* Post Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setSelectedPost(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            transition={{ type: "spring", damping: 28, stiffness: 320 }}
                            className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col z-10 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-7 pb-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <Chip
                                        variant="soft"
                                        color={selectedPost.status === "success" ? "success" : "danger"}
                                        size="sm"
                                        className="font-black text-[9px] uppercase tracking-widest h-6 px-3"
                                    >
                                        {selectedPost.status}
                                    </Chip>
                                    <span className="text-xs text-default-500">
                                        {format(selectedPost.timestamp, "MMM d, yyyy 'at' h:mm a")}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-7 flex flex-col gap-4 overflow-y-auto max-h-[50vh]">
                                {selectedPost.content && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-default-400">Post Content</p>
                                        <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
                                    </div>
                                )}

                                {selectedPost.error && (
                                    <div className="p-3 rounded-xl bg-danger/5 border border-danger/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-danger mb-1">Error</p>
                                        <p className="text-xs text-danger/80">{selectedPost.error}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 text-[10px] text-default-500">
                                    <span>{formatDistanceToNow(selectedPost.timestamp, { addSuffix: true })}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-7 pt-5 border-t border-white/5 bg-white/[0.02] flex gap-3">
                                {selectedPost.blueskyUri && (
                                    <a
                                        href={`https://bsky.app/profile/${user?.handle}/post/${selectedPost.blueskyUri.split('/').pop()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                        View on Bluesky
                                    </a>
                                )}
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="px-4 py-3 rounded-xl bg-white/5 text-zinc-400 text-sm font-bold hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
