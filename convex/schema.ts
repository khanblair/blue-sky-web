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
        subtopics: v.optional(v.array(v.string())), // Granular subtopics
        tags: v.optional(v.array(v.string())), // Add optional tags array
        tone: v.string(),
        goal: v.optional(v.string()), // e.g. "educate", "entertain", "inspire"
        frequency: v.number(),                        // legacy, kept for compat
        generateIntervalHours: v.optional(v.number()), // generate a post every N hours
        postIntervalHours: v.optional(v.number()),     // publish a post every N hours
        lastPostTime: v.optional(v.number()),
        lastGenerateTime: v.optional(v.number()),

        // Notification Targets & API Keys (Per-user)
        telegramBotToken: v.optional(v.string()),
        telegramChatId: v.optional(v.string()),
        whatsappTargetNumber: v.optional(v.string()),
        maytapiProductId: v.optional(v.string()),
        maytapiPhoneId: v.optional(v.string()),
        maytapiApiToken: v.optional(v.string()),
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

    comments: defineTable({
        userId: v.id("users"),
        postHistoryId: v.optional(v.id("postHistory")),
        blueskyUri: v.string(),
        authorDid: v.string(),
        authorHandle: v.optional(v.string()),
        authorDisplayName: v.optional(v.string()),
        authorAvatar: v.optional(v.string()),
        content: v.string(),
        timestamp: v.number(),
        createdAt: v.number(),
    }).index("by_postHistoryId", ["postHistoryId"])
        .index("by_blueskyUri", ["blueskyUri"]),

    subscriptions: defineTable({
        userId: v.id("users"),
        plan: v.string(), // "starter" | "lite" | "basic" | "pro" | "standard" | "enterprise"
        status: v.string(), // "active" | "past_due" | "canceled" | "expired"
        paymentMethod: v.optional(v.string()), // "crypto_usdc_eth" | "crypto_usdc_base" | "crypto_eth" | "crypto_btc" | "manual"
        txHash: v.optional(v.string()),
        walletAddress: v.optional(v.string()),
        amountPaid: v.optional(v.number()),
        currency: v.optional(v.string()),
        currentPeriodStart: v.number(),
        currentPeriodEnd: v.number(),
        cancelAtPeriodEnd: v.optional(v.boolean()),
        verifiedAt: v.optional(v.number()),
        createdAt: v.number(),
    }).index("by_userId", ["userId"])
        .index("by_status", ["status"]),

    usageMetrics: defineTable({
        userId: v.id("users"),
        periodStart: v.number(),
        periodEnd: v.number(),
        postsGenerated: v.number(),
        postsPublished: v.number(),
        aiGenerationsUsed: v.number(),
    }).index("by_userId", ["userId"])
        .index("by_userId_periodStart", ["userId", "periodStart"]),

    aiProviderConfigs: defineTable({
        userId: v.id("users"),
        provider: v.string(), // "openrouter" | "openai" | "anthropic" | "google"
        apiKey: v.optional(v.string()),
        model: v.string(),
        temperature: v.optional(v.number()),
        maxTokens: v.optional(v.number()),
        isActive: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_userId", ["userId"])
        .index("by_userId_active", ["userId", "isActive"]),
});
