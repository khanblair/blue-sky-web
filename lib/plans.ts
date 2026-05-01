export type PlanId = "starter" | "lite" | "basic" | "pro" | "standard" | "enterprise";

export interface PlanLimit {
    postsPerMonth: number;
    aiGenerationsPerMonth: number;
    maxTopics: number;
    maxSubtopics: number;
    minGenerateIntervalHours: number;
    notifications: boolean;
    customModel: boolean;
    byok: boolean;
    branding: boolean;
    priceUsd: number;
    label: string;
    description: string;
    features: string[];
}

export const PLAN_LIMITS: Record<PlanId, PlanLimit> = {
    starter: {
        postsPerMonth: 5,
        aiGenerationsPerMonth: 10,
        maxTopics: 1,
        maxSubtopics: 2,
        minGenerateIntervalHours: 12,
        notifications: false,
        customModel: false,
        byok: false,
        branding: true,
        priceUsd: 0,
        label: "Starter",
        description: "Try it out — limited features, no cost",
        features: [
            "5 posts per month",
            "10 AI generations",
            "1 topic, 2 subtopics",
            "Default AI model only",
            "\"Powered by BlueSky AI\" watermark",
            "Community support",
        ],
    },
    lite: {
        postsPerMonth: 20,
        aiGenerationsPerMonth: 30,
        maxTopics: 2,
        maxSubtopics: 3,
        minGenerateIntervalHours: 8,
        notifications: false,
        customModel: false,
        byok: false,
        branding: true,
        priceUsd: 2,
        label: "Lite",
        description: "A step up from free — more posts, more generations",
        features: [
            "20 posts per month",
            "30 AI generations",
            "2 topics, 3 subtopics",
            "Default AI model only",
            "\"Powered by BlueSky AI\" watermark",
            "Email support",
        ],
    },
    basic: {
        postsPerMonth: 50,
        aiGenerationsPerMonth: 80,
        maxTopics: 5,
        maxSubtopics: 6,
        minGenerateIntervalHours: 4,
        notifications: false,
        customModel: false,
        byok: false,
        branding: false,
        priceUsd: 5,
        label: "Basic",
        description: "For casual creators getting started",
        features: [
            "50 posts per month",
            "80 AI generations",
            "5 topics, 6 subtopics",
            "Default AI model only",
            "No watermark",
            "Email support",
            "Post scheduling",
        ],
    },
    pro: {
        postsPerMonth: 150,
        aiGenerationsPerMonth: 300,
        maxTopics: 10,
        maxSubtopics: 15,
        minGenerateIntervalHours: 2,
        notifications: true,
        customModel: true,
        byok: true,
        branding: false,
        priceUsd: 10,
        label: "Pro",
        description: "For serious creators who post regularly",
        features: [
            "150 posts per month",
            "300 AI generations",
            "10 topics, 15 subtopics",
            "All AI models (OpenRouter catalog)",
            "Bring Your Own API Key",
            "Telegram & WhatsApp notifications",
            "No watermark",
            "Priority support",
        ],
    },
    standard: {
        postsPerMonth: 500,
        aiGenerationsPerMonth: 800,
        maxTopics: 25,
        maxSubtopics: 30,
        minGenerateIntervalHours: 1,
        notifications: true,
        customModel: true,
        byok: true,
        branding: false,
        priceUsd: 15,
        label: "Standard",
        description: "For power users managing multiple accounts",
        features: [
            "500 posts per month",
            "800 AI generations",
            "25 topics, 30 subtopics",
            "All AI models + direct provider access",
            "Bring Your Own API Key",
            "Telegram & WhatsApp notifications",
            "No watermark",
            "Priority support",
            "Advanced scheduling",
        ],
    },
    enterprise: {
        postsPerMonth: Infinity,
        aiGenerationsPerMonth: Infinity,
        maxTopics: Infinity,
        maxSubtopics: Infinity,
        minGenerateIntervalHours: 1,
        notifications: true,
        customModel: true,
        byok: true,
        branding: false,
        priceUsd: 20,
        label: "Enterprise",
        description: "Unlimited everything — for agencies and teams",
        features: [
            "Unlimited posts",
            "Unlimited AI generations",
            "Unlimited topics & subtopics",
            "All AI models + direct provider access",
            "Bring Your Own API Key",
            "Telegram & WhatsApp notifications",
            "No watermark",
            "Dedicated support",
            "Custom AI prompts",
            "API access",
            "Team management (coming soon)",
        ],
    },
};

export const PLAN_IDS: PlanId[] = ["starter", "lite", "basic", "pro", "standard", "enterprise"];

export const CRYPTO_WALLETS = {
    usdc_eth: {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38",
        label: "USDC on Ethereum",
        symbol: "USDC",
        network: "Ethereum Mainnet",
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        priceMap: { starter: 0, lite: 2, basic: 5, pro: 10, standard: 15, enterprise: 20 },
    },
    usdc_base: {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38",
        label: "USDC on Base",
        symbol: "USDC",
        network: "Base",
        contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        priceMap: { starter: 0, lite: 2, basic: 5, pro: 10, standard: 15, enterprise: 20 },
    },
    eth: {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38",
        label: "Ethereum (ETH)",
        symbol: "ETH",
        network: "Ethereum Mainnet",
        priceMap: { starter: 0, lite: "~0.001 ETH", basic: "~0.002 ETH", pro: "~0.004 ETH", standard: "~0.006 ETH", enterprise: "~0.008 ETH" },
    },
    btc: {
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        label: "Bitcoin (BTC)",
        symbol: "BTC",
        network: "Bitcoin",
        priceMap: { starter: 0, lite: "~0.00003 BTC", basic: "~0.00008 BTC", pro: "~0.00016 BTC", standard: "~0.00024 BTC", enterprise: "~0.00032 BTC" },
    },
} as const;

export const PROVIDER_INFO = [
    { id: "openrouter", name: "OpenRouter", models: ["google/gemini-2.5-flash-lite", "google/gemini-2.5-flash", "anthropic/claude-sonnet-4", "openai/gpt-4o", "openai/gpt-4o-mini", "meta-llama/llama-3.3-70b-instruct", "deepseek/deepseek-chat"] },
    { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"] },
    { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-haiku-4-20250414"] },
    { id: "google", name: "Google AI", models: ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"] },
] as const;