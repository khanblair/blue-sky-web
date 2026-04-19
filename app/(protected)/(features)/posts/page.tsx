"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CardRoot, CardContent, Chip, Button } from "@heroui/react";
import { History, ExternalLink, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const COLS = ["STATUS", "CONTENT", "TIMESTAMP", "ACTIONS"];

export default function PostsPage() {
    const posts = useQuery(api.posting.getPostHistory);

    if (posts === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase text-white">Post History</h1>
                    <p className="text-default-500">Review your previous Bluesky broadcasts</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="font-bold border-divider bg-surface">
                        <Calendar size={16} className="mr-2" />
                        Last 30 Days
                    </Button>
                </div>
            </header>

            <CardRoot className="bg-surface border-divider border">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full min-w-full border-collapse">
                        <thead>
                            <tr className="border-b border-divider bg-default-50/50">
                                {COLS.map((col) => (
                                    <th
                                        key={col}
                                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-default-400 ${col === "ACTIONS" ? "text-right pr-12" : "text-left"}`}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
                                            <History size={48} className="text-default-300" />
                                            <p className="font-bold text-sm">No post history found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post._id} className="border-b border-divider/50 last:border-none hover:bg-default-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <Chip
                                                variant="soft"
                                                color={post.status === "success" ? "success" : "danger"}
                                                size="sm"
                                                className="font-black text-[9px] uppercase tracking-widest h-6"
                                            >
                                                {post.status === "success" ? "POSTED" : "FAILED"}
                                            </Chip>
                                        </td>
                                        <td className="max-w-md px-6 py-5">
                                            <p className="text-sm font-bold text-white/90 line-clamp-2 leading-relaxed">
                                                {post.content || <span className="text-default-300 italic font-normal">No content recorded</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white">{format(post.timestamp, "MMM d, yyyy")}</span>
                                                <span className="text-[9px] font-bold text-default-400 uppercase tracking-tighter">{format(post.timestamp, "h:mm a")}</span>
                                            </div>
                                        </td>
                                        <td className="text-right pr-12 py-5">
                                            {post.blueskyUri ? (
                                                <Link
                                                    href={`https://bsky.app/profile/${post.blueskyUri.split("/").slice(-2)[0]}/post/${post.blueskyUri.split("/").pop()}`}
                                                    target="_blank"
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-divider hover:bg-primary/10 hover:border-primary/50 text-default-500 hover:text-primary transition-all"
                                                >
                                                    <ExternalLink size={14} />
                                                </Link>
                                            ) : (
                                                <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-divider text-default-300 opacity-50 cursor-not-allowed">
                                                    <History size={14} />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </CardRoot>
        </div>
    );
}
