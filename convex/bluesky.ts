import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const syncProfile = action({
    args: {},
    handler: async (ctx): Promise<{ success: boolean; displayName?: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user: any = await ctx.runQuery(api.users.getCurrentUser);
        if (!user || !user.handle || !user.appPassword) {
            throw new Error("Bluesky credentials missing");
        }

        try {
            // 1. Authenticate with BlueSky
            const authResponse: Response = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: user.handle,
                    password: user.appPassword,
                }),
            });

            if (!authResponse.ok) {
                const error: any = await authResponse.json();
                throw new Error(error.message || "Bluesky authentication failed");
            }

            const authData: any = await authResponse.json();
            const accessJwt: string = authData.accessJwt;
            const did: string = authData.did;

            // 2. Fetch Profile
            const profileResponse: Response = await fetch(`https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${did}`, {
                headers: { "Authorization": `Bearer ${accessJwt}` },
            });

            if (!profileResponse.ok) {
                throw new Error("Failed to fetch Bluesky profile");
            }

            const profileData: any = await profileResponse.json();

            // 3. Update User Record
            await ctx.runMutation(api.users.updateProfile, {
                displayName: profileData.displayName,
                avatar: profileData.avatar,
                description: profileData.description,
            });

            return { success: true, displayName: profileData.displayName };
        } catch (error: any) {
            console.error("Profile sync error:", error);
            throw new Error(error.message);
        }
    },
});
