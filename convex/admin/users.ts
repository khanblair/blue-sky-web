import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./_guard";

export const listUsers = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const users = await ctx.db.query("users").collect();
        const now = Date.now();

        return Promise.all(
            users.map(async (user) => {
                const sub = await ctx.db
                    .query("subscriptions")
                    .withIndex("by_userId", (q) => q.eq("userId", user._id))
                    .order("desc")
                    .first();

                const plan =
                    sub && sub.status === "active" && sub.currentPeriodEnd > now
                        ? sub.plan
                        : "starter";

                return { ...user, plan };
            })
        );
    },
});

export const getUserDetails = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const [subscription, usage, postCount, engagementCount] = await Promise.all([
            ctx.db
                .query("subscriptions")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .order("desc")
                .first(),
            ctx.db
                .query("usageMetrics")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .order("desc")
                .first(),
            ctx.db
                .query("postHistory")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .collect()
                .then((r) => r.length),
            ctx.db
                .query("engagementLog")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .collect()
                .then((r) => r.length),
        ]);

        return { user, subscription, usage, postCount, engagementCount };
    },
});

export const setUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(v.literal("user"), v.literal("admin")),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");
        await ctx.db.patch(args.userId, { role: args.role });
        return args.userId;
    },
});

export const deactivateUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.userId, { isActive: false });
    },
});

export const reactivateUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.userId, { isActive: true });
    },
});
