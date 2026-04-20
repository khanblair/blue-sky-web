import {
    Laptop, HeartPulse, PiggyBank, Compass, Utensils, Shirt,
    Dumbbell, GraduationCap, Play, Briefcase, Users, Trees, LucideIcon
} from 'lucide-react';

export interface NicheDefinition {
    label: string;
    icon: LucideIcon;
    subcategories: string[];
}

export const NICHES: Record<string, NicheDefinition> = {
    technology: {
        label: 'Technology',
        icon: Laptop,
        subcategories: [
            'AI & Machine Learning',
            'Web Development',
            'Mobile Apps',
            'Cybersecurity',
            'Cloud Computing',
            'Blockchain',
            'DevOps',
            'SaaS & Startups'
        ],
    },
    health: {
        label: 'Health & Wellness',
        icon: HeartPulse,
        subcategories: [
            'Nutrition',
            'Mental Health',
            'Longevity',
            'Biohacking',
            'Sleep Optimization',
            'Holistic Medicine'
        ],
    },
    finance: {
        label: 'Personal Finance',
        icon: PiggyBank,
        subcategories: [
            'Investing',
            'Crypto',
            'Budgeting',
            'Real Estate',
            'Economic Trends',
            'Financial Freedom'
        ],
    },
    travel: {
        label: 'Travel & Nomad',
        icon: Compass,
        subcategories: [
            'Digital Nomadism',
            'Adventure Travel',
            'Luxury Travel',
            'Budget Travel',
            'Hidden Gems',
            'Travel Gear'
        ],
    },
    food: {
        label: 'Food & Culinary',
        icon: Utensils,
        subcategories: [
            'Cooking Tips',
            'Restaurant Reviews',
            'Vegan / Plant-Based',
            'Coffee Culture',
            'Wine & Spirits',
            'Food Tech'
        ],
    },
    fashion: {
        label: 'Fashion & Style',
        icon: Shirt,
        subcategories: [
            'Sustainable Fashion',
            'Streetwear',
            'Minimalist Wardrobe',
            'Luxury Brands',
            'Style Tips',
            'Watches & Accessories'
        ],
    },
    fitness: {
        label: 'Fitness & Sport',
        icon: Dumbbell,
        subcategories: [
            'Bodybuilding',
            'HIIT',
            'Yoga',
            'Endurance Running',
            'Martial Arts',
            'Sports Science'
        ],
    },
    education: {
        label: 'Education & Learning',
        icon: GraduationCap,
        subcategories: [
            'Online Learning',
            'Self Improvement',
            'Language Learning',
            'History',
            'Skill Acquisition',
            'Academic Research'
        ],
    },
    entertainment: {
        label: 'Entertainment',
        icon: Play,
        subcategories: [
            'Movies & TV',
            'Gaming',
            'Music Production',
            'Streaming Culture',
            'Anime',
            'Pop Culture'
        ],
    },
    business: {
        label: 'Business & Startups',
        icon: Briefcase,
        subcategories: [
            'Sales & Marketing',
            'Entrepreneurship',
            'Leadership',
            'Product Management',
            'Freelancing',
            'Remote Work'
        ],
    },
    politics: {
        label: 'Politics & Society',
        icon: Users,
        subcategories: [
            'Global Affairs',
            'Social Issues',
            'Philosophy',
            'Current Events',
            'Economics',
            'Sustainability'
        ],
    },
    science: {
        label: 'Science & Nature',
        icon: Trees,
        subcategories: [
            'Space Exploration',
            'Physics',
            'Environment / Green Tech',
            'Biology',
            'Psychology',
            'Futurism'
        ],
    },
};

export type NicheKey = keyof typeof NICHES;

export const getNicheOptions = () => {
    return Object.entries(NICHES).map(([key, value]) => ({
        value: key,
        label: value.label,
        Icon: value.icon,
    }));
};

export const getSubcategories = (nicheKey: string) => {
    if (!nicheKey) return [];
    const niche = NICHES[nicheKey as NicheKey];
    return niche ? niche.subcategories : [];
};
