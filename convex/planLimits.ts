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
    },
    usdc_base: {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38",
        label: "USDC on Base",
        symbol: "USDC",
        network: "Base",
        contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
    eth: {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38",
        label: "Ethereum (ETH)",
        symbol: "ETH",
        network: "Ethereum Mainnet",
    },
    btc: {
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        label: "Bitcoin (BTC)",
        symbol: "BTC",
        network: "Bitcoin",
    },
} as const;