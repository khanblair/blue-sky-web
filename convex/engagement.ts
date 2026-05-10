import {
    action,
    internalAction,
    internalMutation,
    internalQuery,
    mutation,
    query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Queries — likes
// ---------------------------------------------------------------------------

export const getLikesForUser = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return [];

        return await ctx.db
            .query("likes")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

export const getLikeByBlueskyUri = internalQuery({
    args: { blueskyUri: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("likes")
            .filter((q) => q.eq(q.field("blueskyUri"), args.blueskyUri))
            .first();
    },
});

// ---------------------------------------------------------------------------
// Queries — engagement settings
// ---------------------------------------------------------------------------

export const getEngagementSettings = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return null;

        return await ctx.db
            .query("engagementSettings")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();
    },
});

export const getEngagementSettingsInternal = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("engagementSettings")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

// ---------------------------------------------------------------------------
// Queries — replies
// ---------------------------------------------------------------------------

export const getRepliesForUser = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return [];

        return await ctx.db
            .query("replies")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

export const getReplyForComment = internalQuery({
    args: { commentId: v.id("comments") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("replies")
            .withIndex("by_commentId", (q) => q.eq("commentId", args.commentId))
            .unique();
    },
});

// ---------------------------------------------------------------------------
// Queries — people / interactors aggregation
// ---------------------------------------------------------------------------

export const getAllInteractors = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return [];

        const peopleMap = new Map<string, {
            did: string;
            handle: string;
            displayName: string;
            avatar: string;
            commentCount: number;
            likeCount: number;
            engagedCount: number;
            lastInteractionDate: number;
        }>();

        // Aggregate from comments
        const comments = await ctx.db
            .query("comments")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();

        for (const c of comments) {
            const existing = peopleMap.get(c.authorDid);
            if (existing) {
                existing.commentCount++;
                if (c.createdAt > existing.lastInteractionDate) {
                    existing.lastInteractionDate = c.createdAt;
                }
            } else {
                peopleMap.set(c.authorDid, {
                    did: c.authorDid,
                    handle: c.authorHandle ?? "",
                    displayName: c.authorDisplayName ?? "",
                    avatar: c.authorAvatar ?? "",
                    commentCount: 1,
                    likeCount: 0,
                    engagedCount: 0,
                    lastInteractionDate: c.createdAt,
                });
            }
        }

        // Aggregate from likes
        const likes = await ctx.db
            .query("likes")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        for (const l of likes) {
            const existing = peopleMap.get(l.authorDid);
            if (existing) {
                existing.likeCount++;
                if (l.indexedAt > existing.lastInteractionDate) {
                    existing.lastInteractionDate = l.indexedAt;
                }
            } else {
                peopleMap.set(l.authorDid, {
                    did: l.authorDid,
                    handle: l.authorHandle ?? "",
                    displayName: l.authorDisplayName ?? "",
                    avatar: l.authorAvatar ?? "",
                    commentCount: 0,
                    likeCount: 1,
                    engagedCount: 0,
                    lastInteractionDate: l.indexedAt,
                });
            }
        }

        // Aggregate from engagement log (reciprocal actions)
        const engagementLogs = await ctx.db
            .query("engagementLog")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        for (const e of engagementLogs) {
            if (e.actionType !== "reciprocal_comment" && e.actionType !== "reciprocal_like") continue;
            const existing = peopleMap.get(e.targetDid);
            if (existing) {
                existing.engagedCount++;
                if (e.createdAt > existing.lastInteractionDate) {
                    existing.lastInteractionDate = e.createdAt;
                }
            } else {
                peopleMap.set(e.targetDid, {
                    did: e.targetDid,
                    handle: e.targetHandle ?? "",
                    displayName: e.targetDisplayName ?? "",
                    avatar: e.targetAvatar ?? "",
                    commentCount: 0,
                    likeCount: 0,
                    engagedCount: 1,
                    lastInteractionDate: e.createdAt,
                });
            }
        }

        return Array.from(peopleMap.values()).sort((a, b) => b.lastInteractionDate - a.lastInteractionDate);
    },
});

