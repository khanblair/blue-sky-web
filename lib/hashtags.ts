export const HASHTAG_DATABASE: Record<string, Record<string, string[]>> = {
    technology: {
        'AI & Machine Learning': ['AI', 'ML', 'LLM', 'ArtificialIntelligence', 'MachineLearning', 'GenAI'],
        'Web Development': ['WebDev', 'JavaScript', 'React', 'TypeScript', 'NextJS', 'Programming'],
        'Mobile Apps': ['MobileDev', 'iOS', 'Android', 'AppDevelopment', 'ReactNative'],
        'Cybersecurity': ['Cybersecurity', 'Privacy', 'InfoSec', 'TechSafety'],
        'Cloud Computing': ['Cloud', 'AWS', 'Serverless', 'DevOps', 'Azure'],
        'Blockchain': ['Web3', 'Blockchain', 'Crypto', 'DeFi'],
        'SaaS & Startups': ['SaaS', 'BuildInPublic', 'Startups', 'Solopreneur'],
    },
    health: {
        'Nutrition': ['Nutrition', 'HealthyEating', 'CleanEating', 'FuelYourBody'],
        'Mental Health': ['MentalHealth', 'Wellness', 'Mindfulness', 'SelfCare'],
        'Longevity': ['Longevity', 'HealthyAging', 'Wellness', 'Science'],
        'Biohacking': ['Biohacking', 'Optimized', 'SelfExperimentation', 'Performance'],
        'Sleep Optimization': ['Sleep', 'Recovery', 'Biohacking', 'Rest'],
        'Holistic Medicine': ['Holistic', 'NaturalHealth', 'IntegrativeHealth'],
    },
    finance: {
        'Investing': ['Investing', 'Stocks', 'MarketInsights', 'Wealth'],
        'Crypto': ['Crypto', 'Bitcoin', 'Ethereum', 'Altcoins'],
        'Budgeting': ['Budgeting', 'Frugal', 'FinanceTips', 'Savings'],
        'Real Estate': ['RealEstate', 'Property', 'Investing', 'PassiveIncome'],
        'Economic Trends': ['Economics', 'FinanceNews', 'MarketTrends'],
        'Financial Freedom': ['FIRE', 'FinancialFreedom', 'WealthBuilding'],
    },
    travel: {
        'Digital Nomadism': ['DigitalNomad', 'RemoteWork', 'NomadLife', 'Travel'],
        'Adventure Travel': ['Adventure', 'Explore', 'Hiking', 'Nature'],
        'Luxury Travel': ['LuxuryTravel', 'HotelLife', 'Vacation'],
        'Budget Travel': ['Backpacking', 'CheapTravel', 'TravelHacks'],
        'Hidden Gems': ['OffTheBeatenPath', 'ExploreMore', 'TravelSecrets'],
        'Travel Gear': ['Packing', 'TravelTech', 'Gear'],
    },
    food: {
        'Cooking Tips': ['ChefLife', 'Cooking', 'KitchenHacks', 'Recipe'],
        'Restaurant Reviews': ['Foodie', 'EatLocal', 'Restaurant', 'Dining'],
        'Vegan / Plant-Based': ['Vegan', 'PlantBased', 'VeganLife', 'Healthy'],
        'Coffee Culture': ['Coffee', 'Barista', 'Espresso', 'CoffeeLover'],
        'Wine & Spirits': ['WineTime', 'Cocktails', 'Sommelier', 'Tasting'],
        'Food Tech': ['FoodTech', 'AgTech', 'Innovation'],
    },
    fashion: {
        'Sustainable Fashion': ['EcoFashion', 'Sustainable', 'SlowFashion'],
        'Streetwear': ['Streetwear', 'Sneakerhead', 'Style', 'Fashion'],
        'Minimalist Wardrobe': ['Minimalist', 'CapsuleWardrobe', 'Essentails'],
        'Luxury Brands': ['Luxury', 'Couture', 'FashionStyle'],
        'Style Tips': ['OutfitInspiration', 'StyleGuide', 'FashionTips'],
        'Watches & Accessories': ['Watches', 'Accessories', 'Detail'],
    },
    fitness: {
        'Bodybuilding': ['Fitness', 'Gym', 'Bodybuilding', 'Gains'],
        'HIIT': ['HIIT', 'Cardio', 'Workout', 'Training'],
        'Yoga': ['Yoga', 'Flexibility', 'Zen', 'Namaste'],
        'Endurance Running': ['Running', 'Marathon', 'Endurance', 'Runner'],
        'Martial Arts': ['MMA', 'BJJ', 'Karate', 'Fighting'],
        'Sports Science': ['Recovery', 'Performance', 'Science'],
    },
    education: {
        'Online Learning': ['EdTech', 'OnlineCourse', 'Learning', 'Skills'],
        'Self Improvement': ['Growth', 'Mindset', 'PersonalDevelopment'],
        'Language Learning': ['Polyglot', 'Languages', 'Learning'],
        'History': ['History', 'Education', 'Knowledge'],
        'Skill Acquisition': ['Learning', 'Growth', 'HackingSkills'],
        'Academic Research': ['Science', 'Research', 'Academic'],
    },
    entertainment: {
        'Movies & TV': ['Movies', 'Cinema', 'TVShow', 'BingeWatch'],
        'Gaming': ['Gaming', 'Gamer', 'Esports', 'Twitch'],
        'Music Production': ['Producer', 'Music', 'Studio', 'Creation'],
        'Streaming Culture': ['Streaming', 'Twitch', 'ContentCreator'],
        'Anime': ['Anime', 'Manga', 'Otaku'],
        'Pop Culture': ['PopCulture', 'Trends', 'Fandom'],
    },
    business: {
        'Sales & Marketing': ['Marketing', 'Sales', 'Growth', 'Branding'],
        'Entrepreneurship': ['Entrepreneur', 'Startups', 'Founder', 'Business'],
        'Leadership': ['Leadership', 'Management', 'Excellence'],
        'Product Management': ['Product', 'PM', 'Tech'],
        'Freelancing': ['Freelance', 'SideHustle', 'WorkFromHome'],
        'Remote Work': ['RemoteWork', 'WFH', 'FutureOfWork'],
    },
    politics: {
        'Global Affairs': ['WorldNews', 'Diplomacy', 'GlobalTrends'],
        'Social Issues': ['Activism', 'Change', 'Society'],
        'Philosophy': ['Philosophy', 'Wisdom', 'DeepThoughts'],
        'Current Events': ['News', 'Politics', 'DailyUpdate'],
        'Economics': ['ECON', 'GlobalEconomy', 'Finance'],
        'Sustainability': ['Green', 'Climate', 'Sustainability'],
    },
    science: {
        'Space Exploration': ['Space', 'NASA', 'Astronomy', 'Universe'],
        'Physics': ['Physics', 'Science', 'Discovery'],
        'Environment / Green Tech': ['EcoFriendly', 'CleanEnergy', 'Nature'],
        'Biology': ['Biology', 'Nature', 'LifeScience'],
        'Psychology': ['Psychology', 'Mind', 'Behavior'],
        'Futurism': ['Future', 'Innovation', 'Tech'],
    },
};

/**
 * Scoring logic to select the best hashtags for a given text.
 */
export const selectBestHashtags = (
    niche: string,
    subcategory: string,
    text: string,
    limit: number = 2
): string[] => {
    const nicheData = HASHTAG_DATABASE[niche];
    if (!nicheData) return [];

    const availableHashtags = nicheData[subcategory] || [];
    if (availableHashtags.length === 0) return [];

    const textLower = text.toLowerCase();
    const scored = availableHashtags.map(tag => {
        const tagLower = tag.toLowerCase();
        // Point for exact word match
        const score = textLower.includes(tagLower) ? 2 : 1;
        return { tag: '#' + tag, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.tag);
};

export const addHashtagsToPost = (
    text: string,
    niche: string,
    subcategory: string
): string => {
    if (text.includes('#')) return text; // If already has hashtags, keep it
    const tags = selectBestHashtags(niche, subcategory, text);
    if (tags.length === 0) return text;

    const combined = `${text}\n\n${tags.join(' ')}`;
    return combined.length <= 300 ? combined : text;
};
