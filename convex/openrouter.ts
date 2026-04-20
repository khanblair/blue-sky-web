import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const generatePost = internalAction({
    args: {
        topics: v.array(v.string()),
        subtopics: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        tone: v.string(),
        goal: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<string> => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

        const tagsInstruction = args.tags && args.tags.length > 0
            ? `Select 2-3 of the most relevant hashtags from this pool and append them to the end: ${args.tags.map(t => '#' + t.replace(/^#/, '')).join(" ")}`
            : "Do not use hashtags.";

        const prompt = `You are a social media expert specializing in Bluesky. 
Your goal is to write a high-engagement post about: ${args.topics.join(", ")}.
${args.subtopics && args.subtopics.length > 0 ? `Focus specifically on these sub-niches: ${args.subtopics.join(", ")}.` : ""}
${args.goal ? `The primary strategic objective is to ${args.goal} the audience.` : ""}

## CONSTRAINTS
- Total character count MUST be under 300 characters.
- Use a ${args.tone} tone.
- ${tagsInstruction}

## STRUCTURE REQUIREMENTS
1. THE HOOK: Start with a strong, scroll-stopping first line. Could be a bold claim, a relatable observation, or a surprising fact.
2. WHITE SPACE: Use double line breaks between the hook and the body to ensure high readability on mobile.
3. THE BODY: 1-2 short, punchy sentences that provide value or personality.
4. ENGAGEMENT LOOP: End with a curiosity-gap question or a call to interaction that feels natural, not forced.

## TONE GUIDANCE
- Avoid "corporate speak" or generic AI-sounding enthusiastic adjectives (e.g., "Transformative", "Exciting").
- Be human, opinionated, and authentic. 
- If the tone is 'Professional', be an insightful expert, not a LinkedIn bot.
- If the tone is 'Witty' or 'Casual', use conversational language and subtle humor.

Return ONLY the post content.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
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
        subtopics: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        tone: v.string(),
        goal: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<string> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.runAction(internal.openrouter.generatePost, args);
    },
});
