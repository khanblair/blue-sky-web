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
// Queries
// ---------------------------------------------------------------------------

export const getPostHistory = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        return await ctx.db
            .query("postHistory")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

export const getAllPendingPosts = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        const empty = { posts: [] as any[], postIntervalHours: 8, lastPostTime: 0 };
        if (!identity) return empty;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return empty;

        // Return all pending posts along with the user's post interval so the
        // UI can compute estimated publish times.
        const prefs = await ctx.db
            .query("preferences")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();

        const posts = await ctx.db
            .query("pendingPosts")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .order("asc") // oldest first — that's the publish order
            .collect();

        return {
            posts,
            postIntervalHours: prefs?.postIntervalHours ?? 8,
            lastPostTime: prefs?.lastPostTime ?? 0,
        };
    },
});

export const getStats = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalPosts: 0 };

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return { totalPosts: 0 };

        const posts = await ctx.db
            .query("postHistory")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "success"))
            .collect();

        return { totalPosts: posts.length };
    },
});

export const getPendingPosts = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        return await ctx.db
            .query("pendingPosts")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .order("desc")
            .collect();
    },
});

// ---------------------------------------------------------------------------
// User-facing mutations for post management
// ---------------------------------------------------------------------------

export const retryFailedPost = action({
    args: { postHistoryId: v.id("postHistory") },
    handler: async (ctx, args): Promise<{ success: boolean; uri: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");
        if (!user.handle || !user.appPassword) throw new Error("Bluesky credentials not configured");

        // Fetch the failed post record
        const record = await ctx.runQuery(internal.posting.getPostHistoryRecord, {
            postHistoryId: args.postHistoryId,
        });
        if (!record) throw new Error("Post record not found");
        if (record.userId !== user._id) throw new Error("Unauthorized");

        // @ts-ignore
        const blueskyUri = await ctx.runAction(internal.bluesky.postToBluesky, {
            handle: user.handle,
            appPassword: user.appPassword,
            text: record.content,
        });

        await ctx.runMutation(internal.posting.logPostResult, {
            userId: user._id,
            content: record.content,
            blueskyUri,
            status: "success",
        });

        // Telegram Notification
        await ctx.runAction(internal.telegram.sendMessage, {
            userId: user._id, text: `🚀 *Post Retried Successfully*\n\n${record.content.substring(0, 150)}...\n\n[View on Bluesky](${blueskyUri.replace("at://", "https://bsky.app/profile/" + user.handle + "/post/")})`
        });

        // WhatsApp Notification
        await ctx.runAction(internal.whatsapp.sendMessage, {
            userId: user._id, text: `🚀 *Post Retried Successfully*\n\n${record.content.substring(0, 150)}...\n\n[View on Bluesky](${blueskyUri.replace("at://", "https://bsky.app/profile/" + user.handle + "/post/")})`
        });

        return { success: true, uri: blueskyUri };
    },
});

export const savePostAsPending = mutation({
    args: { content: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) throw new Error("User not found");

        await ctx.db.insert("pendingPosts", {
            userId: user._id,
            content: args.content.trim(),
            generatedAt: Date.now(),
            status: "pending",
        });
    },
});

export const updatePendingPost = mutation({
    args: { pendingPostId: v.id("pendingPosts"), content: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) throw new Error("User not found");

        const post = await ctx.db.get(args.pendingPostId);
        if (!post || post.userId !== user._id) throw new Error("Unauthorized");

        await ctx.db.patch(args.pendingPostId, { content: args.content });
    },
});

export const deletePendingPost = mutation({
    args: { pendingPostId: v.id("pendingPosts") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) throw new Error("User not found");

        const post = await ctx.db.get(args.pendingPostId);
        if (!post || post.userId !== user._id) throw new Error("Unauthorized");

        await ctx.db.delete(args.pendingPostId);
    },
});

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

export const getPostHistoryRecord = internalQuery({
    args: { postHistoryId: v.id("postHistory") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.postHistoryId);
    },
});

