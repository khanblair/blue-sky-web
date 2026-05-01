"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CardRoot, CardContent, Chip } from "@heroui/react";
import {
    History,
    ExternalLink,
    Loader2,
    RotateCcw,
    Pencil,
    Trash2,
    Check,
    X,
    Clock,
    Send,
    AlertCircle,
    Calendar,
    FileText,
    MessageSquare,
    RefreshCw,
    Search,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FilterTab = "all" | "success" | "failed" | "pending" | "comments";

type PendingPost = {
    _id: string;
    content: string;
    generatedAt: number;
    status: string;
};

type HistoryPost = {
    _id: string;
    content: string;
    status: string;
    timestamp: number;
    blueskyUri?: string;
    error?: string;
};

type Comment = {
    _id: string;
    authorHandle?: string;
    authorDisplayName?: string;
    authorAvatar?: string;
    content: string;
    createdAt: number;
};

type SelectedPost =
    | { kind: "pending"; post: PendingPost; estPublish: number | undefined }
    | { kind: "history"; post: HistoryPost };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function estimatedPublishTimes(
    posts: { _id: string }[],
    lastPostTime: number,
    intervalHours: number,
): Map<string, number> {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    const now = Date.now();
    let nextMs = Math.max(now, lastPostTime + intervalMs);
    const map = new Map<string, number>();
    for (const p of posts) {
        map.set(p._id, nextMs);
        nextMs += intervalMs;
    }
    return map;
}

function bskyPostUrl(uri: string) {
    const parts = uri.replace("at://", "").split("/");
    const did = parts[0];
    const rkey = parts[parts.length - 1];
    return `https://bsky.app/profile/${did}/post/${rkey}`;
}

function statusColor(status: string): "warning" | "success" | "danger" {
    if (status === "pending") return "warning";
    if (status === "success") return "success";
    return "danger";
}

function statusLabel(status: string) {
    if (status === "pending") return "PENDING";
    if (status === "success") return "POSTED";
    return "FAILED";
}

// ---------------------------------------------------------------------------
// Post Detail Dialog
// ---------------------------------------------------------------------------
function PostDialog({
    selected,
    onClose,
    onRetry,
    onDelete,
    onPostNow,
    onSaveEdit,
    onSyncComments,
}: {
    selected: SelectedPost;
    onClose: () => void;
    onRetry: (id: Id<"postHistory">) => Promise<void>;
    onDelete: (id: Id<"pendingPosts">) => Promise<void>;
    onPostNow: (id: Id<"pendingPosts">) => Promise<void>;
    onSaveEdit: (id: Id<"pendingPosts">, content: string) => Promise<void>;
    onSyncComments: (id: Id<"postHistory">) => Promise<{ success: boolean; count: number }>;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(
        selected.kind === "pending" ? selected.post.content : "",
    );
    const [busy, setBusy] = useState<string | null>(null);
    const [syncingComments, setSyncingComments] = useState(false);

    const isPending = selected.kind === "pending";
    const isHistory = selected.kind === "history";
    const post = selected.kind === "pending" ? selected.post : selected.post;
    const content = post.content;
    const status = post.status;

    // Fetch comments for history posts
    const comments = useQuery(
        api.posting.getCommentsForPost,
        isHistory ? { postHistoryId: selected.post._id as Id<"postHistory"> } : "skip"
    );

    const run = async (key: string, fn: () => Promise<void>) => {
        setBusy(key);
        try {
            await fn();
            onClose();
        } catch (e: any) {
            alert(e.message ?? String(e));
        } finally {
            setBusy(null);
        }
    };

    const handleSyncComments = async () => {
        if (!isHistory) return;
        setSyncingComments(true);
        try {
            await onSyncComments(selected.post._id as Id<"postHistory">);
        } catch (e: any) {
            alert(e.message ?? String(e));
        } finally {
            setSyncingComments(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col z-10 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-7 pb-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            status === "pending" ? "bg-warning/10 ring-1 ring-warning/20" :
                            status === "success" ? "bg-success/10 ring-1 ring-success/20" :
                            "bg-danger/10 ring-1 ring-danger/20"
                        }`}>
                            {status === "pending" && <Clock size={16} className="text-warning" />}
                            {status === "success" && <Check size={16} className="text-success" />}
                            {status === "failed" && <AlertCircle size={16} className="text-danger" />}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-white">
                                Post Details
                            </p>
                            <Chip
                                variant="soft"
                                color={statusColor(status)}
                                size="sm"
                                className="font-black text-[8px] uppercase tracking-widest h-5 mt-0.5"
                            >
                                {statusLabel(status)}
                            </Chip>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-7 flex flex-col gap-5 overflow-y-auto max-h-[60vh]">
                    {/* Content */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                            <FileText size={11} /> Content
                        </p>
                        {editing && isPending ? (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    rows={5}
                                    maxLength={300}
                                    className="w-full bg-white/[0.04] border border-primary/40 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-primary transition-colors"
                                />
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold ${draft.length > 280 ? "text-danger" : "text-zinc-500"}`}>
                                        {draft.length}/300
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditing(false); setDraft(content); }}
                                            className="h-7 px-3 rounded-lg border border-white/10 text-[10px] font-black text-zinc-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => run("save", () =>
                                                onSaveEdit(selected.post._id as Id<"pendingPosts">, draft)
                                            )}
                                            disabled={busy === "save" || !draft.trim()}
                                            className="h-7 px-3 rounded-lg bg-primary/20 border border-primary/40 text-[10px] font-black text-primary hover:bg-primary/30 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                                        >
                                            {busy === "save" ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-white/90 leading-relaxed bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">
                                {content || <span className="text-zinc-500 italic">No content recorded</span>}
                            </p>
                        )}
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Timestamp */}
                        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1 mb-1">
                                <Calendar size={9} />
                                {isPending ? "Generated" : "Posted"}
                            </p>
                            <p className="text-xs font-black text-white">
                                {format(
                                    isPending
                                        ? (selected as any).post.generatedAt
                                        : (selected as any).post.timestamp,
                                    "MMM d, yyyy"
                                )}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                                {format(
                                    isPending
                                        ? (selected as any).post.generatedAt
                                        : (selected as any).post.timestamp,
                                    "h:mm a"
                                )}
                            </p>
                        </div>

                        {/* Est. publish / Bluesky link */}
                        {isPending && (selected as any).estPublish ? (
                            <div className="bg-warning/5 rounded-xl p-3 border border-warning/10">
                                <p className="text-[9px] font-black uppercase tracking-widest text-warning/70 flex items-center gap-1 mb-1">
                                    <Clock size={9} /> Est. Publish
                                </p>
                                <p className="text-xs font-black text-warning">
                                    {format((selected as any).estPublish, "MMM d, yyyy")}
                                </p>
                                <p className="text-[10px] text-warning/70">
                                    {format((selected as any).estPublish, "h:mm a")}
                                </p>
                            </div>
                        ) : isHistory && (selected as any).post.blueskyUri ? (
                            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                                    Bluesky
                                </p>
                                <a
                                    href={bskyPostUrl((selected as any).post.blueskyUri)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                                >
                                    View post <ExternalLink size={10} />
                                </a>
                            </div>
                        ) : null}
                    </div>

                    {/* Error detail for failed */}
                    {isHistory && status === "failed" && (selected as any).post.error && (
                        <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-danger/70 mb-1 flex items-center gap-1">
                                <AlertCircle size={9} /> Error
                            </p>
                            <p className="text-xs text-danger/90 font-mono leading-relaxed">
                                {(selected as any).post.error}
                            </p>
                        </div>
                    )}

                    {/* Comments section for history posts */}
                    {isHistory && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                    <MessageSquare size={11} /> Comments
                                </p>
                                {(selected as any).post.blueskyUri && (
                                    <button
                                        onClick={handleSyncComments}
                                        disabled={syncingComments}
                                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1 disabled:opacity-40"
                                    >
                                        {syncingComments ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                                        Sync
                                    </button>
                                )}
                            </div>
                            <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
                                {comments === undefined ? (
                                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                                        <Loader2 size={24} className="text-primary animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            Fetching comments...
                                        </p>
                                    </div>
                                ) : comments.length > 0 ? (
                                    <div className="divide-y divide-white/5 max-h-[200px] overflow-y-auto">
                                        {comments.map((comment) => (
                                            <div key={comment._id} className="p-3 flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                                                    {comment.authorAvatar ? (
                                                        <img
                                                            src={comment.authorAvatar}
                                                            alt={comment.authorDisplayName || comment.authorHandle}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] font-black text-primary">
                                                            {(comment.authorDisplayName || comment.authorHandle || "U").charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[11px] font-black text-white">
                                                            {comment.authorDisplayName || comment.authorHandle || "Anonymous"}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-500">
                                                            {format(comment.createdAt, "MMM d")}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white/80 leading-relaxed">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 flex flex-col items-center justify-center gap-2">
                                        <MessageSquare size={24} className="text-zinc-600" />
                                        <p className="text-xs text-zinc-500">
                                            {!(selected as any).post.blueskyUri
                                                ? "Post not published to Bluesky yet"
                                                : "No comments yet"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="p-5 border-t border-white/5 flex gap-2">
                    {/* PENDING actions */}
                    {isPending && !editing && (
                        <>
                            <button
                                onClick={() => setEditing(true)}
                                className="flex-1 h-10 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-zinc-300 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <Pencil size={13} /> Edit
                            </button>
                            <button
                                onClick={() => run("post", () =>
                                    onPostNow(selected.post._id as Id<"pendingPosts">)
                                )}
                                disabled={busy === "post"}
                                className="flex-1 h-10 rounded-xl bg-primary/20 border border-primary/30 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                {busy === "post" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                Post Now
                            </button>
                            <button
                                onClick={() => run("delete", () =>
                                    onDelete(selected.post._id as Id<"pendingPosts">)
                                )}
                                disabled={busy === "delete"}
                                className="h-10 w-10 rounded-xl border border-white/10 text-zinc-500 hover:text-danger hover:border-danger/40 transition-colors flex items-center justify-center disabled:opacity-40"
                            >
                                {busy === "delete" ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
                        </>
                    )}

                    {/* FAILED actions */}
                    {isHistory && status === "failed" && (
                        <>
                            <button
                                onClick={() => run("retry", () =>
                                    onRetry(selected.post._id as Id<"postHistory">)
                                )}
                                disabled={busy === "retry"}
                                className="flex-1 h-10 rounded-xl bg-warning/10 border border-warning/20 text-[11px] font-black uppercase tracking-widest text-warning hover:bg-warning/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                {busy === "retry" ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                                Retry Post
                            </button>
                        </>
                    )}

                    {/* SUCCESS actions */}
                    {isHistory && status === "success" && (selected as any).post.blueskyUri && (
                        <a
                            href={bskyPostUrl((selected as any).post.blueskyUri)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 h-10 rounded-xl bg-success/10 border border-success/20 text-[11px] font-black uppercase tracking-widest text-success hover:bg-success/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <ExternalLink size={13} /> View on Bluesky
                        </a>
                    )}

                    {/* Always show close */}
                    <button
                        onClick={onClose}
                        className="h-10 px-4 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PostsPage() {
    const history = useQuery(api.posting.getPostHistory);
    const pendingData = useQuery(api.posting.getAllPendingPosts);
    const retryPost = useAction(api.posting.retryFailedPost);
    const postPendingNow = useAction(api.posting.postPendingNow);
    const deletePost = useMutation(api.posting.deletePendingPost);
    const updatePost = useMutation(api.posting.updatePendingPost);
    const syncComments = useAction(api.posting.syncCommentsForPost);

    const [filter, setFilter] = useState<FilterTab>("all");
    const [selected, setSelected] = useState<SelectedPost | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const loading = history === undefined || pendingData === undefined;

    const filteredPending = useMemo(() => {
        if (!pendingData?.posts) return [];
        return pendingData.posts.filter(p => 
            p.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [pendingData?.posts, searchQuery]);

    const filteredHistory = useMemo(() => {
        if (!history) return [];
        return history.filter(p => {
            const matchesSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filter === "all" || 
                               (filter === "success" && p.status === "success") || 
                               (filter === "failed" && p.status === "failed");
            return matchesSearch && matchesFilter;
        });
    }, [history, filter, searchQuery]);

    const allComments = useQuery(api.posting.getAllComments) || [];

    const filteredComments = useMemo(() => {
        return allComments.filter(c => {
            const matchesSearch = c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (c.authorDisplayName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (c.authorHandle || "").toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [allComments, searchQuery]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const publishTimes = estimatedPublishTimes(
        pendingData.posts,
        pendingData.lastPostTime,
        pendingData.postIntervalHours,
    );

    // Counts for tabs - search aware
    const matchPendingCount = pendingData.posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase())).length;
    const matchSuccessCount = history.filter(p => p.status === "success" && p.content.toLowerCase().includes(searchQuery.toLowerCase())).length;
    const matchFailedCount = history.filter(p => p.status === "failed" && p.content.toLowerCase().includes(searchQuery.toLowerCase())).length;
    const matchCommentsCount = filteredComments.length;
    const matchTotalCount = matchPendingCount + matchSuccessCount + matchFailedCount;

    const TABS: { key: FilterTab; label: string; count: number; color: string }[] = [
        { key: "all",      label: "All",      count: matchTotalCount,   color: "text-white" },
        { key: "pending",  label: "Pending",  count: matchPendingCount, color: "text-warning" },
        { key: "success",  label: "Posted",   count: matchSuccessCount, color: "text-success" },
        { key: "failed",   label: "Failed",   count: matchFailedCount,  color: "text-danger" },
        { key: "comments", label: "Comments", count: matchCommentsCount, color: "text-primary" },
    ];

    const openPending = (post: PendingPost) =>
        setSelected({ kind: "pending", post, estPublish: publishTimes.get(post._id) });

    const openHistory = (post: HistoryPost) =>
        setSelected({ kind: "history", post });

    const showPending = filter === "all" || filter === "pending";

    return (
        <>
            <div className="flex flex-col gap-6 pb-12">
                <header>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase text-white">Posts</h1>
                    <p className="text-default-500">Your full post history and scheduled queue</p>
                </header>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Filter tabs - Scrollable on mobile */}
                        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <div className="flex items-center gap-1 p-1 bg-default-50 border border-divider rounded-xl w-max">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setFilter(tab.key)}
                                        className={`flex items-center gap-2 px-4 h-8 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                            filter === tab.key
                                                ? "bg-black text-white shadow"
                                                : "text-default-400 hover:text-white"
                                        }`}
                                    >
                                        {tab.label}
                                        <span className={`text-[10px] font-black ${filter === tab.key ? tab.color : "text-default-500"}`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative group w-full md:w-72">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-primary transition-colors">
                                <Search size={15} strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                placeholder={filter === "comments" ? "Search comments..." : "Search posts..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <CardRoot className="bg-surface border-divider border">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full min-w-full border-collapse">
                            <thead>
                                <tr className="border-b border-divider bg-default-50/50">
                                    {["STATUS", "CONTENT", "TIMESTAMP"].map((col) => (
                                        <th
                                            key={col}
                                            className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-default-400 text-left"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* ── Pending rows ── */}
                                {showPending &&
                                    filteredPending.map((post) => {
                                        const estTime = publishTimes.get(post._id);
                                        return (
                                            <tr
                                                key={post._id}
                                                onClick={() => openPending(post)}
                                                className="border-b border-divider/50 last:border-none hover:bg-default-50/30 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-5 align-top">
                                                    <Chip variant="soft" color="warning" size="sm"
                                                        className="font-black text-[9px] uppercase tracking-widest h-6">
                                                        PENDING
                                                    </Chip>
                                                </td>
                                                <td className="max-w-md px-6 py-5 align-top">
                                                    <p className="text-sm font-bold text-white/90 line-clamp-2 leading-relaxed">
                                                        {post.content}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5 align-top">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] font-bold text-default-500 uppercase tracking-widest flex items-center gap-1">
                                                            <Clock size={10} /> Est. publish
                                                        </span>
                                                        {estTime ? (
                                                            <>
                                                                <span className="text-[11px] font-black text-warning">
                                                                    {format(estTime, "MMM d, yyyy")}
                                                                </span>
                                                                <span className="text-[9px] font-bold text-default-400 uppercase tracking-tighter">
                                                                    {format(estTime, "h:mm a")}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[11px] text-default-500">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                {/* ── History rows ── */}
                                {filter !== "comments" && filteredHistory.map((post) => (
                                        <tr
                                            key={post._id}
                                            onClick={() => openHistory(post)}
                                            className="border-b border-divider/50 last:border-none hover:bg-default-50/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-5 align-top">
                                                <Chip
                                                    variant="soft"
                                                    color={post.status === "success" ? "success" : "danger"}
                                                    size="sm"
                                                    className="font-black text-[9px] uppercase tracking-widest h-6"
                                                >
                                                    {post.status === "success" ? "POSTED" : "FAILED"}
                                                </Chip>
                                                {post.status === "failed" && post.error && (
                                                    <p className="text-[9px] text-danger/70 mt-1 max-w-[120px] line-clamp-1">
                                                        {post.error}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="max-w-md px-6 py-5 align-top">
                                                <p className="text-sm font-bold text-white/90 line-clamp-2 leading-relaxed">
                                                    {post.content || (
                                                        <span className="text-default-300 italic font-normal">
                                                            No content recorded
                                                        </span>
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-white">
                                                        {format(post.timestamp, "MMM d, yyyy")}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-default-400 uppercase tracking-tighter">
                                                        {format(post.timestamp, "h:mm a")}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                {/* ── Comment rows ── */}
                                {filter === "comments" && filteredComments.map((comment) => (
                                    <tr
                                        key={comment._id}
                                        className="border-b border-divider/50 last:border-none hover:bg-default-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-5 align-top">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {comment.authorAvatar ? (
                                                        <img src={comment.authorAvatar} alt="avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px] font-black text-primary">
                                                            {(comment.authorDisplayName || comment.authorHandle || "U").charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <Chip variant="soft" color="accent" size="sm" className="font-black text-[8px] uppercase h-5">
                                                    COMMENT
                                                </Chip>
                                            </div>
                                        </td>
                                        <td className="max-w-md px-6 py-5 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-zinc-400">
                                                    {comment.authorDisplayName || (comment.authorHandle ? `@${comment.authorHandle}` : "Anonymous")}
                                                </span>
                                                <p className="text-sm font-bold text-white/90 line-clamp-2 leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-top">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white">
                                                    {format(comment.createdAt, "MMM d, yyyy")}
                                                </span>
                                                <span className="text-[9px] font-bold text-default-400 uppercase tracking-tighter">
                                                    {format(comment.createdAt, "h:mm a")}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Empty state */}
                                {filteredPending.length === 0 && filteredHistory.length === 0 && (filter !== "comments" || filteredComments.length === 0) && (
                                    <tr>
                                        <td colSpan={3}>
                                            <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
                                                {searchQuery ? (
                                                    <Search size={48} className="text-default-300" />
                                                ) : (
                                                    <History size={48} className="text-default-300" />
                                                )}
                                                <p className="font-bold text-sm text-default-400">
                                                    {searchQuery 
                                                        ? `No posts matching "${searchQuery}"`
                                                        : `No ${filter === "all" ? "" : filter} posts found`
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </CardRoot>
            </div>

            {/* Detail dialog */}
            <AnimatePresence>
                {selected && (
                    <PostDialog
                        selected={selected}
                        onClose={() => setSelected(null)}
                        onRetry={async (id) => {
                            await retryPost({ postHistoryId: id });
                        }}
                        onDelete={async (id) => {
                            await deletePost({ pendingPostId: id });
                        }}
                        onPostNow={async (id) => {
                            await postPendingNow({ pendingPostId: id });
                        }}
                        onSaveEdit={async (id, content) => {
                            await updatePost({ pendingPostId: id, content });
                        }}
                        onSyncComments={async (id) => {
                            return await syncComments({ postHistoryId: id });
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
