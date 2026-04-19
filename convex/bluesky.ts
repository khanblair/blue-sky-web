import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const postToBluesky = internalAction({
    args: {
        handle: v.string(),
        appPassword: v.string(),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Create session
        const authRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identifier: args.handle,
                password: args.appPassword,
            }),
        });

        if (!authRes.ok) {
            throw new Error("Failed to authenticate with Bluesky");
        }

        const { accessJwt, did } = await authRes.json();

        // 2. Create record (post)
        const postRes = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessJwt}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                repo: did,
                collection: "app.bsky.feed.post",
                record: {
                    text: args.text,
                    createdAt: new Date().toISOString(),
                    $type: "app.bsky.feed.post",
                },
            }),
        });

        if (!postRes.ok) {
            const error = await postRes.json();
            throw new Error(`Failed to post to Bluesky: ${JSON.stringify(error)}`);
        }

        const data = await postRes.json();
        return data.uri;
    },
});
