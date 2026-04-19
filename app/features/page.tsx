"use client";

import { CardRoot, CardHeader, CardContent, Chip } from "@heroui/react";
import { Zap, Sparkles, Clock, Shield, BarChart3, Globe } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            title: "AI Generation",
            description: "Intelligent post creation using fine-tuned models tailored to your specific persona.",
            icon: Sparkles,
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            title: "Smart Scheduling",
            description: "Automatically post at the best times to maximize engagement and visibility.",
            icon: Clock,
            color: "text-warning",
            bgColor: "bg-warning/10"
        },
        {
            title: "Sub-Second Speed",
            description: "Powered by Convex and Bun for a lightning-fast experience across the globe.",
            icon: Zap,
            color: "text-success",
            bgColor: "bg-success/10"
        },
        {
            title: "Top-Tier Security",
            description: "Encrypted App Passwords ensure your main Bluesky credentials never leave your control.",
            icon: Shield,
            color: "text-danger",
            bgColor: "bg-danger/10"
        },
        {
            title: "Performance Analytics",
            description: "Detailed insights into how your automated presence is performing over time.",
            icon: BarChart3,
            color: "text-secondary",
            bgColor: "bg-secondary/10"
        },
        {
            title: "Global Reach",
            description: "Serverless execution ensures your posts go out on time, no matter where you are.",
            icon: Globe,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-6 flex flex-col gap-16">
            <header className="text-center space-y-4">
                <Chip variant="tertiary" className="text-primary border-primary/20 bg-primary/5 font-bold uppercase tracking-widest text-[10px] px-3">
                    Capabilities
                </Chip>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight">Everything you need to <br /><span className="text-primary">Master BlueSky</span></h1>
                <p className="text-default-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    Stop worrying about what to post. Our suite of AI tools handles the heavy lifting while you reap the rewards.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, idx) => (
                    <CardRoot key={idx} className="p-4 bg-surface border-divider border hover:border-primary/50 transition-all group">
                        <CardHeader className="flex gap-4 p-4 pb-0 items-center">
                            <div className={`w-12 h-12 rounded-2xl ${feature.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={feature.color} size={24} />
                            </div>
                            <h3 className="text-xl font-black">{feature.title}</h3>
                        </CardHeader>
                        <CardContent className="p-4 pt-4">
                            <p className="text-default-500 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </CardContent>
                    </CardRoot>
                ))}
            </div>
        </div>
    );
}