export const getPendingPostRecord = internalQuery({
    args: { pendingPostId: v.id("pendingPosts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.pendingPostId);
    },
});

export const getUsersDueForGenerate = internalQuery({
    handler: async (ctx) => {
        const now = Date.now();

        const activeUsers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        const due = [];

        for (const user of activeUsers) {
            const prefs = await ctx.db
                .query("preferences")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .unique();

            if (!prefs) continue;

            const intervalMs = (prefs.generateIntervalHours ?? 6) * 60 * 60 * 1000;
            const lastGen = prefs.lastGenerateTime ?? 0;

            if (now - lastGen >= intervalMs) {
                due.push({ ...user, preferences: prefs });
            }
        }

        return due;
    },
});

export const getUsersDueForPost = internalQuery({
    handler: async (ctx) => {
        const now = Date.now();

        const activeUsers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        const due = [];

        for (const user of activeUsers) {
            const prefs = await ctx.db
                .query("preferences")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .unique();

            if (!prefs) continue;

            const intervalMs = (prefs.postIntervalHours ?? 8) * 60 * 60 * 1000;
            const lastPost = prefs.lastPostTime ?? 0;

            if (now - lastPost < intervalMs) continue;

            // Must have a pending post ready
            const pending = await ctx.db
                .query("pendingPosts")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .filter((q) => q.eq(q.field("status"), "pending"))
                .first();

            if (!pending) continue;

            due.push({ ...user, preferences: prefs, pendingPost: pending });
        }

        return due;
    },
});

export const logPostResult = internalMutation({
    handler: async (ctx, args: any) => {
        await ctx.db.insert("postHistory", {
            userId: args.userId,
            content: args.content,
            blueskyUri: args.blueskyUri,
            status: args.status,
            error: args.error,
            timestamp: Date.now(),
        });

        if (args.status === "success") {
            const prefs = await ctx.db
                .query("preferences")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .unique();
            if (prefs) {
                await ctx.db.patch(prefs._id, { lastPostTime: Date.now() });
            }
        }
    },
});

export const savePendingPost = internalMutation({
    args: { userId: v.id("users"), content: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.insert("pendingPosts", {
            userId: args.userId,
            content: args.content,
            generatedAt: Date.now(),
            status: "pending",
        });

        // Update lastGenerateTime
        const prefs = await ctx.db
            .query("preferences")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
        if (prefs) {
            await ctx.db.patch(prefs._id, { lastGenerateTime: Date.now() });
        }
    },
});

export const markPendingPostUsed = internalMutation({
    args: { pendingPostId: v.id("pendingPosts"), status: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.pendingPostId, { status: args.status });
    },
});

// ---------------------------------------------------------------------------
// Cron: Generate pending posts
// ---------------------------------------------------------------------------

export const generatePendingPosts = internalAction({
    handler: async (ctx) => {
        const users = await ctx.runQuery(internal.posting.getUsersDueForGenerate);

        for (const user of users) {
            try {
                const content = await ctx.runAction(internal.openrouter.generatePost, {
                    topics: user.preferences.topics,
                    subtopics: user.preferences.subtopics, // Pass subtopics
                    tags: user.preferences.tags,
                    tone: user.preferences.tone,
                    goal: user.preferences.goal, // Pass goal
                });

                await ctx.runMutation(internal.posting.savePendingPost, {
                    userId: user._id,
                    content,
                });

                // Telegram Notification
                await ctx.runAction(internal.telegram.sendMessage, {
                    userId: user._id, text: `📝 *New Post Generated*\n\n${content.substring(0, 200)}${content.length > 200 ? "..." : ""}\n\n_queued for ${user.handle}_`
                });

                // WhatsApp Notification
                await ctx.runAction(internal.whatsapp.sendMessage, {
                    userId: user._id, text: `📝 *New Post Generated*\n\n${content.substring(0, 200)}${content.length > 200 ? "..." : ""}\n\n_queued for ${user.handle}_`
                });

                console.log(`Generated pending post for ${user.handle}`);
            } catch (error) {
                console.error(`Failed to generate post for ${user.handle}:`, error);
            }
        }
    },
});

// ---------------------------------------------------------------------------
// Cron: Publish pending posts
// ---------------------------------------------------------------------------

