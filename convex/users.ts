import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
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
            frequency: 24,
            generateIntervalHours: 6,  // generate every 6 hours by default
            postIntervalHours: 8,      // post every 8 hours by default
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
        tags: v.optional(v.array(v.string())),
        tone: v.string(),
        frequency: v.number(),
        generateIntervalHours: v.optional(v.number()),
        postIntervalHours: v.optional(v.number()),
        telegramBotToken: v.optional(v.string()),
        telegramChatId: v.optional(v.string()),
        whatsappTargetNumber: v.optional(v.string()),
        maytapiProductId: v.optional(v.string()),
        maytapiPhoneId: v.optional(v.string()),
        maytapiApiToken: v.optional(v.string()),
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
                tags: args.tags,
                tone: args.tone,
                frequency: args.frequency,
                generateIntervalHours: args.generateIntervalHours,
                postIntervalHours: args.postIntervalHours,
                telegramBotToken: args.telegramBotToken,
                telegramChatId: args.telegramChatId,
                whatsappTargetNumber: args.whatsappTargetNumber,
                maytapiProductId: args.maytapiProductId,
                maytapiPhoneId: args.maytapiPhoneId,
                maytapiApiToken: args.maytapiApiToken,
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

/**
 * Returns the integration credentials currently configured as Convex
 * environment variables. Used to pre-fill the Settings UI when the user
 * hasn't overridden them with their own per-user values yet.
 */
export const getIntegrationDefaults = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return {
            telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
            telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
            whatsappTargetNumber: process.env.MAYTAPI_TARGET_NUMBER ?? "",
            maytapiProductId: process.env.MAYTAPI_PRODUCT_ID ?? "",
            maytapiPhoneId: process.env.MAYTAPI_PHONE_ID ?? "",
            maytapiApiToken: process.env.MAYTAPI_API_TOKEN ?? "",
        };
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

export const syncUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!existingUser) {
            const userId = await ctx.db.insert("users", {
                clerkId: identity.subject,
                isActive: false,
            });

            await ctx.db.insert("preferences", {
                userId,
                topics: [],
                tone: "professional",
                frequency: 24,
                generateIntervalHours: 6,
                postIntervalHours: 8,
            });

            return userId;
        }
        return existingUser._id;
    },
});

export const syncUserInternal = internalMutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!existingUser) {
            const userId = await ctx.db.insert("users", {
                clerkId: args.clerkId,
                isActive: false,
            });

            await ctx.db.insert("preferences", {
                userId,
                topics: [],
                tone: "professional",
                frequency: 24,
                generateIntervalHours: 6,
                postIntervalHours: 8,
            });
        }
    },
});

export const getPreferencesByUserId = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("preferences")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});
