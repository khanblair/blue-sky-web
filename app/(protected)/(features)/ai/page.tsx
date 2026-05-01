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
import { Sparkles, Zap, CalendarClock, Loader2, Cpu, Key, ChevronDown as ChevronDownIcon } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NICHES, getNicheOptions, getSubcategories } from "@/lib/niches";
import { HASHTAG_DATABASE, selectBestHashtags } from "@/lib/hashtags";
import { PROVIDER_INFO } from "@/lib/plans";
import { PlanGate, UpsellBanner } from "@/components/ui";

const GENERATE_SUGGESTIONS = [
    { label: "Every 1h", value: 1 },
    { label: "Every 2h", value: 2 },
    { label: "Every 3h", value: 3 },
    { label: "Every 6h", value: 6 },
    { label: "Every 12h", value: 12 },
    { label: "Every 24h", value: 24 },
];

const POST_SUGGESTIONS = [
    { label: "Every 1h", value: 1 },
    { label: "Every 3h", value: 3 },
    { label: "Every 6h", value: 6 },
    { label: "Every 8h", value: 8 },
    { label: "Every 12h", value: 12 },
    { label: "Every 24h", value: 24 },
];

const SUGGESTED_TONES = ["professional", "casual", "humorous", "intellectual", "enthusiastic"];
const SUGGESTED_GOALS = ["educate", "entertain", "inspire", "connect", "debate"];