export const publishPendingPosts = internalAction({
    handler: async (ctx) => {
        const users = await ctx.runQuery(internal.posting.getUsersDueForPost);

        for (const user of users) {
            const pending = (user as any).pendingPost;

            try {
                if (!user.isActive) throw new Error("User inactive");
                if (!user.handle || !user.appPassword) throw new Error("Missing Bluesky credentials");

                // @ts-ignore
                const blueskyUri = await ctx.runAction(internal.bluesky.postToBluesky, {
                    handle: user.handle,
                    appPassword: user.appPassword,
                    text: pending.content,
                });

                await ctx.runMutation(internal.posting.markPendingPostUsed, {
                    pendingPostId: pending._id,
                    status: "posted",
                });

                await ctx.runMutation(internal.posting.logPostResult, {
                    userId: user._id,
                    content: pending.content,
                    blueskyUri,
                    status: "success",
                });

                // Telegram Notification
                await ctx.runAction(internal.telegram.sendMessage, {
                    userId: user._id, text: `🚀 *Post Published Successfully*\n\n${pending.content.substring(0, 150)}...\n\n[View on Bluesky](${blueskyUri.replace("at://", "https://bsky.app/profile/" + user.handle + "/post/")})`
                });

                // WhatsApp Notification
                await ctx.runAction(internal.whatsapp.sendMessage, {
                    userId: user._id, text: `🚀 *Post Published Successfully*\n\n${pending.content.substring(0, 150)}...\n\n[View on Bluesky](${blueskyUri.replace("at://", "https://bsky.app/profile/" + user.handle + "/post/")})`
                });

                console.log(`Published post for ${user.handle}: ${blueskyUri}`);
            } catch (error) {
                console.error(`Failed to publish post for ${user.handle}:`, error);

                await ctx.runMutation(internal.posting.markPendingPostUsed, {
                    pendingPostId: pending._id,
                    status: "failed",
                });

                await ctx.runMutation(internal.posting.logPostResult, {
                    userId: user._id,
                    content: pending.content,
                    status: "failed",
                    error: String(error),
                });

                // Telegram Notification
                await ctx.runAction(internal.telegram.sendMessage, {
                    userId: user._id, text: `⚠️ *Publishing Failed*\n\nUser: ${user.handle}\nError: ${String(error)}`
                });

                // WhatsApp Notification
                await ctx.runAction(internal.whatsapp.sendMessage, {
                    userId: user._id, text: `⚠️ *Publishing Failed*\n\nUser: ${user.handle}\nError: ${String(error)}`
                });
            }
        }
    },
});

// ---------------------------------------------------------------------------
// Manual actions (user-triggered)
// ---------------------------------------------------------------------------

export const postPendingNow = action({
    args: { pendingPostId: v.id("pendingPosts") },
    handler: async (ctx, args): Promise<{ success: boolean; uri: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");
        if (!user.handle || !user.appPassword) throw new Error("Bluesky credentials not configured");

        const post = await ctx.runQuery(internal.posting.getPendingPostRecord, {
            pendingPostId: args.pendingPostId,
        });
        if (!post) throw new Error("Pending post not found");
        if (post.userId !== user._id) throw new Error("Unauthorized");

        // @ts-ignore
        const blueskyUri = await ctx.runAction(internal.bluesky.postToBluesky, {
            handle: user.handle,
            appPassword: user.appPassword,
            text: post.content,
        });

        await ctx.runMutation(internal.posting.markPendingPostUsed, {
            pendingPostId: args.pendingPostId,
            status: "posted",
        });

        await ctx.runMutation(internal.posting.logPostResult, {
            userId: user._id,
            content: post.content,
            blueskyUri,
            status: "success",
        });

        // Telegram Notification
        await ctx.runAction(internal.telegram.sendMessage, {
            userId: user._id, text: `🚀 *Post Published Successfully (Manual)*\n\n${post.content.substring(0, 150)}...\n\n[View on Bluesky](${blueskyUri.replace("at://", "https://bsky.app/profile/" + user.handle + "/post/")})`
        });

        // WhatsApp Notification
        await ctx.runAction(internal.whatsapp.sendMessage, {
            userId: user._id, text: `🚀 *Post Published Successfully (Manual)*\n\n${post.content.substring(0, 150)}...\n\n[View on Bluesky](${blueskyUri.replace("at://", "https://bsky.app/profile/" + user.handle + "/post/")})`
        });

        return { success: true, uri: blueskyUri };
    },
});

export const postNow = action({
    args: { text: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; uri: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");
        if (!user.handle || !user.appPassword) throw new Error("Bluesky credentials not configured");

        try {
            // @ts-ignore
            const blueskyUri = await ctx.runAction(internal.bluesky.postToBluesky, {
                handle: user.handle,
                appPassword: user.appPassword,
                text: args.text,
            });

            await ctx.runMutation(internal.posting.logPostResult, {
                userId: user._id,
                content: args.text,
                blueskyUri,
                status: "success",
            });

            // Telegram Notification
            const userForHandle = (await ctx.runQuery(api.users.getCurrentUser))!;
            await ctx.runAction(internal.telegram.sendMessage, {
                userId: user._id, text: `🚀 *Manual Post Published*\n\n${args.text.substring(0, 150)}...\n\n[View on Bluesky](${blueskyUri.replace("at://", "https://bsky.app/profile/" + userForHandle.handle + "/post/")})`
            });

            // WhatsApp Notification
            await ctx.runAction(internal.whatsapp.sendMessage, {
                userId: user._id, text: `🚀 *Manual Post Published*\n\n${args.text.substring(0, 150)}...\n\n[View on Bluesky](${blueskyUri.replace("at://", "https://bsky.app/profile/" + userForHandle.handle + "/post/")})`
            });

            return { success: true, uri: blueskyUri };
        } catch (error) {
            await ctx.runMutation(internal.posting.logPostResult, {
                userId: user._id,
                content: args.text,
                status: "failed",
                error: String(error),
            });
            throw new Error(String(error));
        }
    },
});

