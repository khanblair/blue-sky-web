import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const generatePost = internalAction({
    args: {
        topics: v.array(v.string()),
        tone: v.string(),
    },
    handler: async (ctx, args): Promise<string> => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

        const prompt = `Write a short, engaging Bluesky post about ${args.topics.join(", ")}. 
    The tone should be ${args.tone}. 
    Keep it under 300 characters. 
    Do not use hashtags.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo", // or a cheaper model like "mistralai/mistral-7b-instruct"
                messages: [{ role: "user", content: prompt }],
            }),
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    },
});

export const generatePostPublic = action({
    args: {
        topics: v.array(v.string()),
        tone: v.string(),
    },
    handler: async (ctx, args): Promise<string> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.runAction(internal.openrouter.generatePost, args);
    },
});
