"use client";

import { useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FilterTab = "all" | "success" | "failed" | "pending";

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
}: {
    selected: SelectedPost;
    onClose: () => void;
    onRetry: (id: Id<"postHistory">) => Promise<void>;
    onDelete: (id: Id<"pendingPosts">) => Promise<void>;
    onPostNow: (id: Id<"pendingPosts">) => Promise<void>;
    onSaveEdit: (id: Id<"pendingPosts">, content: string) => Promise<void>;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(
        selected.kind === "pending" ? selected.post.content : "",
    );
    const [busy, setBusy] = useState<string | null>(null);

    const isPending = selected.kind === "pending";
    const isHistory = selected.kind === "history";
    const post = selected.kind === "pending" ? selected.post : selected.post;
    const content = post.content;
    const status = post.status;

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

    const [filter, setFilter] = useState<FilterTab>("all");
    const [selected, setSelected] = useState<SelectedPost | null>(null);

    const loading = history === undefined || pendingData === undefined;

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

    const successCount = history.filter((p) => p.status === "success").length;
    const failedCount = history.filter((p) => p.status === "failed").length;
    const pendingCount = pendingData.posts.length;
    const totalCount = history.length + pendingCount;

    const TABS: { key: FilterTab; label: string; count: number; color: string }[] = [
        { key: "all",     label: "All",     count: totalCount,   color: "text-white" },
        { key: "pending", label: "Pending", count: pendingCount, color: "text-warning" },
        { key: "success", label: "Posted",  count: successCount, color: "text-success" },
        { key: "failed",  label: "Failed",  count: failedCount,  color: "text-danger" },
    ];

    const openPending = (post: PendingPost) =>
        setSelected({ kind: "pending", post, estPublish: publishTimes.get(post._id) });

    const openHistory = (post: HistoryPost) =>
        setSelected({ kind: "history", post });

    return (
        <>
            <div className="flex flex-col gap-6 pb-12">
                <header>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase text-white">Posts</h1>
                    <p className="text-default-500">Your full post history and scheduled queue</p>
                </header>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 bg-default-50 border border-divider rounded-xl w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-2 px-4 h-8 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
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
                                {(filter === "all" || filter === "pending") &&
                                    pendingData.posts.map((post) => {
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
                                {(history ?? [])
                                    .filter((p) => {
                                        if (filter === "all") return true;
                                        if (filter === "success") return p.status === "success";
                                        if (filter === "failed") return p.status === "failed";
                                        return false;
                                    })
                                    .map((post) => (
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

                                {/* Empty state */}
                                {((filter === "all" && totalCount === 0) ||
                                    (filter === "pending" && pendingCount === 0) ||
                                    (filter === "success" && successCount === 0) ||
                                    (filter === "failed" && failedCount === 0)) && (
                                    <tr>
                                        <td colSpan={3}>
                                            <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
                                                <History size={48} className="text-default-300" />
                                                <p className="font-bold text-sm text-default-400">
                                                    No {filter === "all" ? "" : filter} posts found
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
                    />
                )}
            </AnimatePresence>
        </>
    );
}
