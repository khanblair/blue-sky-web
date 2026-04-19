import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        handle: v.optional(v.string()),
        appPassword: v.optional(v.string()), // Encrypted at rest by Convex, but should be handled carefully
        isActive: v.boolean(),
        bskyDisplayName: v.optional(v.string()),
        bskyAvatar: v.optional(v.string()),
        bskyDescription: v.optional(v.string()),
    }).index("by_clerkId", ["clerkId"]),

    preferences: defineTable({
        userId: v.id("users"),
        topics: v.array(v.string()),
        tone: v.string(),
        frequency: v.number(),                        // legacy, kept for compat
        generateIntervalHours: v.optional(v.number()), // generate a post every N hours
        postIntervalHours: v.optional(v.number()),     // publish a post every N hours
        lastPostTime: v.optional(v.number()),
        lastGenerateTime: v.optional(v.number()),
    }).index("by_userId", ["userId"]),

    pendingPosts: defineTable({
        userId: v.id("users"),
        content: v.string(),
        generatedAt: v.number(),
        status: v.string(), // "pending" | "posted" | "failed"
    }).index("by_userId", ["userId"])
     .index("by_status", ["status"]),

    postHistory: defineTable({
        userId: v.id("users"),
        content: v.string(),
        blueskyUri: v.optional(v.string()),
        status: v.string(), // "success" | "failed"
        error: v.optional(v.string()),
        timestamp: v.number(),
    }).index("by_userId", ["userId"]),

    cronLogs: defineTable({
        name: v.string(),
        status: v.string(),
        timestamp: v.number(),
    }),
});
