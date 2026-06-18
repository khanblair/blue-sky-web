import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// One-time CLI bootstrap — sets a user's role to "admin" by their Convex document ID.
// No auth required so it can be called via `npx convex run`.
// Delete this file (or leave it — it requires the exact document ID to operate).
export const setAdminById = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");
        await ctx.db.patch(userId, { role: "admin" });
        return { _id: userId, handle: user.handle, role: "admin" };
    },
});
