import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_LIMITS, type PlanId } from "./planLimits";

export const getCurrentSubscription = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .first();

        if (!sub) {
            return { plan: "starter" as PlanId, status: "active", currentPeriodEnd: Infinity };
        }

        const now = Date.now();
        const isActive = sub.status === "active" && sub.currentPeriodEnd > now;

        return {
            _id: sub._id,
            plan: (isActive ? sub.plan : "starter") as PlanId,
            status: isActive ? "active" : sub.status,
            currentPeriodStart: sub.currentPeriodStart,
            currentPeriodEnd: sub.currentPeriodEnd,
            paymentMethod: sub.paymentMethod,
            txHash: sub.txHash,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
        };
    },
});

export const getPlanDetails = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { plan: "starter" as PlanId, limits: PLAN_LIMITS.starter, usage: null };

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return { plan: "starter" as PlanId, limits: PLAN_LIMITS.starter, usage: null };

        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .first();

        const now = Date.now();
        let plan: PlanId = "starter";
        if (sub && sub.status === "active" && sub.currentPeriodEnd > now) {
            plan = sub.plan as PlanId;
        }

        const usageResult = await ctx.db
            .query("usageMetrics")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .first();

        let usage = null;
        if (usageResult) {
            usage = {
                postsGenerated: usageResult.postsGenerated,
                postsPublished: usageResult.postsPublished,
                aiGenerationsUsed: usageResult.aiGenerationsUsed,
                periodStart: usageResult.periodStart,
                periodEnd: usageResult.periodEnd,
            };
        }

        return {
            plan,
            limits: PLAN_LIMITS[plan],
            usage,
        };
    },
});

export const createSubscription = mutation({
    args: {
        plan: v.string(),
        paymentMethod: v.optional(v.string()),
        txHash: v.optional(v.string()),
        walletAddress: v.optional(v.string()),
        amountPaid: v.optional(v.number()),
        currency: v.optional(v.string()),
        billingCycle: v.optional(v.string()), // "monthly" | "yearly"
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const planId = args.plan as PlanId;
        if (!PLAN_LIMITS[planId]) throw new Error("Invalid plan");

        const now = Date.now();
        const periodEnd = args.billingCycle === "yearly"
            ? now + 365 * 24 * 60 * 60 * 1000
            : args.billingCycle === "quarterly"
                ? now + 90 * 24 * 60 * 60 * 1000
                : now + 30 * 24 * 60 * 60 * 1000;

        const existingSub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .first();

        if (existingSub && existingSub.status === "active" && existingSub.currentPeriodEnd > now) {
            await ctx.db.patch(existingSub._id, {
                plan: planId,
                status: "active",
                paymentMethod: args.paymentMethod ?? existingSub.paymentMethod,
                txHash: args.txHash ?? existingSub.txHash,
                walletAddress: args.walletAddress ?? existingSub.walletAddress,
                amountPaid: args.amountPaid ?? existingSub.amountPaid,
                currency: args.currency ?? existingSub.currency,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
            });

            return existingSub._id;
        }

        const subId = await ctx.db.insert("subscriptions", {
            userId: user._id,
            plan: planId,
            status: "active",
            paymentMethod: args.paymentMethod,
            txHash: args.txHash,
            walletAddress: args.walletAddress,
            amountPaid: args.amountPaid,
            currency: args.currency,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            createdAt: now,
        });

        await ctx.db.insert("usageMetrics", {
            userId: user._id,
            periodStart: now,
            periodEnd: periodEnd,
            postsGenerated: 0,
            postsPublished: 0,
            aiGenerationsUsed: 0,
        });

        return subId;
    },
});

export const cancelSubscription = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .first();

        if (!sub || sub.status !== "active") {
            throw new Error("No active subscription to cancel");
        }

        await ctx.db.patch(sub._id, {
            cancelAtPeriodEnd: true,
        });

        return sub._id;
    },
});

