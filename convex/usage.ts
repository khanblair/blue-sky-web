import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_LIMITS, type PlanId } from "./planLimits";

export const getCurrentUsage = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        const usage = await ctx.db
            .query("usageMetrics")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .first();

        return usage ?? null;
    },
});

export const incrementAiGeneration = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await incrementUsage(ctx, args.userId, "aiGenerationsUsed");
    },
});

export const incrementPostGenerated = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await incrementUsage(ctx, args.userId, "postsGenerated");
    },
});

export const incrementPostPublished = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await incrementUsage(ctx, args.userId, "postsPublished");
    },
});

async function incrementUsage(
    ctx: any,
    userId: any,
    field: "postsGenerated" | "postsPublished" | "aiGenerationsUsed"
) {
    const now = Date.now();

    let usage = await ctx.db
        .query("usageMetrics")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .order("desc")
        .first();

    if (!usage || usage.periodEnd < now) {
        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q: any) => q.eq("userId", userId))
            .order("desc")
            .first();

        const subActive = sub && sub.status === "active" && sub.currentPeriodEnd > now;
        const usagePeriodEnd = subActive ? sub.currentPeriodEnd : now + 30 * 24 * 60 * 60 * 1000;

        await ctx.db.insert("usageMetrics", {
            userId,
            periodStart: now,
            periodEnd: usagePeriodEnd,
            postsGenerated: field === "postsGenerated" ? 1 : 0,
            postsPublished: field === "postsPublished" ? 1 : 0,
            aiGenerationsUsed: field === "aiGenerationsUsed" ? 1 : 0,
        });
        return;
    }

    await ctx.db.patch(usage._id, {
        [field]: (usage[field as keyof typeof usage] as number) + 1,
    });
}

export const getUsageForUser = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const now = Date.now();

        const usage = await ctx.db
            .query("usageMetrics")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .first();

        if (!usage || usage.periodEnd < now) {
            return {
                postsGenerated: 0,
                postsPublished: 0,
                aiGenerationsUsed: 0,
                periodEnd: 0,
            };
        }

        return {
            postsGenerated: usage.postsGenerated,
            postsPublished: usage.postsPublished,
            aiGenerationsUsed: usage.aiGenerationsUsed,
            periodEnd: usage.periodEnd,
        };
    },
});

export const checkLimit = internalQuery({
    args: {
        userId: v.id("users"),
        action: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
            .order("desc")
            .first();

        const subIsActive = sub && sub.status === "active" && sub.currentPeriodEnd > now;
        const plan: PlanId = subIsActive ? (sub.plan as PlanId) : "starter";
        const planLimits = PLAN_LIMITS[plan];

        const usageRecord = await ctx.db
            .query("usageMetrics")
            .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
            .order("desc")
            .first();

        const currentUsage = {
            postsGenerated: usageRecord?.postsGenerated ?? 0,
            postsPublished: usageRecord?.postsPublished ?? 0,
            aiGenerationsUsed: usageRecord?.aiGenerationsUsed ?? 0,
        };

        if (args.action === "generate") {
            const atLimit = currentUsage.aiGenerationsUsed >= planLimits.aiGenerationsPerMonth;
            return {
                allowed: !atLimit,
                plan,
                limits: planLimits,
                usage: currentUsage,
                remaining: planLimits.aiGenerationsPerMonth === Infinity ? Infinity : planLimits.aiGenerationsPerMonth - currentUsage.aiGenerationsUsed,
                message: atLimit
                    ? `AI generation limit reached (${planLimits.aiGenerationsPerMonth}/${plan === 'starter' ? 'Starter' : plan} plan). Upgrade for more.`
                    : "OK",
            };
        }

        if (args.action === "publish" || args.action === "manualPost") {
            const atLimit = currentUsage.postsPublished >= planLimits.postsPerMonth;
            return {
                allowed: !atLimit,
                plan,
                limits: planLimits,
                usage: currentUsage,
                remaining: planLimits.postsPerMonth === Infinity ? Infinity : planLimits.postsPerMonth - currentUsage.postsPublished,
                message: atLimit
                    ? `Monthly post limit reached (${planLimits.postsPerMonth}/${plan === 'starter' ? 'Starter' : plan} plan). Upgrade for more.`
                    : "OK",
            };
        }

        return { allowed: true, plan, limits: planLimits, usage: currentUsage, remaining: Infinity as any, message: "OK" };
    },
});