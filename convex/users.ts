import { mutation, query, internalMutation } from "./_generated/server";
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

export const getPreferences = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        return await ctx.db
            .query("preferences")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();
    },
});

export const updateProfile = mutation({
    args: {
        displayName: v.optional(v.string()),
        avatar: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            bskyDisplayName: args.displayName,
            bskyAvatar: args.avatar,
            bskyDescription: args.description,
        });
    },
});

export const syncUser = internalMutation({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!existingUser) {
            const userId = await ctx.db.insert("users", {
                clerkId: args.clerkId,
                isActive: false, // Inactive until onboarding is complete
            });

            // Initialize default preferences
            await ctx.db.insert("preferences", {
                userId,
                topics: [],
                tone: "professional",
                frequency: 24, // Once a day
            });
        }
    },
});