function IntervalPicker({
    label,
    description,
    value,
    onChange,
    suggestions,
    warning,
}: {
    label: string;
    description: string;
    value: number;
    onChange: (v: number) => void;
    suggestions: { label: string; value: number }[];
    warning?: string;
}) {
    // Keep a raw string while the user is typing so we don't snap mid-keystroke
    const [raw, setRaw] = useState(value.toString());

    // Sync raw when the committed value changes externally (e.g. suggestion click)
    useEffect(() => {
        setTimeout(() => setRaw(value.toString()), 0);
    }, [value]);

    const commit = (str: string) => {
        const parsed = parseInt(str, 10);
        const clamped = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 168);
        onChange(clamped);
        setRaw(clamped.toString());
    };

    return (
        <TextFieldRoot className="flex flex-col gap-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">{label}</Label>
            <p className="text-[10px] text-default-500 italic">{description}</p>
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    onBlur={(e) => commit(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
                    className="bg-default-50 border-divider w-24"
                    min={1}
                    max={168}
                />
                <span className="text-xs text-default-500 font-bold">hours</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
                {suggestions.map((s) => (
                    <button
                        key={s.value}
                        type="button"
                        onClick={() => onChange(s.value)}
                        className={`h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${value === s.value
                            ? "bg-primary border-primary text-white"
                            : "bg-transparent border-divider text-default-400 hover:border-primary/50 hover:text-primary"
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
            {warning && (
                <p className="text-[10px] text-warning font-bold mt-1">{warning}</p>
            )}
        </TextFieldRoot>
    );
}

export default function AIPage() {
    const user = useQuery(api.users.getCurrentUser);
    const preferences = useQuery(api.users.getPreferences);
    const updatePrefs = useMutation(api.users.updatePreferences);
    const updateUser = useMutation(api.users.createOrUpdateUser);

    const [tz, setTz] = useState("");

    useEffect(() => {
        setTimeout(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone), 0);
    }, []);

    const [topics, setTopics] = useState<string[]>([]);
    const [subtopics, setSubtopics] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const [localPrefs, setLocalPrefs] = useState({
        tone: "professional",
        goal: "educate",
        generateIntervalHours: 6,
        postIntervalHours: 8,
    });
    const [isSaving, setIsSaving] = useState(false);

    const planDetails = useQuery(api.subscriptions.getPlanDetails);
    const currentPlan = planDetails?.plan ?? "starter";

    const [selectedProvider, setSelectedProvider] = useState("openrouter");
    const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash-lite");
    const [apiKey, setApiKey] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSavingProvider, setIsSavingProvider] = useState(false);
    const saveProviderConfig = useMutation(api.aiGeneration.saveProviderConfig);

    useEffect(() => {
        if (!preferences) return;
        
        const timer = setTimeout(() => {
            setLocalPrefs({
                tone: preferences.tone,
                goal: preferences.goal ?? "educate",
                generateIntervalHours: preferences.generateIntervalHours ?? 6,
                postIntervalHours: preferences.postIntervalHours ?? 8,
            });
            setTopics(preferences.topics || []);
            setSubtopics(preferences.subtopics || []);
            setTags(preferences.tags || []);
        }, 0);

        return () => clearTimeout(timer);
    }, [preferences]);

    const activeNicheKey = topics[0];
    const activeSubcategories = subtopics;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePrefs({
                topics,
                subtopics,
                tags,
                tone: localPrefs.tone,
                goal: localPrefs.goal,
                frequency: localPrefs.generateIntervalHours, // keep legacy field in sync
                generateIntervalHours: localPrefs.generateIntervalHours,
                postIntervalHours: localPrefs.postIntervalHours,
            });
            alert("AI Preferences saved!");
        } catch {
            alert("Failed to save preferences");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (isSelected: boolean) => {
        if (!user) return;
        try {
            await updateUser({
                handle: user.handle || "",
                appPassword: user.appPassword || "",
                isActive: isSelected,
            });
        } catch {
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

    const postTooFast =
        localPrefs.postIntervalHours < localPrefs.generateIntervalHours;

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">AI Configuration</h1>
                <p className="text-default-500">Fine-tune your personal AI model and generation rules</p>
            </header>

            <UpsellBanner currentPlan={currentPlan} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Schedule */}
                    <CardRoot className="bg-surface border-divider border">
                        <CardHeader className="flex items-center justify-between p-6">
                            <div className="flex gap-3 font-black uppercase tracking-widest text-sm">
                                <CalendarClock className="text-success" size={20} />
                                <p>Schedule</p>
                            </div>
                            {tz && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-default-100 rounded-full border border-divider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-default-500">
                                        Local: {tz.replace("_", " ")}
                                    </span>
                                </div>
                            )}
                        </CardHeader>
                        <div className="h-px bg-divider w-full" />
                        <CardContent className="p-6 space-y-6">
                            <IntervalPicker
                                label="Generate interval"
                                description="How often the AI generates a new pending post."
                                value={localPrefs.generateIntervalHours}
                                onChange={(v) => setLocalPrefs({ ...localPrefs, generateIntervalHours: v })}
                                suggestions={GENERATE_SUGGESTIONS}
                            />
                            <IntervalPicker
                                label="Publish interval"
                                description="How often a pending post is published to Bluesky."
                                value={localPrefs.postIntervalHours}
                                onChange={(v) => setLocalPrefs({ ...localPrefs, postIntervalHours: v })}
                                suggestions={POST_SUGGESTIONS}
                                warning={
                                    postTooFast
                                        ? "⚠ Publish interval is shorter than generate interval — posts may run out before new ones are ready."
                                        : undefined
                                }
                            />

                            {/* Tone */}
                            <TextFieldRoot className="flex flex-col gap-2">
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

                    <PlanGate required="pro" currentPlan={currentPlan} fallback={
                        <CardRoot className="bg-surface border-divider border">
                            <CardContent className="p-6 opacity-60">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-bold flex items-center gap-2">
                                            <Cpu size={16} className="text-primary" />
                                            AI Model & Provider
                                        </p>
                                        <p className="text-xs text-default-500">Available on Pro and Enterprise plans</p>
                                    </div>
                                </div>
                            </CardContent>
                        </CardRoot>
                    }>
                        <CardRoot className="bg-surface border-divider border">
                            <CardHeader className="flex gap-3 p-6">
                                <Cpu className="text-primary" size={20} />
                                <div className="flex flex-col text-left">
                                    <p className="font-black uppercase tracking-widest text-sm">AI Model & Provider</p>
                                    <p className="text-xs text-default-500">Choose your AI model or bring your own API key</p>
                                </div>
                            </CardHeader>
                            <div className="h-px bg-divider w-full" />
                            <CardContent className="p-6 space-y-6">
                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Provider</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {PROVIDER_INFO.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProvider(p.id);
                                                    setSelectedModel(p.models[0]);
                                                }}
                                                className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                                    selectedProvider === p.id
                                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                        : "bg-transparent border-divider text-default-400 hover:border-primary/50 hover:text-primary"
                                                }`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </TextFieldRoot>

                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Model</Label>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="h-11 px-4 bg-default-50 border border-divider rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary appearance-none"
                                    >
                                        {PROVIDER_INFO.find(p => p.id === selectedProvider)?.models.map((m) => (
                                            <option key={m} value={m} className="bg-zinc-900">{m}</option>
                                        ))}
                                    </select>
                                </TextFieldRoot>

                                {selectedProvider !== "openrouter" && (
                                    <TextFieldRoot className="flex flex-col gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-default-400 flex items-center gap-1.5">
                                            <Key size={10} /> Your API Key (BYOK)
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type={showApiKey ? "text" : "password"}
                                                placeholder={`Enter your ${PROVIDER_INFO.find(p => p.id === selectedProvider)?.name} API key`}
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                className="bg-default-50 border-divider pr-10"
                                            />
                                            <button
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600"
                                            >
                                                {showApiKey ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-default-400 italic">Your key is stored encrypted and never exposed to the client.</p>
                                    </TextFieldRoot>
                                )}

                                {selectedProvider === "openrouter" && (
                                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                                        <p className="text-[10px] text-default-500">
                                            Using the platform&apos;s shared OpenRouter key. <span className="text-primary font-bold">Pro & Enterprise</span> users can bring their own key for other providers.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    variant="primary"
                                    className="w-full font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20"
                                    onPress={async () => {
                                        setIsSavingProvider(true);
                                        try {
                                            await saveProviderConfig({
                                                provider: selectedProvider,
                                                model: selectedModel,
                                                apiKey: apiKey || undefined,
                                                isActive: true,
                                            });
                                            alert("AI provider configuration saved!");
                                        } catch (err: unknown) {
                                            const message = err instanceof Error ? err.message : String(err);
                                            alert(message || "Failed to save provider config");
                                        } finally {
                                            setIsSavingProvider(false);
                                        }
                                    }}
                                    isDisabled={isSavingProvider}
                                >
                                    {isSavingProvider ? (
                                        <><Loader2 className="animate-spin mr-2" size={16} />Saving...</>
                                    ) : (
                                        "Save AI Provider"
                                    )}
                                </Button>
                            </CardContent>
                        </CardRoot>
                    </PlanGate>
                </div>

                {/* Content Strategy */}
                <div className="space-y-8">
                    <CardRoot className="bg-surface border-divider border h-fit">
                        <CardHeader className="flex gap-3 p-6">
                            <Sparkles className="text-primary" size={20} />
                            <div className="flex flex-col text-left">
                                <p className="font-black uppercase tracking-widest text-sm">Content Strategy</p>
                                <p className="text-xs text-default-500">Select topics to define your AI persona</p>
                            </div>
                        </CardHeader>
                        <div className="h-px bg-divider w-full" />
                        <CardContent className="p-6 space-y-8">
                            {/* Primary Goal */}
                            <TextFieldRoot className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Primary Goal</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {SUGGESTED_GOALS.map((g) => (
                                        <Button
                                            key={g}
                                            variant={localPrefs.goal === g ? "primary" : "outline"}
                                            className="font-bold uppercase text-[10px] tracking-widest h-9"
                                            onPress={() => setLocalPrefs({ ...localPrefs, goal: g })}
                                        >
                                            {g}
                                        </Button>
                                    ))}
                                </div>
                            </TextFieldRoot>

                            {/* Niches */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Primary Niche</Label>
                                <div className="flex flex-wrap gap-2">
                                    {getNicheOptions().map(({ value, label }) => {
                                        const isSelected = activeNicheKey === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    setTopics([value]);
                                                    setSubtopics([]);
                                                    setTags([]);
                                                }}
                                                className={`h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-200 ${isSelected
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                    : "bg-transparent border-divider text-default-500 hover:border-primary/50 hover:text-primary"
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Subcategories */}
                            {activeNicheKey && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-400">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400 opacity-60">Sub-Categories</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {getSubcategories(activeNicheKey).map((sub) => {
                                            const isSelected = activeSubcategories.includes(sub);
                                            return (
                                                <button
                                                    key={sub}
                                                    type="button"
                                                    onClick={() => {
                                                        let next;
                                                        if (isSelected) {
                                                            next = activeSubcategories.filter(x => x !== sub);
                                                        } else {
                                                            next = [...activeSubcategories, sub];
                                                            const nicheTags = HASHTAG_DATABASE[activeNicheKey]?.[sub] || [];
                                                            const newTags = Array.from(new Set([...tags, ...nicheTags]));
                                                            setTags(newTags.slice(0, 10));
                                                        }
                                                        setSubtopics(next);
                                                    }}
                                                    className={`h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${isSelected
                                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                        : "bg-transparent border-divider text-default-400 hover:border-primary/50 hover:text-primary"
                                                        }`}
                                                >
                                                    {sub}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Hashtags Pool</Label>
                                <div className="p-4 bg-default-50 border border-divider rounded-2xl">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {tags.map(tag => (
                                            <div key={tag} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                                #{tag.replace(/^#/, "")}
                                                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-danger ml-1 p-0.5">×</button>
                                            </div>
                                        ))}
                                        {tags.length === 0 && <span className="text-[10px] text-default-400 italic">No hashtags selected...</span>}
                                    </div>
                                    <Input
                                        placeholder="Add custom hashtag..."
                                        className="h-9 text-xs bg-surface border-divider"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                const val = (e.target as HTMLInputElement).value.trim().replace(/^#/, "");
                                                if (val && !tags.includes(val)) {
                                                    setTags([...tags, val]);
                                                    (e.target as HTMLInputElement).value = "";
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-[10px] text-default-500 italic text-center">
                                    AI will pick the most relevant ones during generation.
                                </p>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20 mt-4"
                                onPress={handleSave}
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
        </div>
    );
}