export const getInteractionsForPerson = query({
    args: { targetDid: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { comments: [], likes: [], replies: [], engagementLog: [] };

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return { comments: [], likes: [], replies: [], engagementLog: [] };

        const comments = await ctx.db
            .query("comments")
            .filter((q) => q.eq(q.field("userId"), user._id) && q.eq(q.field("authorDid"), args.targetDid))
            .collect();

        // Enrich comments with the post they were made on
        const commentsWithPost = await Promise.all(
            comments.map(async (c) => {
                let postContent: string | null = null;
                if (c.postHistoryId) {
                    const post = await ctx.db.get(c.postHistoryId);
                    postContent = post?.content ?? null;
                }
                return { ...c, postContent };
            })
        );

        const likes = await ctx.db
            .query("likes")
            .withIndex("by_authorDid", (q) => q.eq("authorDid", args.targetDid))
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();

        // Enrich likes with the post they liked
        const likesWithPost = await Promise.all(
            likes.map(async (l) => {
                let postContent: string | null = null;
                if (l.postHistoryId) {
                    const post = await ctx.db.get(l.postHistoryId);
                    postContent = post?.content ?? null;
                }
                return { ...l, postContent };
            })
        );

        const engagementLog = await ctx.db
            .query("engagementLog")
            .withIndex("by_targetDid", (q) => q.eq("targetDid", args.targetDid))
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();

        // Get replies for the comments from this person
        const replies = [];
        for (const comment of commentsWithPost) {
            const reply = await ctx.db
                .query("replies")
                .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
                .unique();
            if (reply) replies.push({ ...reply, originalComment: comment.content });
        }

        return { comments: commentsWithPost, likes: likesWithPost, replies, engagementLog };
    },
});

export const getEngagementStats = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalInteractors: 0, totalReplies: 0, totalReciprocalActions: 0 };

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return { totalInteractors: 0, totalReplies: 0, totalReciprocalActions: 0 };

        const uniqueDids = new Set<string>();

        const comments = await ctx.db
            .query("comments")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();
        for (const c of comments) uniqueDids.add(c.authorDid);

        const likes = await ctx.db
            .query("likes")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
        for (const l of likes) uniqueDids.add(l.authorDid);

        const replies = await ctx.db
            .query("replies")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        const reciprocalLogs = await ctx.db
            .query("engagementLog")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .filter((q) =>
                q.or(
                    q.eq(q.field("actionType"), "reciprocal_comment"),
                    q.eq(q.field("actionType"), "reciprocal_like")
                )
            )
            .collect();

        return {
            totalInteractors: uniqueDids.size,
            totalReplies: replies.length,
            totalReciprocalActions: reciprocalLogs.length,
        };
    },
});

// ---------------------------------------------------------------------------
// Mutations — save likes, replies, engagement log, settings
// ---------------------------------------------------------------------------

export const saveLike = internalMutation({
    args: {
        userId: v.id("users"),
        postHistoryId: v.optional(v.id("postHistory")),
        blueskyUri: v.string(),
        likedPostUri: v.string(),
        authorDid: v.string(),
        authorHandle: v.optional(v.string()),
        authorDisplayName: v.optional(v.string()),
        authorAvatar: v.optional(v.string()),
        indexedAt: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("likes", {
            userId: args.userId,
            postHistoryId: args.postHistoryId,
            blueskyUri: args.blueskyUri,
            likedPostUri: args.likedPostUri,
            authorDid: args.authorDid,
            authorHandle: args.authorHandle,
            authorDisplayName: args.authorDisplayName,
            authorAvatar: args.authorAvatar,
            indexedAt: args.indexedAt,
        });
    },
});

export const saveReply = internalMutation({
    args: {
        userId: v.id("users"),
        commentId: v.id("comments"),
        content: v.string(),
        blueskyUri: v.optional(v.string()),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("replies", {
            userId: args.userId,
            commentId: args.commentId,
            content: args.content,
            blueskyUri: args.blueskyUri,
            status: args.status,
            createdAt: Date.now(),
        });
    },
});

export const saveEngagementLog = internalMutation({
    args: {
        userId: v.id("users"),
        targetDid: v.string(),
        targetHandle: v.optional(v.string()),
        targetDisplayName: v.optional(v.string()),
        targetAvatar: v.optional(v.string()),
        targetPostUri: v.optional(v.string()),
        actionType: v.string(),
        content: v.optional(v.string()),
        blueskyUri: v.optional(v.string()),
        status: v.string(),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("engagementLog", {
            userId: args.userId,
            targetDid: args.targetDid,
            targetHandle: args.targetHandle,
            targetDisplayName: args.targetDisplayName,
            targetAvatar: args.targetAvatar,
            targetPostUri: args.targetPostUri,
            actionType: args.actionType,
            content: args.content,
            blueskyUri: args.blueskyUri,
            status: args.status,
            error: args.error,
            createdAt: Date.now(),
        });
    },
});

