import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    handle: v.string(),
    appPassword: v.string(), // Encrypted at rest by Convex, but should be handled carefully
    isActive: v.boolean(),
  }).index("by_clerkId", ["clerkId"]),

  preferences: defineTable({
    userId: v.id("users"),
    topics: v.array(v.string()),
    tone: v.string(),
    frequency: v.number(), // in minutes or hours
    lastPostTime: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

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
