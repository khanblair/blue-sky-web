"use client";

import { useState, useMemo } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CardRoot, CardContent, Chip } from "@heroui/react";
import {
    Users,
    Search,
    Loader2,
    MessageSquare,
    Heart,
    ArrowRightLeft,
    UserPlus,
    ExternalLink,
    RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FilterTab = "all" | "commenters" | "likers" | "engaged";

type Interactor = {
    did: string;
    handle: string;
    displayName: string;
    avatar: string;
    commentCount: number;
    likeCount: number;
    engagedCount: number;
    lastInteractionDate: number;
};

type InteractionDetail = {
    comments: Array<{
        _id: string;
        content: string;
        createdAt: number;
        blueskyUri: string;
    }>;
    likes: Array<{
        _id: string;
        indexedAt: number;
    }>;
    replies: Array<{
        _id: string;
        content: string;
        status: string;
        createdAt: number;
        originalComment: string;
    }>;
    engagementLog: Array<{
        _id: string;
        actionType: string;
        content?: string;
        status: string;
        createdAt: number;
    }>;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PeoplePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [selectedPerson, setSelectedPerson] = useState<Interactor | null>(null);

    const interactors = useQuery(api.engagement.getAllInteractors);
    const stats = useQuery(api.engagement.getEngagementStats);
    const interactions = useQuery(
        api.engagement.getInteractionsForPerson,
        selectedPerson ? { targetDid: selectedPerson.did } : "skip"
    );
    const manualEngage = useAction(api.engagement.manualEngageWithPerson);

    const [engaging, setEngaging] = useState<string | null>(null);

    // Filter and search
    const filtered = useMemo(() => {
        if (!interactors) return [];
        let list: Interactor[] = interactors as Interactor[];

        if (activeTab === "commenters") list = list.filter((p) => p.commentCount > 0);
        else if (activeTab === "likers") list = list.filter((p) => p.likeCount > 0);
        else if (activeTab === "engaged") list = list.filter((p) => p.engagedCount > 0);

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    p.handle.toLowerCase().includes(q) ||
                    p.displayName.toLowerCase().includes(q)
            );
        }
        return list;
    }, [interactors, activeTab, searchQuery]);

    const counts = useMemo(() => {
        if (!interactors) return { all: 0, commenters: 0, likers: 0, engaged: 0 };
        const all = interactors as Interactor[];
        return {
            all: all.length,
            commenters: all.filter((p) => p.commentCount > 0).length,
            likers: all.filter((p) => p.likeCount > 0).length,
            engaged: all.filter((p) => p.engagedCount > 0).length,
        };
    }, [interactors]);

    const TABS: { key: FilterTab; label: string; count: number }[] = [
        { key: "all", label: "All", count: counts.all },
        { key: "commenters", label: "Commenters", count: counts.commenters },
        { key: "likers", label: "Likers", count: counts.likers },
        { key: "engaged", label: "Engaged", count: counts.engaged },
    ];

    if (interactors === undefined || stats === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const s = stats as { totalInteractors: number; totalReplies: number; totalReciprocalActions: number };

    return (
        <div className="pb-12 space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 uppercase text-white">
                        People
                    </h1>
                    <p className="text-default-500 text-sm">
                        Everyone who has interacted with your content
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <a
                        href="https://bsky.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                        <ExternalLink size={14} />
                        Open Bluesky
                    </a>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <Users className="text-blue-500" size={22} />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] text-default-500 font-black uppercase tracking-widest">
                                People Reached
                            </p>
                            <p className="text-lg font-black tracking-tight">{s.totalInteractors}</p>
                        </div>
                    </CardContent>
                </CardRoot>

                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                            <MessageSquare className="text-success" size={22} />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] text-default-500 font-black uppercase tracking-widest">
                                Auto-Replies Sent
                            </p>
                            <p className="text-lg font-black tracking-tight">{s.totalReplies}</p>
                        </div>
                    </CardContent>
                </CardRoot>

                <CardRoot className="bg-surface border border-divider/50">
                    <CardContent className="flex flex-row items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                            <ArrowRightLeft className="text-warning" size={22} />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] text-default-500 font-black uppercase tracking-widest">
                                Reciprocal Actions
                            </p>
                            <p className="text-lg font-black tracking-tight">{s.totalReciprocalActions}</p>
                        </div>
                    </CardContent>
                </CardRoot>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.key
                                    ? "bg-blue-600 text-white"
                                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                <div className="relative group w-full sm:w-72">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={15} className="text-zinc-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* People List */}
            <CardRoot className="bg-surface border-divider border">
                <CardContent className="p-0 overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Users size={40} className="text-zinc-700 mb-4" />
                            <p className="text-sm font-bold text-zinc-500">No people found</p>
                            <p className="text-xs text-zinc-600 mt-1">
                                {searchQuery ? "Try a different search" : "Interactions will appear here as people engage with your posts"}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full min-w-full border-collapse">
                            <thead>
                                <tr className="border-b border-divider bg-default-50/50">
                                    {["PERSON", "INTERACTIONS", "LAST ACTIVE", "ACTIONS"].map((col) => (
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
                                {filtered.map((person) => (
                                    <tr
                                        key={person.did}
                                        className="border-b border-divider/50 last:border-none hover:bg-default-50/30 transition-colors cursor-pointer"
                                        onClick={() => setSelectedPerson(person)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                {person.avatar ? (
                                                    <img
                                                        src={person.avatar}
                                                        alt=""
                                                        className="w-9 h-9 rounded-full object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                        <Users size={16} className="text-zinc-500" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white/90 truncate">
                                                        {person.displayName || person.handle}
                                                    </p>
                                                    {person.handle && (
                                                        <p className="text-[11px] text-default-500 truncate">
                                                            @{person.handle}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex gap-2 flex-wrap">
                                                {person.commentCount > 0 && (
                                                    <Chip size="sm" variant="soft" className="bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                                                        {person.commentCount} comment{person.commentCount > 1 ? "s" : ""}
                                                    </Chip>
                                                )}
                                                {person.likeCount > 0 && (
                                                    <Chip size="sm" variant="soft" className="bg-pink-500/10 text-pink-400 font-bold text-[10px]">
                                                        {person.likeCount} like{person.likeCount > 1 ? "s" : ""}
                                                    </Chip>
                                                )}
                                                {person.engagedCount > 0 && (
                                                    <Chip size="sm" variant="soft" className="bg-success/10 text-success font-bold text-[10px]">
                                                        {person.engagedCount} engaged
                                                    </Chip>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white">
                                                    {format(person.lastInteractionDate, "MMM d, yyyy")}
                                                </span>
                                                <span className="text-[9px] font-bold text-default-400 uppercase">
                                                    {formatDistanceToNow(person.lastInteractionDate, { addSuffix: true })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEngaging(person.did);
                                                    manualEngage({ targetDid: person.did })
                                                        .then(() => setEngaging(null))
                                                        .catch(() => setEngaging(null));
                                                }}
                                                disabled={engaging === person.did}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/10 text-success text-xs font-bold hover:bg-success/20 transition-colors disabled:opacity-50"
                                            >
                                                {engaging === person.did ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <UserPlus size={12} />
                                                )}
                                                Engage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </CardRoot>

            {/* Person Detail Modal */}
            <AnimatePresence>
                {selectedPerson && (
                    <PersonDetailModal
                        person={selectedPerson}
                        interactions={interactions as InteractionDetail | undefined}
                        engaging={engaging}
                        onEngage={async (did) => {
                            setEngaging(did);
                            try {
                                await manualEngage({ targetDid: did });
                            } finally {
                                setEngaging(null);
                            }
                        }}
                        onClose={() => setSelectedPerson(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Person Detail Modal
// ---------------------------------------------------------------------------
function PersonDetailModal({
    person,
    interactions,
    engaging,
    onEngage,
    onClose,
}: {
    person: Interactor;
    interactions: InteractionDetail | undefined;
    engaging: string | null;
    onEngage: (did: string) => Promise<void>;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col z-10 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-7 pb-5 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        {person.avatar ? (
                            <img src={person.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <Users size={20} className="text-zinc-500" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-black text-white">{person.displayName || "Unknown"}</h3>
                            {person.handle && (
                                <a
                                    href={`https://bsky.app/profile/${person.handle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    @{person.handle} <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Stats */}
                <div className="px-7 pt-5 flex gap-3 flex-wrap">
                    {person.commentCount > 0 && (
                        <div className="px-3 py-2 rounded-xl bg-blue-500/10 flex items-center gap-2">
                            <MessageSquare size={14} className="text-blue-400" />
                            <span className="text-xs font-bold text-blue-400">{person.commentCount} comments</span>
                        </div>
                    )}
                    {person.likeCount > 0 && (
                        <div className="px-3 py-2 rounded-xl bg-pink-500/10 flex items-center gap-2">
                            <Heart size={14} className="text-pink-400" />
                            <span className="text-xs font-bold text-pink-400">{person.likeCount} likes</span>
                        </div>
                    )}
                    {person.engagedCount > 0 && (
                        <div className="px-3 py-2 rounded-xl bg-success/10 flex items-center gap-2">
                            <ArrowRightLeft size={14} className="text-success" />
                            <span className="text-xs font-bold text-success">{person.engagedCount} reciprocal</span>
                        </div>
                    )}
                </div>

                {/* Interaction Timeline */}
                <div className="p-7 flex flex-col gap-3 overflow-y-auto max-h-[40vh]">
                    {!interactions ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            {interactions.comments.map((c) => (
                                <div key={c._id} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare size={12} className="text-blue-400" />
                                        <span className="text-[10px] font-black uppercase text-blue-400">Commented</span>
                                        <span className="text-[10px] text-default-500 ml-auto">
                                            {formatDistanceToNow(c.createdAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/80">{c.content}</p>
                                </div>
                            ))}

                            {interactions.replies.map((r) => (
                                <div key={r._id} className="p-3 rounded-xl bg-success/5 border border-success/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <RefreshCw size={12} className="text-success" />
                                        <span className="text-[10px] font-black uppercase text-success">You Replied</span>
                                        <Chip size="sm" variant="soft" color={r.status === "posted" ? "success" : "danger"} className="ml-auto font-bold text-[9px]">
                                            {r.status}
                                        </Chip>
                                    </div>
                                    <p className="text-[10px] text-default-500 mb-1">To: &ldquo;{r.originalComment.substring(0, 80)}...&rdquo;</p>
                                    <p className="text-sm text-white/80">{r.content}</p>
                                </div>
                            ))}

                            {interactions.likes.map((l) => (
                                <div key={l._id} className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10">
                                    <div className="flex items-center gap-2">
                                        <Heart size={12} className="text-pink-400" />
                                        <span className="text-[10px] font-black uppercase text-pink-400">Liked your post</span>
                                        <span className="text-[10px] text-default-500 ml-auto">
                                            {formatDistanceToNow(l.indexedAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {interactions.engagementLog.map((e) => (
                                <div key={e._id} className="p-3 rounded-xl bg-warning/5 border border-warning/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ArrowRightLeft size={12} className="text-warning" />
                                        <span className="text-[10px] font-black uppercase text-warning">
                                            {e.actionType === "reciprocal_comment" ? "Commented on their post" : "Liked their post"}
                                        </span>
                                        <Chip size="sm" variant="soft" color={e.status === "success" ? "success" : "danger"} className="ml-auto font-bold text-[9px]">
                                            {e.status}
                                        </Chip>
                                    </div>
                                    {e.content && <p className="text-sm text-white/80">{e.content}</p>}
                                </div>
                            ))}

                            {interactions.comments.length === 0 && interactions.likes.length === 0 && interactions.replies.length === 0 && interactions.engagementLog.length === 0 && (
                                <p className="text-sm text-zinc-500 text-center py-8">No detailed interactions found</p>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-7 pt-5 border-t border-white/5 bg-white/[0.02] flex gap-3">
                    <button
                        onClick={() => onEngage(person.did)}
                        disabled={engaging === person.did}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {engaging === person.did ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <UserPlus size={14} />
                        )}
                        Engage with this person
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-3 rounded-xl bg-white/5 text-zinc-400 text-sm font-bold hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function X({ size, className }: { size: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}
