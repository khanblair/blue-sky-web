"use client";

import { CardRoot, CardHeader, CardContent } from "@heroui/react";
import { MessageSquare } from "lucide-react";

export default function PostsPage() {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2">My Posts</h1>
                <p className="text-default-500">Manage and analyze your historical content</p>
            </header>

            <CardRoot className="bg-surface border-divider border">
                <CardHeader className="flex gap-3 p-6">
                    <MessageSquare className="text-primary" />
                    <p className="font-bold">Post History</p>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <p className="text-sm text-default-500">Post analytics coming soon...</p>
                </CardContent>
            </CardRoot>
        </div>
    );
}
