import { query } from "../_generated/server";
import { requireAdmin } from "./_guard";

export const getCronLogs = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return ctx.db.query("cronLogs").order("desc").take(200);
    },
});

export const getRecentCronStatus = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const logs = await ctx.db.query("cronLogs").order("desc").take(500);

        // Latest status per cron name
        const latest: Record<string, { status: string; timestamp: number }> = {};
        for (const log of logs) {
            if (!latest[log.name]) {
                latest[log.name] = { status: log.status, timestamp: log.timestamp };
            }
        }

        return Object.entries(latest).map(([name, data]) => ({
            name,
            ...data,
        }));
    },
});
