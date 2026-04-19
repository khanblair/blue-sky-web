"use client";

import { useState, useEffect } from "react";
import {
    Button,
    TextArea,
    Label,
    TextFieldRoot,
} from "@heroui/react";
import { Plus, Send, Zap, Loader2, Sparkles, X } from "lucide-react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingPostButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const user = useQuery(api.users.getCurrentUser);
    const preferences = useQuery(api.users.getPreferences);
    // @ts-ignore
    const postNow = useAction(api.posting?.postNow);
    // @ts-ignore
    const generatePost = useAction(api.openrouter?.generatePostPublic);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!user) return null;

    const handleGenerate = async () => {
        if (!preferences) return;
        setIsGenerating(true);
        try {
            const aiContent = await generatePost({
                topics: preferences.topics,
                tone: preferences.tone,
            });
            if (aiContent) setContent(aiContent);
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Failed to generate post with AI");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePost = async () => {
        if (!content.trim() || !postNow) return;
        setIsPosting(true);
        try {
            await postNow({ text: content });
            setIsOpen(false);
            setContent("");
            alert("Posted successfully to Bluesky!");
        } catch (error) {
            console.error("Post failed:", error);
            alert("Failed to post: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100] group">
                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Button
                    variant="primary"
                    className="w-16 h-16 rounded-full min-w-0 p-0 shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300"
                    aria-label="Create New Post"
                    onPress={() => setIsOpen(true)}
                >
                    <Plus size={32} strokeWidth={3} className="text-white" />
                </Button>

                {/* Tooltip-like label */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-background border border-divider rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                    Quick Post
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-lg bg-zinc-950 border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden flex flex-col z-10"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-20"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 pb-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
                                        <Send className="text-blue-500" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight text-white uppercase mt-1">Quick Post</h2>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Direct to Bluesky</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8 flex flex-col gap-6">
                                <TextFieldRoot className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Post Content</Label>
                                        <span className={cn("text-[10px] font-bold", content.length > 280 ? "text-red-500" : "text-zinc-500")}>
                                            {content.length}/300
                                        </span>
                                    </div>
                                    <TextArea
                                        placeholder="What's happening?"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="min-h-[160px] bg-white/[0.03] border-white/5 rounded-2xl p-4 text-white text-base focus:border-blue-500/50 transition-colors outline-none resize-none"
                                        maxLength={300}
                                    />
                                </TextFieldRoot>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-12 font-black uppercase tracking-widest text-xs gap-2 border-white/5 hover:bg-white/5 flex-1"
                                        onPress={handleGenerate}
                                        isDisabled={isGenerating || !preferences}
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Sparkles className="text-blue-500" size={16} />
                                        )}
                                        AI Generate
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="font-black uppercase tracking-widest text-xs h-12 flex-[2] bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                                        onPress={handlePost}
                                        isDisabled={isPosting || !content.trim() || content.length > 300}
                                    >
                                        {isPosting ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <>
                                                <Send size={16} className="mr-2" />
                                                Post Now
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white/[0.02] p-6 border-t border-white/5 text-center mt-auto">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">
                                    Posts are delivered instantly via the AT Protocol
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

