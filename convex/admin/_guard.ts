import type { QueryCtx, MutationCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireAdmin(ctx: Ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();

    if (!user) throw new Error("User not found");

    // Primary: DB role flag. Fallback: hardcoded env var so even if DB is wiped the admin can still recover.
    const isEnvAdmin = process.env.ADMIN_CLERK_ID === identity.subject;
    if (user.role !== "admin" && !isEnvAdmin) {
        throw new Error("Unauthorized: admin access required");
    }

    return user;
}
