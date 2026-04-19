import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

// ... existing internal functions ...

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
            .take(10);
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

        return {
            totalPosts: posts.length,
        };
    },
});

export const processAllScheduledPosts = internalAction({
    handler: async (ctx) => {
        const usersToPost = await ctx.runQuery(internal.posting.getUsersDueForPost);

        for (const user of usersToPost) {
            try {
                // 1. Generate Content
                const content = await ctx.runAction(internal.openrouter.generatePost, {
                    topics: user.preferences.topics,
                    tone: user.preferences.tone,
                });

                if (!user || !user.isActive) {
                    throw new Error("User not found or inactive.");
                }

                if (!user.handle || !user.appPassword) {
                    throw new Error("Bluesky handle and app password are required.");
                }

                // 2. Post to Bluesky
                // @ts-ignore
                const blueskyUri = await ctx.runAction(internal.bluesky.postToBluesky, {
                    handle: user.handle,
                    appPassword: user.appPassword,
                    text: content,
                });

                // 3. Log Success and Update Last Post Time
                await ctx.runMutation(internal.posting.logPostResult, {
                    userId: user._id,
                    content,
                    blueskyUri,
                    status: "success",
                });
            } catch (error) {
                console.error(`Failed to post for user ${user.handle}:`, error);
                await ctx.runMutation(internal.posting.logPostResult, {
                    userId: user._id,
                    content: "", // or last attempted content
                    status: "failed",
                    error: String(error),
                });
            }
        }
    },
});

export const getUsersDueForPost = internalQuery({
    handler: async (ctx) => {
        const now = Date.now();
        const activeUsers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        const dueUsers = [];

        for (const user of activeUsers) {
            const prefs = await ctx.db
                .query("preferences")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .unique();

            if (prefs) {
                const frequencyMs = prefs.frequency * 60 * 60 * 1000; // Assuming frequency is in hours
                const lastPostTime = prefs.lastPostTime || 0;

                if (now - lastPostTime >= frequencyMs) {
                    dueUsers.push({
                        ...user,
                        preferences: prefs,
                    });
                }
            }
        }

        return dueUsers;
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

export const postNow = action({
    args: { text: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; uri: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");
        if (!user.handle || !user.appPassword) throw new Error("Bluesky credentials not configured");

        try {
            // 1. Post to Bluesky
            // @ts-ignore
            const blueskyUri = await ctx.runAction(internal.bluesky.postToBluesky, {
                handle: user.handle,
                appPassword: user.appPassword,
                text: args.text,
            });

            // 2. Log Result
            await ctx.runMutation(internal.posting.logPostResult, {
                userId: user._id,
                content: args.text,
                blueskyUri,
                status: "success",
            });

            return { success: true, uri: blueskyUri };
        } catch (error) {
            console.error("Manual post failed:", error);
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
    args: { topics: v.array(v.string()), tone: v.string() },
    handler: async (ctx, args): Promise<any> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");

        // 1. Generate content
        const content = await ctx.runAction(internal.openrouter.generatePost, {
            topics: args.topics,
            tone: args.tone,
        });

        if (!content) throw new Error("Failed to generate content");

        // 2. Post it
        // @ts-ignore
        return await ctx.runAction(api.posting.postNow, { text: content });
    },
});
