import { action, internalAction, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const PROVIDER_REGISTRY: Record<string, {
    name: string;
    baseUrl: string;
    models: string[];
    authHeader: (key: string) => Record<string, string>;
    bodyTransform: (model: string, messages: any[], options?: any) => any;
    responseParse: (data: any) => string;
}> = {
    openrouter: {
        name: "OpenRouter",
        baseUrl: "https://openrouter.ai/api/v1/chat/completions",
        models: [
            "google/gemini-2.5-flash-lite",
            "google/gemini-2.5-flash",
            "anthropic/claude-sonnet-4",
            "openai/gpt-4o",
            "openai/gpt-4o-mini",
            "meta-llama/llama-3.3-70b-instruct",
            "deepseek/deepseek-chat",
        ],
        authHeader: (key) => ({
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
        }),
        bodyTransform: (model, messages, options) => ({
            model,
            messages,
            temperature: options?.temperature ?? 0.85,
            max_tokens: options?.maxTokens ?? 512,
        }),
        responseParse: (data) => data.choices?.[0]?.message?.content?.trim() ?? "",
    },
    openai: {
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1/chat/completions",
        models: [
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-3.5-turbo",
        ],
        authHeader: (key) => ({
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
        }),
        bodyTransform: (model, messages, options) => ({
            model,
            messages,
            temperature: options?.temperature ?? 0.85,
            max_tokens: options?.maxTokens ?? 512,
        }),
        responseParse: (data) => data.choices?.[0]?.message?.content?.trim() ?? "",
    },
    anthropic: {
        name: "Anthropic",
        baseUrl: "https://api.anthropic.com/v1/messages",
        models: [
            "claude-sonnet-4-20250514",
            "claude-haiku-4-20250414",
        ],
        authHeader: (key) => ({
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }),
        bodyTransform: (model, messages, options) => ({
            model,
            max_tokens: options?.maxTokens ?? 512,
            messages,
        }),
        responseParse: (data) => data.content?.[0]?.text?.trim() ?? "",
    },
    google: {
        name: "Google AI",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        models: [
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
        ],
        authHeader: (key) => ({
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
        }),
        bodyTransform: (model, messages, options) => ({
            model,
            messages,
            temperature: options?.temperature ?? 0.85,
            max_tokens: options?.maxTokens ?? 512,
        }),
        responseParse: (data) => data.choices?.[0]?.message?.content?.trim() ?? "",
    },
};

export const DEFAULT_PROVIDER = "openrouter";
export const DEFAULT_MODEL = "google/gemini-2.5-flash-lite";

async function resolveAiConfig(
    ctx: any,
    userId: any
): Promise<{ provider: string; model: string; apiKey: string; temperature?: number; maxTokens?: number }> {
    const config = await ctx.db
        .query("aiProviderConfigs")
        .withIndex("by_userId_active", (q: any) => q.eq("userId", userId).eq("isActive", true))
        .first();

    if (config && config.apiKey) {
        return {
            provider: config.provider,
            model: config.model,
            apiKey: config.apiKey,
            temperature: config.temperature ?? undefined,
            maxTokens: config.maxTokens ?? undefined,
        };
    }

    return {
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
        apiKey: process.env.OPENROUTER_API_KEY ?? "",
    };
}

export const generatePost = internalAction({
    args: {
        topics: v.array(v.string()),
        subtopics: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        tone: v.string(),
        goal: v.optional(v.string()),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args): Promise<string> => {
        const { provider, model, apiKey, temperature, maxTokens } = args.userId
            ? await resolveAiConfig(ctx, args.userId)
            : { provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL, apiKey: process.env.OPENROUTER_API_KEY ?? "", temperature: undefined, maxTokens: undefined };

        if (!apiKey) throw new Error(`No API key available for provider: ${provider}`);

        const providerConfig = PROVIDER_REGISTRY[provider];
        if (!providerConfig) throw new Error(`Unknown AI provider: ${provider}`);

        const tagsInstruction = args.tags && args.tags.length > 0
            ? `Select 2-3 of the most relevant hashtags from this pool and append them to the end: ${args.tags.map(t => '#' + t.replace(/^#/, '')).join(" ")}`
            : "Do not use hashtags.";

        const prompt = `You are a social media expert specializing in Bluesky. 
Your goal is to write a high-engagement post about: ${args.topics.join(", ")}.
${args.subtopics && args.subtopics.length > 0 ? `Focus specifically on these sub-niches: ${args.subtopics.join(", ")}.` : ""}
${args.goal ? `The primary strategic objective is to ${args.goal} the audience.` : ""}

## CONSTRAINTS
- Total character count MUST be at least 300 characters and at most 300 characters. Aim for exactly 300 characters. This is critical — Bluesky displays posts poorly if they are too short, and cuts them off if they are too long. Hit ~300 characters precisely.
- Use a ${args.tone} tone.
- ${tagsInstruction}

## STRUCTURE REQUIREMENTS
1. THE HOOK: Start with a strong, scroll-stopping first line. Could be a bold claim, a relatable observation, or a surprising fact.
2. WHITE SPACE: Use double line breaks between the hook and the body to ensure high readability on mobile.
3. THE BODY: 2-4 sentences that provide real value, insight, or personality. Elaborate enough to reach the 300-character minimum.
4. ENGAGEMENT LOOP: End with a curiosity-gap question or a call to interaction that feels natural, not forced.

## TONE GUIDANCE
- Avoid "corporate speak" or generic AI-sounding enthusiastic adjectives (e.g., "Transformative", "Exciting").
- Be human, opinionated, and authentic. 
- If the tone is 'Professional', be an insightful expert, not a LinkedIn bot.
- If the tone is 'Witty' or 'Casual', use conversational language and subtle humor.

Return ONLY the post content.`;

        const headers: Record<string, string> = {
            ...providerConfig.authHeader(apiKey),
        };

        const body = providerConfig.bodyTransform(
            model,
            [{ role: "user", content: prompt }],
            { temperature, maxTokens }
        );

        let response: Response;
        if (provider === "anthropic") {
            response = await fetch(providerConfig.baseUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
        } else {
            response = await fetch(providerConfig.baseUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${providerConfig.name} API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const content = providerConfig.responseParse(data);

        if (!content) {
            throw new Error(`No content returned from ${providerConfig.name} (${model})`);
        }

        return content;
    },
});

export const generatePostPublic = action({
    args: {
        topics: v.array(v.string()),
        subtopics: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        tone: v.string(),
        goal: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<string> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.runQuery(api.users.getCurrentUser);
        if (!user) throw new Error("User record not found");

        return await ctx.runAction(internal.aiGeneration.generatePost, {
            ...args,
            userId: user._id,
        });
    },
});

import { api } from "./_generated/api";

export const getProviderConfigs = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const configs = await ctx.db
            .query("aiProviderConfigs")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        return configs.map(c => ({
            _id: c._id,
            provider: c.provider,
            model: c.model,
            isActive: c.isActive,
            temperature: c.temperature,
            maxTokens: c.maxTokens,
            hasApiKey: !!c.apiKey,
            createdAt: c.createdAt,
        }));
    },
});

export const saveProviderConfig = mutation({
    args: {
        provider: v.string(),
        model: v.string(),
        apiKey: v.optional(v.string()),
        temperature: v.optional(v.number()),
        maxTokens: v.optional(v.number()),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const PROVIDER_REGISTRY_MODELS: Record<string, string[]> = {
            openrouter: ["google/gemini-2.5-flash-lite", "google/gemini-2.5-flash", "anthropic/claude-sonnet-4", "openai/gpt-4o", "openai/gpt-4o-mini", "meta-llama/llama-3.3-70b-instruct", "deepseek/deepseek-chat"],
            openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
            anthropic: ["claude-sonnet-4-20250514", "claude-haiku-4-20250414"],
            google: ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"],
        };

        const models = PROVIDER_REGISTRY_MODELS[args.provider];
        if (!models) throw new Error(`Unknown provider: ${args.provider}`);
        if (!models.includes(args.model)) throw new Error(`Model ${args.model} is not available for provider ${args.provider}`);

        const existing = await ctx.db
            .query("aiProviderConfigs")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        if (args.isActive) {
            for (const config of existing) {
                if (config.isActive) {
                    await ctx.db.patch(config._id, { isActive: false, updatedAt: Date.now() });
                }
            }
        }

        if (args.isActive && !args.apiKey && args.provider !== "openrouter") {
            const existingWithKey = existing.find(c => c.provider === args.provider && c.apiKey);
            if (!existingWithKey) {
                throw new Error("API key is required when activating a custom provider configuration");
            }
        }

        const now = Date.now();
        const existingConfig = existing.find(c => c.provider === args.provider && c.model === args.model);

        if (existingConfig) {
            await ctx.db.patch(existingConfig._id, {
                isActive: args.isActive,
                apiKey: args.apiKey ?? existingConfig.apiKey,
                temperature: args.temperature ?? existingConfig.temperature,
                maxTokens: args.maxTokens ?? existingConfig.maxTokens,
                updatedAt: now,
            });
            return existingConfig._id;
        }

        return await ctx.db.insert("aiProviderConfigs", {
            userId: user._id,
            provider: args.provider,
            model: args.model,
            apiKey: args.apiKey,
            temperature: args.temperature,
            maxTokens: args.maxTokens,
            isActive: args.isActive,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const deleteProviderConfig = mutation({
    args: { configId: v.id("aiProviderConfigs") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const config = await ctx.db.get(args.configId);
        if (!config) throw new Error("Configuration not found");

        await ctx.db.delete(args.configId);
        return true;
    },
});