import { action, internalAction } from "./_generated/server";
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
                const error = await authResponse.json();
                throw new Error(error.message || "Bluesky authentication failed");
            }

            const authData = await authResponse.json();
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
                const error = await postResponse.json();
                throw new Error(error.message || "Failed to push post to Bluesky");
            }

            const postData = await postResponse.json();
            return postData.uri;
        } catch (error: any) {
            console.error("Bluesky post error:", error);
            throw new Error(error.message);
        }
    },
});

export const fetchCommentsForPost = internalAction({
    args: {
        handle: v.string(),
        appPassword: v.string(),
        postUri: v.string(),
    },
    handler: async (ctx, args): Promise<any[]> => {
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
                const error = await authResponse.json();
                throw new Error(error.message || "Bluesky authentication failed");
            }

            const authData = await authResponse.json();
            const accessJwt = authData.accessJwt;

            // 2. Get post thread with replies
            const threadResponse = await fetch(
                `https://bsky.social/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(args.postUri)}`,
                {
                    headers: { "Authorization": `Bearer ${accessJwt}` },
                }
            );

            if (!threadResponse.ok) {
                const error = await threadResponse.json();
                throw new Error(error.message || "Failed to fetch post thread");
            }

            const threadData = await threadResponse.json();

            if (threadData.thread?.$type === 'app.bsky.feed.defs#notFoundPost') {
                console.error("Post not found:", args.postUri);
                return [];
            }

            // 3. Extract comments from the thread
            const comments: any[] = [];

            function extractReplies(node: any) {
                if (!node || typeof node !== 'object') return;

                // node.replies is an array of ThreadViewPost or other union types
                if (Array.isArray(node.replies)) {
                    for (const reply of node.replies) {
                        // Check if it's a ThreadViewPost (most common)
                        if (reply.post && reply.post.record) {
                            comments.push({
                                uri: reply.post.uri,
                                cid: reply.post.cid,
                                author: {
                                    did: reply.post.author.did,
                                    handle: reply.post.author.handle,
                                    displayName: reply.post.author.displayName,
                                    avatar: reply.post.author.avatar,
                                },
                                content: reply.post.record.text || "",
                                createdAt: reply.post.record.createdAt || new Date().toISOString(),
                            });
                        }
                        // Recurse regardless of whether this specific node was a post
                        extractReplies(reply);
                    }
                }
            }

            extractReplies(threadData.thread);

            console.log(`Fetched ${comments.length} comments for ${args.postUri}`);
            return comments;
        } catch (error: any) {
            console.error("Bluesky fetch comments error:", error);
            throw new Error(error.message);
        }
    },
});
