"use client";

import { CardRoot, CardHeader, CardContent } from "@heroui/react";
import { Sparkles } from "lucide-react";

export default function AIPage() {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2">AI Configuration</h1>
                <p className="text-default-500">Fine-tune your personal AI model and generation rules</p>
            </header>

            <CardRoot className="bg-surface border-divider border">
                <CardHeader className="flex gap-3 p-6">
                    <Sparkles className="text-primary" />
                    <p className="font-bold">Model Settings</p>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <p className="text-sm text-default-500">AI tuning parameters coming soon...</p>
                </CardContent>
            </CardRoot>
        </div>
    );
}