export const updateEngagementSettings = mutation({
    args: {
        autoReplyEnabled: v.optional(v.boolean()),
        reciprocalEngagementEnabled: v.optional(v.boolean()),
        replyTone: v.optional(v.string()),
        maxReciprocalPerRun: v.optional(v.number()),
        engagementCooldownHours: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) throw new Error("User not found");

        const existing = await ctx.db
            .query("engagementSettings")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...(args.autoReplyEnabled !== undefined && { autoReplyEnabled: args.autoReplyEnabled }),
                ...(args.reciprocalEngagementEnabled !== undefined && { reciprocalEngagementEnabled: args.reciprocalEngagementEnabled }),
                ...(args.replyTone !== undefined && { replyTone: args.replyTone }),
                ...(args.maxReciprocalPerRun !== undefined && { maxReciprocalPerRun: args.maxReciprocalPerRun }),
                ...(args.engagementCooldownHours !== undefined && { engagementCooldownHours: args.engagementCooldownHours }),
            });
        } else {
            await ctx.db.insert("engagementSettings", {
                userId: user._id,
                autoReplyEnabled: args.autoReplyEnabled ?? false,
                reciprocalEngagementEnabled: args.reciprocalEngagementEnabled ?? false,
                replyTone: args.replyTone ?? "friendly",
                maxReciprocalPerRun: args.maxReciprocalPerRun ?? 5,
                engagementCooldownHours: args.engagementCooldownHours ?? 48,
            });
        }
    },
});

export const incrementAutoReply = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await incrementEngagementUsage(ctx, args.userId, "autoRepliesUsed");
    },
});

export const incrementReciprocalEngagement = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await incrementEngagementUsage(ctx, args.userId, "reciprocalEngagementsUsed");
    },
});

async function incrementEngagementUsage(
    ctx: { db: import("./_generated/server").DatabaseWriter },
    userId: import("./_generated/dataModel").Id<"users">,
    field: "autoRepliesUsed" | "reciprocalEngagementsUsed"
) {
    const now = Date.now();

    const usage = await ctx.db
        .query("usageMetrics")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .first();

    if (!usage || usage.periodEnd < now) {
        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .first();

        const subActive = sub && sub.status === "active" && sub.currentPeriodEnd > now;
        const usagePeriodEnd = subActive ? sub.currentPeriodEnd : now + 30 * 24 * 60 * 60 * 1000;

        await ctx.db.insert("usageMetrics", {
            userId,
            periodStart: now,
            periodEnd: usagePeriodEnd,
            postsGenerated: 0,
            postsPublished: 0,
            aiGenerationsUsed: 0,
            autoRepliesUsed: field === "autoRepliesUsed" ? 1 : 0,
            reciprocalEngagementsUsed: field === "reciprocalEngagementsUsed" ? 1 : 0,
        });
        return;
    }

    await ctx.db.patch(usage._id, {
        [field]: (usage[field] as number ?? 0) + 1,
    });
}

// ---------------------------------------------------------------------------
// Internal queries for cron jobs
// ---------------------------------------------------------------------------

export const getActiveUsersWithSettings = internalQuery({
    handler: async (ctx) => {
        const activeUsers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        const result = [];
        for (const user of activeUsers) {
            if (!user.handle || !user.appPassword) continue;
            const settings = await ctx.db
                .query("engagementSettings")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .unique();
            result.push({ ...user, engagementSettings: settings });
        }
        return result;
    },
});

export const getUnrepliedComments = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .collect();

        const unreplied = [];
        for (const comment of comments) {
            const reply = await ctx.db
                .query("replies")
                .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
                .unique();
            if (!reply) {
                unreplied.push(comment);
            }
        }
        return unreplied;
    },
});

export const getRecentCommenters = internalQuery({
    args: { userId: v.id("users"), sinceTimestamp: v.number() },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .filter((q) =>
                q.eq(q.field("userId"), args.userId) &&
                q.gte(q.field("createdAt"), args.sinceTimestamp)
            )
            .collect();

        // Group by authorDid, return unique commenters with their latest info
        const seen = new Map<string, { did: string; handle: string; displayName: string; avatar: string }>();
        for (const c of comments) {
            if (!seen.has(c.authorDid)) {
                seen.set(c.authorDid, {
                    did: c.authorDid,
                    handle: c.authorHandle ?? "",
                    displayName: c.authorDisplayName ?? "",
                    avatar: c.authorAvatar ?? "",
                });
            }
        }
        return Array.from(seen.values());
    },
});

