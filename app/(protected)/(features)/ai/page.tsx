"use client";

import { useState, useEffect } from "react";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
    Input,
    Label,
    TextFieldRoot,
    SwitchRoot,
    SwitchControl,
    SwitchThumb,
} from "@heroui/react";
import {
    Sparkles,
    Zap,
    Clock,
    Loader2,
    MessageSquare,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AIPage() {
    const user = useQuery(api.users.getCurrentUser);
    const preferences = useQuery(api.users.getPreferences);
    const updatePrefs = useMutation(api.users.updatePreferences);
    const updateUser = useMutation(api.users.createOrUpdateUser);

    const [topicsStr, setTopicsStr] = useState("");
    const [localPrefs, setLocalPrefs] = useState({
        tone: "professional",
        frequency: 24,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (preferences) {
            setLocalPrefs({
                tone: preferences.tone,
                frequency: preferences.frequency,
            });
            setTopicsStr(preferences.topics.join(", "));
        }
    }, [preferences]);

    const handleSavePreferences = async () => {
        setIsSaving(true);
        try {
            await updatePrefs({
                topics: topicsStr.split(",").map((s) => s.trim()).filter(Boolean),
                tone: localPrefs.tone,
                frequency: localPrefs.frequency,
            });
            alert("AI Preferences saved!");
        } catch (error) {
            alert("Failed to save preferences");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (e: any) => {
        if (!user) return;
        const isSelected = e.target.checked;
        try {
            await updateUser({
                handle: user.handle || "",
                appPassword: user.appPassword || "",
                isActive: isSelected,
            });
        } catch (error) {
            alert("Failed to toggle system status");
        }
    };

    if (user === undefined || preferences === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const SUGGESTED_FREQUENCIES = [1, 6, 12, 24, 48];
    const SUGGESTED_TONES = ["professional", "casual", "humorous", "intellectual", "enthusiastic"];
    const SUGGESTED_TOPICS = ["Tech", "Philosophy", "AI", "Space", "Stoicism"];

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">AI Configuration</h1>
                <p className="text-default-500">Fine-tune your personal AI model and generation rules</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Automation Settings */}
                    <CardRoot className="bg-surface border-divider border">
                        <CardHeader className="flex gap-3 p-6 font-black uppercase tracking-widest text-sm">
                            <Clock className="text-success" size={20} />
                            <p>Automation Behavior</p>
                        </CardHeader>
                        <div className="h-px bg-divider w-full" />
                        <CardContent className="p-6 space-y-6">
                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Posting Frequency (Hours)</Label>
                                <Input
                                    type="number"
                                    value={localPrefs.frequency.toString()}
                                    onChange={(e) => setLocalPrefs({ ...localPrefs, frequency: parseInt(e.target.value) || 24 })}
                                    className="bg-default-50 border-divider"
                                    min={1}
                                    max={168}
                                />
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {SUGGESTED_FREQUENCIES.map((f) => (
                                        <Button
                                            key={f}
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 px-2 text-[10px] font-bold border border-divider rounded-full hover:bg-success/10 hover:border-success/50"
                                            onPress={() => setLocalPrefs({ ...localPrefs, frequency: f })}
                                        >
                                            {f}h
                                        </Button>
                                    ))}
                                </div>
                            </TextFieldRoot>

                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">AI Voice Tone</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SUGGESTED_TONES.map((t) => (
                                        <Button
                                            key={t}
                                            variant={localPrefs.tone === t ? "primary" : "outline"}
                                            className="font-bold uppercase text-[10px] tracking-widest h-9"
                                            onPress={() => setLocalPrefs({ ...localPrefs, tone: t })}
                                        >
                                            {t}
                                        </Button>
                                    ))}
                                </div>
                            </TextFieldRoot>
                        </CardContent>
                    </CardRoot>

                    {/* System Status */}
                    <CardRoot className="bg-surface border-divider border">
                        <CardHeader className="flex gap-3 p-6">
                            <Zap className="text-warning" size={20} />
                            <div className="flex flex-col text-left">
                                <p className="font-black uppercase tracking-widest text-sm">System Status</p>
                                <p className="text-xs text-default-500">Enable or disable automation globally</p>
                            </div>
                        </CardHeader>
                        <div className="h-px bg-divider w-full" />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-bold">Active Posting</p>
                                    <p className="text-xs text-default-500">Allow AI to generate and post</p>
                                </div>
                                <SwitchRoot
                                    isSelected={user?.isActive ?? false}
                                    onChange={handleToggleActive}
                                    className="group inline-flex items-center"
                                >
                                    <SwitchControl className="bg-default-200 group-data-[selected=true]:bg-success">
                                        <SwitchThumb />
                                    </SwitchControl>
                                </SwitchRoot>
                            </div>
                        </CardContent>
                    </CardRoot>
                </div>

                {/* Content Strategy */}
                <CardRoot className="bg-surface border-divider border h-fit">
                    <CardHeader className="flex gap-3 p-6">
                        <Sparkles className="text-primary" size={20} />
                        <div className="flex flex-col text-left">
                            <p className="font-black uppercase tracking-widest text-sm">Content Strategy</p>
                            <p className="text-xs text-default-500">What should your AI talk about?</p>
                        </div>
                    </CardHeader>
                    <div className="h-px bg-divider w-full" />
                    <CardContent className="p-6 space-y-6">
                        <TextFieldRoot className="flex flex-col gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Target Topics</Label>
                            <Input
                                placeholder="Tech, Philosophy, AI"
                                value={topicsStr}
                                onChange={(e) => setTopicsStr(e.target.value)}
                                className="bg-default-50 border-divider"
                            />
                            <p className="text-[10px] text-default-500 italic">Separate with commas</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {SUGGESTED_TOPICS.map((topic) => (
                                    <Button
                                        key={topic}
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-3 text-[10px] font-black uppercase tracking-widest border border-divider rounded-lg hover:bg-primary/10 hover:border-primary/50"
                                        onPress={() => {
                                            const current = topicsStr.split(",").map(t => t.trim()).filter(Boolean);
                                            if (!current.includes(topic)) {
                                                setTopicsStr([...current, topic].join(", "));
                                            }
                                        }}
                                    >
                                        + {topic}
                                    </Button>
                                ))}
                            </div>
                        </TextFieldRoot>

                        <Button
                            variant="primary"
                            className="w-full font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20 mt-4"
                            onPress={handleSavePreferences}
                            isDisabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Saving...
                                </>
                            ) : (
                                "Save AI Configuration"
                            )}
                        </Button>
                    </CardContent>
                </CardRoot>
            </div>
        </div>
    );
}
