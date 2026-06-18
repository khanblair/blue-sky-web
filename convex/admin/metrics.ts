import { query } from "../_generated/server";
import { requireAdmin } from "./_guard";

export const getPlatformMetrics = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const now = Date.now();
        const [users, subscriptions, postHistory, usageMetrics, engagementLogs] =
            await Promise.all([
                ctx.db.query("users").collect(),
                ctx.db.query("subscriptions").collect(),
                ctx.db.query("postHistory").collect(),
                ctx.db.query("usageMetrics").collect(),
                ctx.db.query("engagementLog").collect(),
            ]);

        const activeSubscriptions = subscriptions.filter(
            (s) => s.status === "active" && s.currentPeriodEnd > now
        );

        const planBreakdown = activeSubscriptions.reduce(
            (acc, sub) => {
                acc[sub.plan] = (acc[sub.plan] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const totalPostsPublished = usageMetrics.reduce(
            (sum, u) => sum + u.postsPublished,
            0
        );
        const totalAiGenerations = usageMetrics.reduce(
            (sum, u) => sum + u.aiGenerationsUsed,
            0
        );
        const totalAutoReplies = usageMetrics.reduce(
            (sum, u) => sum + (u.autoRepliesUsed ?? 0),
            0
        );

        // Revenue estimate based on active plan prices
        const PLAN_PRICES: Record<string, number> = {
            lite: 2, basic: 5, pro: 10, standard: 15, enterprise: 20,
        };
        const estimatedMrr = activeSubscriptions.reduce(
            (sum, sub) => sum + (PLAN_PRICES[sub.plan] ?? 0),
            0
        );

        return {
            totalUsers: users.length,
            activeUsers: users.filter((u) => u.isActive).length,
            adminUsers: users.filter((u) => u.role === "admin").length,
            paidSubscriptions: activeSubscriptions.length,
            pendingVerifications: subscriptions.filter(
                (s) => s.status === "pending_verification"
            ).length,
            planBreakdown,
            estimatedMrr,
            totalPostsPublished,
            totalPostsInHistory: postHistory.filter((p) => p.status === "success").length,
            totalFailedPosts: postHistory.filter((p) => p.status === "failed").length,
            totalAiGenerations,
            totalAutoReplies,
            totalEngagementActions: engagementLogs.length,
        };
    },
});