export const submitPaymentProof = mutation({
    args: {
        txHash: v.string(),
        plan: v.string(),
        billingCycle: v.optional(v.string()),
        walletAddress: v.optional(v.string()),
        amountPaid: v.optional(v.number()),
        currency: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const planId = args.plan as PlanId;
        if (!PLAN_LIMITS[planId]) throw new Error("Invalid plan");

        const now = Date.now();

        const existingPending = await ctx.db
            .query("subscriptions")
            .withIndex("by_status", (q) => q.eq("status", "pending_verification"))
            .collect();

        const alreadyPending = existingPending.find(s => s.userId === user._id);
        if (alreadyPending) {
            throw new Error("You already have a pending verification. Please wait for it to be reviewed.");
        }

        const periodEnd = args.billingCycle === "yearly"
            ? now + 365 * 24 * 60 * 60 * 1000
            : args.billingCycle === "quarterly"
                ? now + 90 * 24 * 60 * 60 * 1000
                : now + 30 * 24 * 60 * 60 * 1000;

        const subId = await ctx.db.insert("subscriptions", {
            userId: user._id,
            plan: planId,
            status: "pending_verification",
            paymentMethod: "crypto",
            txHash: args.txHash,
            walletAddress: args.walletAddress,
            amountPaid: args.amountPaid,
            currency: args.currency,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            createdAt: now,
        });

        return subId;
    },
});

export const getSubscriptionByUserId = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const now = Date.now();
        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .first();

        if (!sub) return { plan: "starter" as PlanId, limits: PLAN_LIMITS.starter };

        const isActive = sub.status === "active" && sub.currentPeriodEnd > now;
        const plan = isActive ? (sub.plan as PlanId) : "starter";

        return { plan, limits: PLAN_LIMITS[plan] };
    },
});

export const verifySubscription = mutation({
    args: {
        subscriptionId: v.id("subscriptions"),
        verified: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const sub = await ctx.db.get(args.subscriptionId);
        if (!sub) throw new Error("Subscription not found");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || sub.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        const now = Date.now();
        if (args.verified) {
            const periodEnd = sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now + 30 * 24 * 60 * 60 * 1000;

            await ctx.db.patch(args.subscriptionId, {
                status: "active",
                verifiedAt: now,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            });

            const existingUsage = await ctx.db
                .query("usageMetrics")
                .withIndex("by_userId", (q) => q.eq("userId", sub.userId))
                .order("desc")
                .first();

            if (!existingUsage || existingUsage.periodEnd < now) {
                await ctx.db.insert("usageMetrics", {
                    userId: sub.userId,
                    periodStart: now,
                    periodEnd: periodEnd,
                    postsGenerated: 0,
                    postsPublished: 0,
                    aiGenerationsUsed: 0,
                });
            }
        } else {
            await ctx.db.patch(args.subscriptionId, {
                status: "rejected",
            });
        }

        return args.verified;
    },
});

export const adminGetPendingSubscriptions = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const pending = await ctx.db
            .query("subscriptions")
            .withIndex("by_status", (q) => q.eq("status", "pending_verification"))
            .collect();

        const results = [];
        for (const sub of pending) {
            const user = await ctx.db.get(sub.userId);
            if (user) {
                results.push({ ...sub, user });
            }
        }

        return results;
    },
});

export const adminVerifySubscription = mutation({
    args: {
        subscriptionId: v.id("subscriptions"),
        approve: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const sub = await ctx.db.get(args.subscriptionId);
        if (!sub) throw new Error("Subscription not found");
        if (sub.status !== "pending_verification") throw new Error("Subscription is not pending verification");

        const now = Date.now();

        if (args.approve) {
            const periodEnd = sub.currentPeriodEnd > now
                ? sub.currentPeriodEnd
                : now + 30 * 24 * 60 * 60 * 1000;

            await ctx.db.patch(args.subscriptionId, {
                status: "active",
                verifiedAt: now,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            });

            const existingUsage = await ctx.db
                .query("usageMetrics")
                .withIndex("by_userId", (q) => q.eq("userId", sub.userId))
                .order("desc")
                .first();

            if (!existingUsage || existingUsage.periodEnd < now) {
                await ctx.db.insert("usageMetrics", {
                    userId: sub.userId,
                    periodStart: now,
                    periodEnd: periodEnd,
                    postsGenerated: 0,
                    postsPublished: 0,
                    aiGenerationsUsed: 0,
                });
            }
        } else {
            await ctx.db.patch(args.subscriptionId, {
                status: "rejected",
            });
        }

        return args.approve;
    },
});