export const getRecentlyEngagedDids = internalQuery({
    args: { userId: v.id("users"), sinceTimestamp: v.number() },
    handler: async (ctx, args) => {
        const logs = await ctx.db
            .query("engagementLog")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) =>
                q.gte(q.field("createdAt"), args.sinceTimestamp) &&
                q.or(
                    q.eq(q.field("actionType"), "reciprocal_comment"),
                    q.eq(q.field("actionType"), "reciprocal_like")
                )
            )
            .collect();

        const dids = new Set<string>();
        for (const log of logs) dids.add(log.targetDid);
        return Array.from(dids);
    },
});

export const getPostsForUser = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("postHistory")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("status"), "success"))
            .collect();
    },
});

// ---------------------------------------------------------------------------
// Cron: Sync all interactions (likes + comments)
// ---------------------------------------------------------------------------

export const syncAllInteractions = internalAction({
    handler: async (ctx) => {
        const users = await ctx.runQuery(internal.engagement.getActiveUsersWithSettings);

        for (const user of users) {
            try {
                if (!user.handle || !user.appPassword) continue;

                const posts = await ctx.runQuery(internal.engagement.getPostsForUser, {
                    userId: user._id,
                });

                for (const post of posts) {
                    if (!post.blueskyUri) continue;

                    // Sync comments
                    try {
                        const comments = await ctx.runAction(internal.bluesky.fetchCommentsForPost, {
                            handle: user.handle,
                            appPassword: user.appPassword,
                            postUri: post.blueskyUri,
                        });

                        for (const comment of comments) {
                            const existing = await ctx.runQuery(api.posting.getCommentByBlueskyUri, {
                                blueskyUri: comment.uri,
                            });
                            if (!existing) {
                                await ctx.runMutation(internal.posting.saveComment, {
                                    userId: user._id,
                                    postHistoryId: post._id,
                                    blueskyUri: comment.uri,
                                    authorDid: comment.author.did,
                                    authorHandle: comment.author.handle,
                                    authorDisplayName: comment.author.displayName,
                                    authorAvatar: comment.author.avatar,
                                    content: comment.content,
                                    createdAt: comment.createdAt,
                                });
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to sync comments for post ${post.blueskyUri}:`, e);
                    }

                    // Sync likes
                    try {
                        let cursor: string | undefined;
                        do {
                            const result = await ctx.runAction(internal.bluesky.fetchLikesForPost, {
                                handle: user.handle,
                                appPassword: user.appPassword,
                                postUri: post.blueskyUri,
                                cursor,
                            });

                            for (const like of result.likes) {
                                const existing = await ctx.runQuery(internal.engagement.getLikeByBlueskyUri, {
                                    blueskyUri: like.uri,
                                });
                                if (!existing) {
                                    await ctx.runMutation(internal.engagement.saveLike, {
                                        userId: user._id,
                                        postHistoryId: post._id,
                                        blueskyUri: like.uri,
                                        likedPostUri: post.blueskyUri!,
                                        authorDid: like.actor.did,
                                        authorHandle: like.actor.handle,
                                        authorDisplayName: like.actor.displayName,
                                        authorAvatar: like.actor.avatar,
                                        indexedAt: new Date(like.indexedAt).getTime(),
                                    });
                                }
                            }

                            cursor = result.cursor;
                        } while (cursor);
                    } catch (e) {
                        console.error(`Failed to sync likes for post ${post.blueskyUri}:`, e);
                    }
                }

                console.log(`Synced interactions for ${user.handle}`);
            } catch (error) {
                console.error(`Failed to sync interactions for ${user.handle}:`, error);
            }
        }
    },
});

// ---------------------------------------------------------------------------
// Cron: Auto-reply to comments
// ---------------------------------------------------------------------------

export const autoReplyToComments = internalAction({
    handler: async (ctx) => {
        const users = await ctx.runQuery(internal.engagement.getActiveUsersWithSettings);

        for (const user of users) {
            if (!user.engagementSettings?.autoReplyEnabled) continue;
            if (!user.handle || !user.appPassword) continue;

            try {
                const limitCheck = await ctx.runQuery(internal.usage.checkLimit, {
                    userId: user._id,
                    action: "autoReply",
                });
                if (!limitCheck.allowed) {
                    console.log(`Auto-reply skipped for ${user.handle}: ${limitCheck.message}`);
                    continue;
                }

                const unreplied = await ctx.runQuery(internal.engagement.getUnrepliedComments, {
                    userId: user._id,
                });

                for (const comment of unreplied.slice(0, 10)) {
                    try {
                        // Get the original post for context
                        const post = comment.postHistoryId
                            ? await ctx.runQuery(internal.posting.getPostHistoryRecord, {
                                postHistoryId: comment.postHistoryId,
                            })
                            : null;

                        const replyContent = await ctx.runAction(internal.aiGeneration.generateReply, {
                            originalPostContent: post?.content ?? "",
                            commentContent: comment.content,
                            commentAuthorHandle: comment.authorHandle,
                            tone: user.engagementSettings?.replyTone ?? "friendly",
                            userId: user._id,
                        });

                        // Get the root post URI and CID for threading
                        const rootUri = post?.blueskyUri ?? comment.blueskyUri;
                        const rootCid = post?.blueskyCid;

                        // If we don't have the CID, we need to fetch it from the thread
                        if (!rootCid && post?.blueskyUri) {
                            const threadComments = await ctx.runAction(internal.bluesky.fetchCommentsForPost, {
                                handle: user.handle,
                                appPassword: user.appPassword,
                                postUri: post.blueskyUri,
                            });
                            // The thread doesn't directly give us the root CID, use a workaround
                            // We'll fetch the post thread and extract the root CID
                        }

                        // For the comment's CID, we need to fetch the thread
                        // Since fetchCommentsForPost returns cid, we can use a lookup approach
                        // But for now, we need to get the comment's CID from the thread
                        const threadComments = await ctx.runAction(internal.bluesky.fetchCommentsForPost, {
                            handle: user.handle,
                            appPassword: user.appPassword,
                            postUri: rootUri,
                        });

                        const threadComment = threadComments.find((c: { uri: string }) => c.uri === comment.blueskyUri);
                        const commentCid = threadComment?.cid;

                        if (!commentCid) {
                            console.error(`Could not find CID for comment ${comment.blueskyUri}, skipping`);
                            await ctx.runMutation(internal.engagement.saveEngagementLog, {
                                userId: user._id,
                                targetDid: comment.authorDid,
                                targetHandle: comment.authorHandle,
                                targetDisplayName: comment.authorDisplayName,
                                actionType: "reply",
                                content: replyContent,
                                status: "skipped",
                                error: "Could not resolve comment CID",
                            });
                            continue;
                        }

                        // If rootCid is still missing, try to get it from the thread
                        if (!rootCid) {
                            // Fetch the post itself to get CID - use getPostThread
                            // The root post's CID can be extracted from the thread response
                            // For now, skip if we don't have root CID
                            console.error(`No root CID for post ${rootUri}, attempting reply with comment as root`);
                        }

                        const replyUri = await ctx.runAction(internal.bluesky.replyToPost, {
                            handle: user.handle,
                            appPassword: user.appPassword,
                            text: replyContent,
                            replyToUri: comment.blueskyUri,
                            replyToCid: commentCid,
                            rootUri,
                            rootCid: rootCid ?? commentCid,
                        });

                        await ctx.runMutation(internal.engagement.saveReply, {
                            userId: user._id,
                            commentId: comment._id,
                            content: replyContent,
                            blueskyUri: replyUri,
                            status: "posted",
                        });

                        await ctx.runMutation(internal.engagement.saveEngagementLog, {
                            userId: user._id,
                            targetDid: comment.authorDid,
                            targetHandle: comment.authorHandle,
                            targetDisplayName: comment.authorDisplayName,
                            actionType: "reply",
                            content: replyContent,
                            blueskyUri: replyUri,
                            status: "success",
                        });

                        await ctx.runMutation(internal.engagement.incrementAutoReply, {
                            userId: user._id,
                        });

                        console.log(`Auto-replied to comment from ${comment.authorHandle}`);
                    } catch (error) {
                        console.error(`Failed to auto-reply to comment:`, error);

                        await ctx.runMutation(internal.engagement.saveEngagementLog, {
                            userId: user._id,
                            targetDid: comment.authorDid,
                            targetHandle: comment.authorHandle,
                            targetDisplayName: comment.authorDisplayName,
                            actionType: "reply",
                            status: "failed",
                            error: String(error),
                        });
                    }

                    // Rate limit: wait 3 seconds between replies
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
            } catch (error) {
                console.error(`Failed auto-reply processing for ${user.handle}:`, error);
            }
        }
    },
});

// ---------------------------------------------------------------------------
// Cron: Reciprocal engagement
// ---------------------------------------------------------------------------

export const reciprocalEngagement = internalAction({
    handler: async (ctx) => {
        const users = await ctx.runQuery(internal.engagement.getActiveUsersWithSettings);

        for (const user of users) {
            if (!user.engagementSettings?.reciprocalEngagementEnabled) continue;
            if (!user.handle || !user.appPassword) continue;

            const settings = user.engagementSettings;
            const cooldownMs = (settings.engagementCooldownHours ?? 48) * 60 * 60 * 1000;
            const sinceTimestamp = Date.now() - cooldownMs;

            try {
                const limitCheck = await ctx.runQuery(internal.usage.checkLimit, {
                    userId: user._id,
                    action: "reciprocalEngagement",
                });
                if (!limitCheck.allowed) {
                    console.log(`Reciprocal engagement skipped for ${user.handle}: ${limitCheck.message}`);
                    continue;
                }
                // Get commenters not in cooldown
                const recentCommenters = await ctx.runQuery(internal.engagement.getRecentCommenters, {
                    userId: user._id,
                    sinceTimestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, // last 30 days
                });

                const engagedDids = await ctx.runQuery(internal.engagement.getRecentlyEngagedDids, {
                    userId: user._id,
                    sinceTimestamp,
                });

                const engagedSet = new Set(engagedDids);

                // Get user's own DID to exclude
                const userDid = await ctx.runAction(internal.bluesky.fetchAuthorFeed, {
                    handle: user.handle,
                    appPassword: user.appPassword,
                    authorDid: user.handle,
                    limit: 1,
                }).then(() => "").catch(() => ""); // We don't need this, just get DID from auth

                const eligible = recentCommenters.filter(
                    (c: { did: string }) => !engagedSet.has(c.did)
                );

                const maxPerRun = settings.maxReciprocalPerRun ?? 5;
                const toEngage = eligible.slice(0, maxPerRun);

                for (const commenter of toEngage) {
                    try {
                        // Fetch the commenter's feed
                        const feed = await ctx.runAction(internal.bluesky.fetchAuthorFeed, {
                            handle: user.handle,
                            appPassword: user.appPassword,
                            authorDid: commenter.did,
                            limit: 10,
                        });

                        // Find the most recent eligible post
                        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                        const eligiblePost = feed.find((post: {
                            record: { reply?: unknown; createdAt?: string };
                        }) => {
                            // Skip replies
                            if (post.record.reply) return false;
                            // Skip posts older than 7 days
                            if (post.record.createdAt) {
                                const postDate = new Date(post.record.createdAt).getTime();
                                return postDate > sevenDaysAgo;
                            }
                            return false;
                        });

                        if (!eligiblePost) {
                            console.log(`No eligible post found for ${commenter.handle}, skipping`);
                            await ctx.runMutation(internal.engagement.saveEngagementLog, {
                                userId: user._id,
                                targetDid: commenter.did,
                                targetHandle: commenter.handle,
                                targetDisplayName: commenter.displayName,
                                targetAvatar: commenter.avatar,
                                actionType: "reciprocal_comment",
                                status: "skipped",
                                error: "No eligible recent post found",
                            });
                            continue;
                        }

                        const postContent = eligiblePost.record.text ?? "";

                        // Generate a relevant comment
                        const commentContent = await ctx.runAction(internal.aiGeneration.generateReciprocalComment, {
                            targetPostContent: postContent,
                            targetAuthorHandle: commenter.handle,
                            tone: settings.replyTone ?? "friendly",
                            userId: user._id,
                        });

                        // Post the comment on their post
                        const commentUri = await ctx.runAction(internal.bluesky.replyToPost, {
                            handle: user.handle,
                            appPassword: user.appPassword,
                            text: commentContent,
                            replyToUri: eligiblePost.uri,
                            replyToCid: eligiblePost.cid,
                        });

                        await ctx.runMutation(internal.engagement.saveEngagementLog, {
                            userId: user._id,
                            targetDid: commenter.did,
                            targetHandle: commenter.handle,
                            targetDisplayName: commenter.displayName,
                            targetAvatar: commenter.avatar,
                            targetPostUri: eligiblePost.uri,
                            actionType: "reciprocal_comment",
                            content: commentContent,
                            blueskyUri: commentUri,
                            status: "success",
                        });

                        // Like their post
                        try {
                            const likeUri = await ctx.runAction(internal.bluesky.likePost, {
                                handle: user.handle,
                                appPassword: user.appPassword,
                                postUri: eligiblePost.uri,
                                postCid: eligiblePost.cid,
                            });

                            await ctx.runMutation(internal.engagement.saveEngagementLog, {
                                userId: user._id,
                                targetDid: commenter.did,
                                targetHandle: commenter.handle,
                                targetDisplayName: commenter.displayName,
                                targetAvatar: commenter.avatar,
                                targetPostUri: eligiblePost.uri,
                                actionType: "reciprocal_like",
                                blueskyUri: likeUri,
                                status: "success",
                            });
                        } catch (likeError) {
                            console.error(`Failed to like post for ${commenter.handle}:`, likeError);
                            await ctx.runMutation(internal.engagement.saveEngagementLog, {
                                userId: user._id,
                                targetDid: commenter.did,
                                targetHandle: commenter.handle,
                                actionType: "reciprocal_like",
                                targetPostUri: eligiblePost.uri,
                                status: "failed",
                                error: String(likeError),
                            });
                        }

                        await ctx.runMutation(internal.engagement.incrementReciprocalEngagement, {
                            userId: user._id,
                        });

                        console.log(`Reciprocally engaged with ${commenter.handle}`);
                    } catch (error) {
                        console.error(`Failed reciprocal engagement for ${commenter.handle}:`, error);

                        await ctx.runMutation(internal.engagement.saveEngagementLog, {
                            userId: user._id,
                            targetDid: commenter.did,
                            targetHandle: commenter.handle,
                            targetDisplayName: commenter.displayName,
                            actionType: "reciprocal_comment",
                            status: "failed",
                            error: String(error),
                        });
                    }

                    // Rate limit: wait 5 seconds between reciprocal engagements
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                }

                // Update last run timestamp
                const existingSettings = await ctx.runQuery(internal.engagement.getEngagementSettingsInternal, {
                    userId: user._id,
                });
                if (existingSettings) {
                    // Update via a mutation - we'll need to add an internal mutation for this
                    // For now, the settings update happens via the user-facing mutation
                }
            } catch (error) {
                console.error(`Failed reciprocal engagement for ${user.handle}:`, error);
            }
        }
    },
});

// ---------------------------------------------------------------------------
// Shared helper for manual engagement actions
// ---------------------------------------------------------------------------

type FeedPost = {
    uri: string;
    cid: string;
    record: { text?: string; createdAt?: string; reply?: unknown };
};

async function findEligiblePost(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: any,
    handle: string,
    appPassword: string,
    targetDid: string,
): Promise<{
    eligiblePost: FeedPost | null;
    authorInfo: { handle: string; displayName?: string; avatar?: string };
}> {
    const feed = (await ctx.runAction(internal.bluesky.fetchAuthorFeed, {
        handle,
        appPassword,
        authorDid: targetDid,
        limit: 10,
    })) as FeedPost[];

    const authorInfo = {
        handle: feed[0]?.record ? targetDid : "",
        displayName: undefined as string | undefined,
        avatar: undefined as string | undefined,
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const eligiblePost = feed.find((post) => {
        if (post.record.reply) return false;
        if (post.record.createdAt) {
            return new Date(post.record.createdAt).getTime() > sevenDaysAgo;
        }
        return false;
    }) ?? null;

    return { eligiblePost, authorInfo };
}

// ---------------------------------------------------------------------------
// Manual actions (user-triggered from People page)
// ---------------------------------------------------------------------------

export const manualLikePerson = action({
    args: { targetDid: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");
        if (!user.handle || !user.appPassword) throw new Error("Bluesky credentials not configured");

        const limitCheck = await ctx.runQuery(internal.usage.checkLimit, {
            userId: user._id,
            action: "reciprocalEngagement",
        });
        if (!limitCheck.allowed) throw new Error(limitCheck.message);

        const { eligiblePost, authorInfo } = await findEligiblePost(ctx, user.handle, user.appPassword, args.targetDid);
        if (!eligiblePost) throw new Error("No eligible recent post found for this person");

        const likeUri = await ctx.runAction(internal.bluesky.likePost, {
            handle: user.handle,
            appPassword: user.appPassword,
            postUri: eligiblePost.uri,
            postCid: eligiblePost.cid,
        });

        await ctx.runMutation(internal.engagement.saveEngagementLog, {
            userId: user._id,
            targetDid: args.targetDid,
            targetHandle: authorInfo.handle,
            targetDisplayName: authorInfo.displayName,
            targetAvatar: authorInfo.avatar,
            targetPostUri: eligiblePost.uri,
            actionType: "reciprocal_like",
            blueskyUri: likeUri,
            status: "success",
        });

        await ctx.runMutation(internal.engagement.incrementReciprocalEngagement, { userId: user._id });
        return { success: true };
    },
});

export const manualCommentPerson = action({
    args: { targetDid: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; commentUri: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");
        if (!user.handle || !user.appPassword) throw new Error("Bluesky credentials not configured");

        const limitCheck = await ctx.runQuery(internal.usage.checkLimit, {
            userId: user._id,
            action: "reciprocalEngagement",
        });
        if (!limitCheck.allowed) throw new Error(limitCheck.message);

        const settings = await ctx.runQuery(internal.engagement.getEngagementSettingsInternal, { userId: user._id });
        const { eligiblePost, authorInfo } = await findEligiblePost(ctx, user.handle, user.appPassword, args.targetDid);
        if (!eligiblePost) throw new Error("No eligible recent post found for this person");

        const postContent = eligiblePost.record.text ?? "";
        const commentContent = await ctx.runAction(internal.aiGeneration.generateReciprocalComment, {
            targetPostContent: postContent,
            targetAuthorHandle: authorInfo.handle,
            tone: settings?.replyTone ?? "friendly",
            userId: user._id,
        });

        const commentUri = await ctx.runAction(internal.bluesky.replyToPost, {
            handle: user.handle,
            appPassword: user.appPassword,
            text: commentContent,
            replyToUri: eligiblePost.uri,
            replyToCid: eligiblePost.cid,
        });

        await ctx.runMutation(internal.engagement.saveEngagementLog, {
            userId: user._id,
            targetDid: args.targetDid,
            targetHandle: authorInfo.handle,
            targetDisplayName: authorInfo.displayName,
            targetAvatar: authorInfo.avatar,
            targetPostUri: eligiblePost.uri,
            actionType: "reciprocal_comment",
            content: commentContent,
            blueskyUri: commentUri,
            status: "success",
        });

        await ctx.runMutation(internal.engagement.incrementReciprocalEngagement, { userId: user._id });
        return { success: true, commentUri };
    },
});

export const manualEngageWithPerson = action({
    args: { targetDid: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; commentUri?: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");
        if (!user.handle || !user.appPassword) throw new Error("Bluesky credentials not configured");

        const limitCheck = await ctx.runQuery(internal.usage.checkLimit, {
            userId: user._id,
            action: "reciprocalEngagement",
        });
        if (!limitCheck.allowed) throw new Error(limitCheck.message);

        const settings = await ctx.runQuery(internal.engagement.getEngagementSettingsInternal, { userId: user._id });
        const { eligiblePost, authorInfo } = await findEligiblePost(ctx, user.handle, user.appPassword, args.targetDid);
        if (!eligiblePost) throw new Error("No eligible recent post found for this person");

        const postContent = eligiblePost.record.text ?? "";

        // Comment
        const commentContent = await ctx.runAction(internal.aiGeneration.generateReciprocalComment, {
            targetPostContent: postContent,
            targetAuthorHandle: authorInfo.handle,
            tone: settings?.replyTone ?? "friendly",
            userId: user._id,
        });

        const commentUri = await ctx.runAction(internal.bluesky.replyToPost, {
            handle: user.handle,
            appPassword: user.appPassword,
            text: commentContent,
            replyToUri: eligiblePost.uri,
            replyToCid: eligiblePost.cid,
        });

        await ctx.runMutation(internal.engagement.saveEngagementLog, {
            userId: user._id,
            targetDid: args.targetDid,
            targetHandle: authorInfo.handle,
            targetDisplayName: authorInfo.displayName,
            targetAvatar: authorInfo.avatar,
            targetPostUri: eligiblePost.uri,
            actionType: "reciprocal_comment",
            content: commentContent,
            blueskyUri: commentUri,
            status: "success",
        });

        // Like
        try {
            const likeUri = await ctx.runAction(internal.bluesky.likePost, {
                handle: user.handle,
                appPassword: user.appPassword,
                postUri: eligiblePost.uri,
                postCid: eligiblePost.cid,
            });

            await ctx.runMutation(internal.engagement.saveEngagementLog, {
                userId: user._id,
                targetDid: args.targetDid,
                targetHandle: authorInfo.handle,
                targetDisplayName: authorInfo.displayName,
                targetAvatar: authorInfo.avatar,
                targetPostUri: eligiblePost.uri,
                actionType: "reciprocal_like",
                blueskyUri: likeUri,
                status: "success",
            });
        } catch (e) {
            console.error("Failed to like:", e);
        }

        await ctx.runMutation(internal.engagement.incrementReciprocalEngagement, { userId: user._id });
        return { success: true, commentUri };
    },
});
