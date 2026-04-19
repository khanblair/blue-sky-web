import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

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

                // 2. Post to Bluesky
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