export const generateAndPostNow = action({
    args: {
        topics: v.array(v.string()),
        subtopics: v.optional(v.array(v.string())), // Added subtopics
        tags: v.optional(v.array(v.string())),
        tone: v.string(),
        goal: v.optional(v.string()), // Added goal
    },
    handler: async (ctx, args): Promise<any> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");

        const content = await ctx.runAction(internal.openrouter.generatePost, {
            topics: args.topics,
            subtopics: args.subtopics, // Pass subtopics
            tags: args.tags,
            tone: args.tone,
            goal: args.goal, // Pass goal
        });

        if (!content) throw new Error("Failed to generate content");

        // @ts-ignore
        return await ctx.runAction(api.posting.postNow, { text: content });
    },
});

// ---------------------------------------------------------------------------
// Legacy: kept so existing cron reference doesn't break during migration
// ---------------------------------------------------------------------------

export const processAllScheduledPosts = internalAction({
    handler: async (ctx) => {
        // Delegates to the new split actions
        await ctx.runAction(internal.posting.generatePendingPosts);
        await ctx.runAction(internal.posting.publishPendingPosts);
    },
});

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export const getCommentsForPost = query({
    args: { postHistoryId: v.id("postHistory") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        return await ctx.db
            .query("comments")
            .withIndex("by_postHistoryId", (q) => q.eq("postHistoryId", args.postHistoryId))
            .order("desc")
            .collect();
    },
});

export const syncCommentsForPost = action({
    args: { postHistoryId: v.id("postHistory") },
    handler: async (ctx, args): Promise<{ success: boolean; count: number }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");
        if (!user.handle || !user.appPassword) throw new Error("Bluesky credentials not configured");

        const post = await ctx.runQuery(internal.posting.getPostHistoryRecord, {
            postHistoryId: args.postHistoryId,
        });
        if (!post) throw new Error("Post record not found");
        if (post.userId !== user._id) throw new Error("Unauthorized");
        if (!post.blueskyUri) throw new Error("Post has no Bluesky URI");

        // @ts-ignore
        const comments = await ctx.runAction(internal.bluesky.fetchCommentsForPost, {
            handle: user.handle,
            appPassword: user.appPassword,
            postUri: post.blueskyUri,
        });

        let count = 0;
        for (const comment of comments) {
            // Check if comment already exists
            const existing = await ctx.runQuery(api.posting.getCommentByBlueskyUri, {
                blueskyUri: comment.uri,
            });

            if (!existing) {
                await ctx.runMutation(internal.posting.saveComment, {
                    userId: user._id,
                    postHistoryId: args.postHistoryId,
                    blueskyUri: comment.uri,
                    authorDid: comment.author.did,
                    authorHandle: comment.author.handle,
                    authorDisplayName: comment.author.displayName,
                    authorAvatar: comment.author.avatar,
                    content: comment.content,
                    createdAt: comment.createdAt,
                });
                count++;
            }
        }

        return { success: true, count };
    },
});

export const getCommentByBlueskyUri = query({
    args: { blueskyUri: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("comments")
            .withIndex("by_blueskyUri", (q) => q.eq("blueskyUri", args.blueskyUri))
            .unique();
    },
});

export const saveComment = internalMutation({
    args: {
        userId: v.id("users"),
        postHistoryId: v.optional(v.id("postHistory")),
        blueskyUri: v.string(),
        authorDid: v.string(),
        authorHandle: v.optional(v.string()),
        authorDisplayName: v.optional(v.string()),
        authorAvatar: v.optional(v.string()),
        content: v.string(),
        createdAt: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("comments", {
            userId: args.userId,
            postHistoryId: args.postHistoryId,
            blueskyUri: args.blueskyUri,
            authorDid: args.authorDid,
            authorHandle: args.authorHandle,
            authorDisplayName: args.authorDisplayName,
            authorAvatar: args.authorAvatar,
            content: args.content,
            timestamp: Date.now(),
            createdAt: new Date(args.createdAt).getTime(),
        });
    },
});
