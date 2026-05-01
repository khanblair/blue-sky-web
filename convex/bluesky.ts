import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

interface BlueskyAuthResponse {
    accessJwt: string;
    did: string;
    handle: string;
}

interface BlueskyProfileResponse {
    displayName?: string;
    avatar?: string;
    description?: string;
}

interface BlueskyComment {
    uri: string;
    cid: string;
    author: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
    };
    content: string;
    createdAt: string;
}

export const syncProfile = action({
    args: {},
    handler: async (ctx): Promise<{ success: boolean; displayName?: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user || !user.handle || !user.appPassword) {
            throw new Error("Bluesky credentials missing");
        }

        try {
            // 1. Authenticate with BlueSky
            const authResponse = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: user.handle,
                    password: user.appPassword,
                }),
            });

            if (!authResponse.ok) {
                const error = (await authResponse.json()) as { message?: string };
                throw new Error(error.message || "Bluesky authentication failed");
            }

            const authData = (await authResponse.json()) as BlueskyAuthResponse;
            const accessJwt = authData.accessJwt;
            const did = authData.did;

            // 2. Fetch Profile
            const profileResponse = await fetch(`https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${did}`, {
                headers: { "Authorization": `Bearer ${accessJwt}` },
            });

            if (!profileResponse.ok) {
                throw new Error("Failed to fetch Bluesky profile");
            }

            const profileData = (await profileResponse.json()) as BlueskyProfileResponse;

            // 3. Update User Record
            await ctx.runMutation(api.users.updateProfile, {
                displayName: profileData.displayName,
                avatar: profileData.avatar,
                description: profileData.description,
            });

            return { success: true, displayName: profileData.displayName };
        } catch (error: unknown) {
            console.error("Profile sync error:", error);
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    },
});

export const postToBluesky = internalAction({
    args: {
        handle: v.string(),
        appPassword: v.string(),
        text: v.string(),
    },
    handler: async (ctx, args): Promise<string> => {
        try {
            // 1. Authenticate
            const authResponse = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: args.handle,
                    password: args.appPassword,
                }),
            });

            if (!authResponse.ok) {
                const error = (await authResponse.json()) as { message?: string };
                throw new Error(error.message || "Bluesky authentication failed");
            }

            const authData = (await authResponse.json()) as BlueskyAuthResponse;
            const accessJwt = authData.accessJwt;

            // 2. Post
            const postResponse = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessJwt}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    repo: authData.did,
                    collection: "app.bsky.feed.post",
                    record: {
                        $type: "app.bsky.feed.post",
                        text: args.text,
                        createdAt: new Date().toISOString(),
                    },
                }),
            });

            if (!postResponse.ok) {
                const error = (await postResponse.json()) as { message?: string };
                throw new Error(error.message || "Failed to push post to Bluesky");
            }

            const postData = (await postResponse.json()) as { uri: string };
            return postData.uri;
        } catch (error: unknown) {
            console.error("Bluesky post error:", error);
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    },
});

export const fetchCommentsForPost = internalAction({
    args: {
        handle: v.string(),
        appPassword: v.string(),
        postUri: v.string(),
    },
    handler: async (ctx, args): Promise<BlueskyComment[]> => {
        try {
            // 1. Authenticate
            const authResponse = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: args.handle,
                    password: args.appPassword,
                }),
            });

            if (!authResponse.ok) {
                const error = (await authResponse.json()) as { message?: string };
                throw new Error(error.message || "Bluesky authentication failed");
            }

            const authData = (await authResponse.json()) as BlueskyAuthResponse;
            const accessJwt = authData.accessJwt;

            // 2. Get post thread with replies
            const threadResponse = await fetch(
                `https://bsky.social/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(args.postUri)}`,
                {
                    headers: { "Authorization": `Bearer ${accessJwt}` },
                }
            );

            if (!threadResponse.ok) {
                const error = (await threadResponse.json()) as { message?: string };
                throw new Error(error.message || "Failed to fetch post thread");
            }

            const threadData = (await threadResponse.json()) as { thread?: { $type: string; replies?: unknown[] } };

            if (threadData.thread?.$type === 'app.bsky.feed.defs#notFoundPost') {
                console.error("Post not found:", args.postUri);
                return [];
            }

            // 3. Extract comments from the thread
            const comments: BlueskyComment[] = [];

            function extractReplies(node: unknown) {
                if (!node || typeof node !== 'object') return;
                const n = node as { replies?: unknown[] };

                if (Array.isArray(n.replies)) {
                    for (const reply of n.replies) {
                        const r = reply as {
                            post?: {
                                uri: string;
                                cid: string;
                                author: {
                                    did: string;
                                    handle: string;
                                    displayName?: string;
                                    avatar?: string;
                                };
                                record?: { text?: string; createdAt?: string };
                            };
                        };
                        if (r.post && r.post.record) {
                            comments.push({
                                uri: r.post.uri,
                                cid: r.post.cid,
                                author: {
                                    did: r.post.author.did,
                                    handle: r.post.author.handle,
                                    displayName: r.post.author.displayName,
                                    avatar: r.post.author.avatar,
                                },
                                content: r.post.record.text || "",
                                createdAt: r.post.record.createdAt || new Date().toISOString(),
                            });
                        }
                        extractReplies(reply);
                    }
                }
            }

            extractReplies(threadData.thread);

            console.log(`Fetched ${comments.length} comments for ${args.postUri}`);
            return comments;
        } catch (error: unknown) {
            console.error("Bluesky fetch comments error:", error);
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(message);
        }
    },
});
