import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrUpdateUser = mutation({
    args: {
        handle: v.string(),
        appPassword: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existingUser) {
            return await ctx.db.patch(existingUser._id, {
                handle: args.handle,
                appPassword: args.appPassword,
                isActive: args.isActive,
            });
        }

        const userId = await ctx.db.insert("users", {
            clerkId: identity.subject,
            handle: args.handle,
            appPassword: args.appPassword,
            isActive: args.isActive,
        });

        // Initialize default preferences
        await ctx.db.insert("preferences", {
            userId,
            topics: [],
            tone: "professional",
            frequency: 24, // Once a day
        });

        return userId;
    },
});

export const getCurrentUser = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

export const updatePreferences = mutation({
    args: {
        topics: v.array(v.string()),
        tone: v.string(),
        frequency: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const prefs = await ctx.db
            .query("preferences")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();

        if (prefs) {
            await ctx.db.patch(prefs._id, {
                topics: args.topics,
                tone: args.tone,
                frequency: args.frequency,
            });
        }
    },
});
