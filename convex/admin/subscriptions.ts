import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./_guard";
import { PLAN_LIMITS, type PlanId } from "../planLimits";
import { Id } from "../_generated/dataModel";

export const getPendingSubscriptions = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const pending = await ctx.db
            .query("subscriptions")
            .withIndex("by_status", (q) => q.eq("status", "pending_verification"))
            .collect();

        const results = [];
        for (const sub of pending) {
            const user = await ctx.db.get(sub.userId);
            if (user) results.push({ ...sub, user });
        }
        return results;
    },
});

export const getAllSubscriptions = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const subs = await ctx.db.query("subscriptions").order("desc").take(200);
        const results = [];
        for (const sub of subs) {
            const user = await ctx.db.get(sub.userId);
            if (user) results.push({ ...sub, user });
        }
        return results;
    },
});

export const verifySubscription = mutation({
    args: {
        subscriptionId: v.id("subscriptions"),
        approve: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const sub = await ctx.db.get(args.subscriptionId);
        if (!sub) throw new Error("Subscription not found");
        if (sub.status !== "pending_verification") throw new Error("Not pending verification");

        const now = Date.now();

        if (args.approve) {
            const periodEnd =
                sub.currentPeriodEnd > now
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
            await ctx.db.patch(args.subscriptionId, { status: "rejected" });
        }

        return args.approve;
    },
});

export const grantPlan = mutation({
    args: {
        userId: v.string(),
        plan: v.string(),
        billingCycle: v.optional(v.string()), // "monthly" | "yearly" — defaults to yearly
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const userId = args.userId as Id<"users">;
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        const planId = args.plan as PlanId;
        if (!PLAN_LIMITS[planId]) throw new Error(`Invalid plan: ${args.plan}`);

        const now = Date.now();
        const periodEnd =
            args.billingCycle === "monthly"
                ? now + 30 * 24 * 60 * 60 * 1000
                : now + 365 * 24 * 60 * 60 * 1000;

        const existingSub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .first();

        if (existingSub) {
            await ctx.db.patch(existingSub._id, {
                plan: planId,
                status: "active",
                paymentMethod: "manual",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
                verifiedAt: now,
            });
            return existingSub._id;
        }

        const subId = await ctx.db.insert("subscriptions", {
            userId,
            plan: planId,
            status: "active",
            paymentMethod: "manual",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            verifiedAt: now,
            createdAt: now,
        });

        const existingUsage = await ctx.db
            .query("usageMetrics")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .first();

        if (!existingUsage || existingUsage.periodEnd < now) {
            await ctx.db.insert("usageMetrics", {
                userId,
                periodStart: now,
                periodEnd: periodEnd,
                postsGenerated: 0,
                postsPublished: 0,
                aiGenerationsUsed: 0,
            });
        }

        return subId;
    },
});

export const revokeSubscription = mutation({
    args: { subscriptionId: v.id("subscriptions") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.subscriptionId, {
            status: "canceled",
            cancelAtPeriodEnd: false,
        });
    },
});
