export type BlogPost = {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    category: string;
    featured: boolean;
    content: string;
};

export const blogPosts: BlogPost[] = [
    {
        slug: "introducing-bluesky-ai",
        title: "Introducing BlueSky AI: Your Bluesky Presence on Autopilot",
        excerpt:
            "We're excited to announce the launch of BlueSky AI — a fully automated posting platform for Bluesky that uses AI to generate, schedule, and publish content while you focus on what matters.",
        date: "Jan 15, 2026",
        readTime: "5 min read",
        category: "Announcement",
        featured: true,
        content: `Today we're thrilled to launch **BlueSky AI** — the first fully autonomous posting platform built exclusively for Bluesky.

## The Problem We're Solving

Building a social media presence takes time. A *lot* of time. Between brainstorming ideas, writing posts, scheduling them at the right times, engaging with your audience, and analyzing performance — it's practically a full-time job. And for most creators, that's time they simply don't have.

We built BlueSky AI to solve this. Not with another scheduling tool that still requires you to write everything yourself, but with a genuinely autonomous AI system that handles the entire content lifecycle.

## How It Works

BlueSky AI connects to your Bluesky account and takes over the heavy lifting:

- **Topic Configuration** — You tell us what you care about (tech, philosophy, crypto, cooking — anything). Our AI uses those topics as a strategic foundation.
- **AI Content Generation** — Using state-of-the-art language models, we generate posts tailored to your tone, audience, and goals. Every post is unique and designed to engage.
- **Smart Scheduling** — Posts are automatically scheduled at optimal intervals based on your plan tier, ensuring consistent activity without overwhelming your followers.
- **One-Click Publishing** — Hit "Post Now" or let automation handle it. Your content goes live on Bluesky instantly.

## What Makes Us Different

Unlike generic AI writing tools, BlueSky AI is purpose-built for Bluesky. We've fine-tuned our prompts to match the platform's culture — conversational, authentic, and genuinely engaging.

We also support multiple AI providers (OpenRouter, OpenAI, Anthropic, Google, and DeepSeek), so you can choose the model that best fits your voice.

## Get Started

Signing up takes less than 2 minutes. Connect your Bluesky account, set your topics, and let the AI do the rest. The Starter plan is completely free — forever.

[Get started now →](/sign-up)`,
    },
    {
        slug: "crypto-payments-social-media",
        title: "Why We Chose Crypto Payments for Social Media Automation",
        excerpt:
            "Traditional payment processors add friction, fees, and privacy concerns. Here's why we built BlueSky AI with USDC, ETH, and BTC as our primary payment methods — and how it benefits you.",
        date: "Jan 20, 2026",
        readTime: "7 min read",
        category: "Engineering",
        featured: false,
        content: `When we started building BlueSky AI, one of the first architectural decisions we faced was: **how do we accept payments?**

Most SaaS products default to Stripe. It's easy, well-documented, and handles subscriptions. But for a product built around a *decentralized* social protocol, going with a centralized payment processor felt off. So we went with crypto.

## The Case for Crypto Payments

### 1. Privacy First
Traditional payment processors require full identity verification — name, address, card number, billing history. With crypto payments, you interact with a wallet address. No personal data shared, no identity documents uploaded.

### 2. Lower Fees
Stripe charges 2.9% + $0.30 per transaction. For a $5/month plan, that's nearly 10% gone to processing. With USDC on Base or Ethereum, gas fees are often less than $0.01 per transaction.

### 3. Global Access
Not everyone has access to a credit card. But anyone with a phone and internet can set up a crypto wallet. This opens BlueSky AI to creators in regions where traditional payment infrastructure is limited.

### 4. Alignment with Bluesky's Values
Bluesky is built on the AT Protocol — a decentralized, open standard. Accepting decentralized payments isn't just practical, it's philosophically aligned with the platform we're building on.

## What We Accept

We currently support four payment methods:

- **USDC on Ethereum** — Stable, 1:1 with USD
- **USDC on Base** — Lower fees, faster confirmations
- **ETH** — For those who prefer paying in ETH
- **BTC** — Bitcoin via the Lightning-adjacent address

Each plan tier has a fixed USD price, and we provide equivalent crypto amounts for ETH and BTC to keep things simple.

## How It Works

When you select a plan, we display the exact wallet address and amount. Send the payment, submit your transaction hash, and our system verifies it on-chain. No intermediaries, no waiting for bank approvals.

We believe this is the future of online payments — and we're building it into everything we do.`,
    },
    {
        slug: "ai-posting-best-practices",
        title: "AI-Generated Posts That Actually Sound Human: Our Approach",
        excerpt:
            "Most AI-generated social content sounds robotic. We spent months refining our prompt engineering, tone calibration, and model selection to create posts that genuinely engage audiences.",
        date: "Jan 25, 2026",
        readTime: "8 min read",
        category: "Tutorial",
        featured: false,
        content: `Let's be honest: most AI-generated social media posts are obvious. They're over-enthusiastic, use words like "exciting" and "transformative," and feel like they were written by a corporate press release generator.

We didn't want that. So we spent months iterating on our prompt engineering, tone calibration, and content structure to build something better.

## The Problem with Default AI Output

When you ask a language model to "write a social media post," you get the training data average. And the average social media post in most AI training sets is... not great. It's LinkedIn-flavored, engagement-bait-heavy, and instantly recognizable as AI.

## Our Approach

### Structured Prompts, Not Free-Form

We don't just say "write a post." Every generation goes through a multi-layer prompt that specifies:

1. **The Hook** — A scroll-stopping first line (bold claim, relatable observation, or surprising fact)
2. **White Space** — Double line breaks for mobile readability
3. **The Body** — 2-4 sentences with real value, insight, or personality
4. **Engagement Loop** — A natural question or conversation prompt at the end

### Tone Calibration

Users choose from tones like "Professional," "Witty," "Casual," and "Conversational." But we don't just pass the tone name — we include specific guidance:

- Professional → "Be an insightful expert, not a LinkedIn bot"
- Witty → "Use subtle humor, never puns or forced jokes"
- Casual → "Write like you're texting a smart friend"

### Anti-AI Patterns

Our prompts explicitly avoid common AI tells:
- No "Exciting," "Transformative," "Revolutionary," or "Game-changing"
- No "In today's world" or "In an era where"
- No numbered lists with generic advice
- No "Let's dive in" or "Here's the thing"

## Character Count Matters

Bluesky displays posts differently depending on length. We target ~300 characters precisely — long enough to provide value, short enough to avoid truncation. This wasn't a guess; we tested across hundreds of posts.

## Hashtag Strategy

Rather than spamming hashtags, our AI selects 2-3 from your configured tag pool based on relevance to the specific post content. This feels organic rather than forced.

## Try It Yourself

The best way to see the difference is to try it. Sign up for a free Starter account, set your topics and tone, and generate a post. We think you'll be surprised at how human it sounds.`,
    },
    {
        slug: "bluesky-at-protocol-deep-dive",
        title: "Understanding the Bluesky AT Protocol for Developers",
        excerpt:
            "The AT Protocol is the backbone of Bluesky's decentralized architecture. Here's how we integrated it into BlueSky AI to enable secure, reliable posting automation.",
        date: "Feb 1, 2026",
        readTime: "10 min read",
        category: "Engineering",
        featured: false,
        content: `Bluesky isn't just another social media app — it's built on the **AT Protocol**, a decentralized social networking protocol that fundamentally changes how applications interact with social data.

If you're building tools for Bluesky (like we are), understanding the AT Protocol is essential. Here's what we've learned integrating with it.

## What is the AT Protocol?

The Authenticated Transfer Protocol (AT Protocol) is an open, decentralized protocol for social networking. Key concepts:

- **Decentralized Identifiers (DIDs)** — Users have persistent identities that aren't tied to a single server
- **Personal Data Servers (PDS)** — Users' data lives on their own server, not a centralized platform
- **Repositories** — Each user has a Merkle Search Tree (MST) data repository that stores their content
- **Lexicons** — Typed API schemas that define how apps communicate

## How Posting Works

Posting on the AT Protocol involves creating a record in the user's repository:

1. **Authenticate** — Create a session using the user's handle and app password
2. **Create Record** — POST to \`com.atproto.repo.createRecord\` with the post content
3. **Receive URI** — The response includes an \`at://\` URI that uniquely identifies the post

The record structure looks like:
\`\`\`
{
  repo: userDid,
  collection: "app.bsky.feed.post",
  record: {
    text: "Hello world!",
    createdAt: new Date().toISOString(),
    // Optional: reply refs, embeds, facets
  }
}
\`\`\`

## Reply Threading

Replies require referencing both the root post and the parent:

\`\`\`
{
  reply: {
    root: { uri, cid },
    parent: { uri, cid }
  }
}
\`\`\`

The CID (Content Identifier) is critical — it's a cryptographic hash of the record content, ensuring integrity in the decentralized network.

## Likes and Interactions

Liking a post is another record creation:
\`\`\`
{
  collection: "app.bsky.feed.like",
  record: {
    subject: { uri, cid },
    createdAt: new Date().toISOString()
  }
}
\`\`\`

## Security Model

The AT Protocol uses app-specific passwords — not your main account password. This means:

- Users can revoke app access without changing their password
- Each app gets isolated credentials
- No OAuth complexity — just a simple password string

We store these credentials encrypted at rest and never transmit them over unsecured networks.

## Building on AT Protocol

If you're interested in building for Bluesky, start with the official AT Protocol documentation. The API is well-documented and surprisingly straightforward to work with.

We're excited to see what the developer community builds on top of this protocol.`,
    },
    {
        slug: "multi-provider-ai-strategy",
        title: "Why Multi-Provider AI is the Future of Content Generation",
        excerpt:
            "Relying on a single AI provider limits your options. We support OpenRouter, OpenAI, Anthropic, and Google — giving you the flexibility to choose the best model for each task.",
        date: "Feb 10, 2026",
        readTime: "6 min read",
        category: "Product",
        featured: false,
        content: `When we architected BlueSky AI, we made a deliberate choice: **never depend on a single AI provider.**

Here's why — and how our multi-provider approach gives you an unfair advantage.

## The Single-Provider Trap

Most AI products pick one provider and build everything around it. When that provider has an outage, raises prices, or deprecates a model, every user is affected. We've seen this happen repeatedly across the industry.

## Our Provider Architecture

We built an abstraction layer — a **Provider Registry** — that normalizes the API interface across multiple providers:

- **OpenRouter** — Access to 100+ models through a single API
- **OpenAI** — Direct access to GPT-4o, GPT-4o-mini, and more
- **Anthropic** — Claude Sonnet and Haiku for nuanced content
- **Google AI** — Gemini models for fast, cost-effective generation
- **DeepSeek** — Our default provider, excellent for social content

Each provider has the same interface: authenticate, build the request, parse the response. Switching providers is a single config change.

## BYOK: Bring Your Own Key

For Pro plan and above, you can use your own API keys with any supported provider. This means:

- **Lower costs** — Use your existing provider credits or negotiated rates
- **More models** — Access models not included in our default set
- **Full control** — You manage your own usage and billing directly

## Smart Defaults

New users start with DeepSeek as the default provider — it's fast, affordable, and produces excellent social content. As your needs grow, you can switch to any provider in settings.

## Reliability Through Redundancy

If one provider goes down, our system can fall back to alternatives. This means your automated posting never stops because of a single provider's outage.

We believe choice and flexibility are fundamental to a good product. Multi-provider AI isn't a feature — it's a principle.`,
    },
    {
        slug: "pricing-tiers-explained",
        title: "BlueSky AI Pricing Tiers Explained: Which Plan is Right for You?",
        excerpt:
            "From free Starter to unlimited Enterprise, our 6-tier pricing structure is designed to scale with your needs. Here's a breakdown of what each tier offers and how to choose.",
        date: "Feb 15, 2026",
        readTime: "4 min read",
        category: "Product",
        featured: false,
        content: `We designed our pricing to be simple, transparent, and fair. Every plan includes the core AI posting experience — the difference is in scale and advanced features.

## The Six Tiers

### Starter — Free
For trying things out. You get 5 posts/month, 10 AI generations, 1 topic, and the default AI model. Includes our "Powered by BlueSky AI" watermark. No credit card needed.

### Lite — $2/month
A step up from free. 20 posts, 30 AI generations, 2 topics, and **auto-reply** to comments (5/month). Great for individual creators just getting started.

### Basic — $5/month
For casual creators. 50 posts, 80 AI generations, 5 topics, **reciprocal engagement** (10/month), auto-reply (20/month), and no watermark. Post scheduling included.

### Pro — $10/month
For serious creators. 150 posts, 300 AI generations, 10 topics, all AI models, BYOK, notifications, 100 auto-replies, and 50 reciprocal engagements. This is where the platform really shines.

### Standard — $15/month
For power users and small teams. 500 posts, 800 AI generations, 25 topics, direct provider access, 300 auto-replies, 150 reciprocal engagements, and advanced scheduling.

### Enterprise — $20/month
Unlimited everything. No caps on posts, generations, topics, or engagement. Dedicated support, custom AI prompts, and API access. For agencies and teams running at scale.

## How to Choose

Ask yourself three questions:

1. **How often do you want to post?** If it's more than a few times a week, you'll outgrow Starter quickly.
2. **Do you want AI to engage with your audience?** Auto-reply starts at Lite, reciprocal engagement at Basic.
3. **Do you need a specific AI model?** Custom model selection starts at Pro.

Most creators find that **Basic** or **Pro** hits the sweet spot. And you can upgrade anytime — your settings and history carry over.

## Payment

We accept USDC (Ethereum & Base), ETH, and BTC. No credit card required. Send crypto to the displayed wallet address, submit your transaction hash, and you're set.

[View all plans →](/pricing)`,
    },
];
