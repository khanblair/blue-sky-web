"use client";

import { CardRoot, CardHeader, CardContent } from "@heroui/react";
import { Calendar } from "lucide-react";

export default function SchedulePage() {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2">Post Schedule</h1>
                <p className="text-default-500">Plan and view your upcoming automated posts</p>
            </header>

            <CardRoot className="bg-surface border-divider border">
                <CardHeader className="flex gap-3 p-6">
                    <Calendar className="text-primary" />
                    <p className="font-bold">Posting Calendar</p>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <p className="text-sm text-default-500">Schedule management coming soon...</p>
                </CardContent>
            </CardRoot>
        </div>
    );
}
