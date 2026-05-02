"use client";

import { useState, useEffect } from "react";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
    Input,
    TextArea,
    Label,
    TextFieldRoot,
    SwitchRoot,
    SwitchControl,
    SwitchThumb,
    Tooltip,
} from "@heroui/react";
import { Sparkles, Zap, CalendarClock, Loader2, Cpu, Key, Lock, MessageSquareQuote, Volume2, ChevronDown as ChevronDownIcon, Plus } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NICHES, getNicheOptions, getSubcategories } from "@/lib/niches";
import { HASHTAG_DATABASE, selectBestHashtags } from "@/lib/hashtags";
import { PROVIDER_INFO, PLAN_LIMITS, type PlanId } from "@/lib/plans";
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
    minAllowed = 1,
    currentPlanLabel = "Starter",
    canEdit = true,
}: {
    label: string;
    description: string;
    value: number;
    onChange: (v: number) => void;
    suggestions: { label: string; value: number }[];
    warning?: string;
    minAllowed?: number;
    currentPlanLabel?: string;
    canEdit?: boolean;
}) {
    // Keep a raw string while the user is typing so we don't snap mid-keystroke
    const [raw, setRaw] = useState(value.toString());

    // Sync raw when the committed value changes externally (e.g. suggestion click)
    useEffect(() => {
        setTimeout(() => setRaw(value.toString()), 0);
    }, [value]);

    const commit = (str: string) => {
        if (!canEdit) return;
        const parsed = parseInt(str, 10);
        let clamped = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 168);
        
        // Enforce plan limit
        if (clamped < minAllowed) {
            clamped = minAllowed;
        }
        
        onChange(clamped);
        setRaw(clamped.toString());
    };

    return (
        <TextFieldRoot className={`flex flex-col gap-2 ${!canEdit ? "opacity-75" : ""}`}>
            <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">{label}</Label>
            <p className="text-[10px] text-default-500 italic">{description}</p>
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    value={raw}
                    onChange={(e) => canEdit && setRaw(e.target.value)}
                    onBlur={(e) => commit(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
                    className="bg-default-50 border-divider w-24"
                    min={minAllowed}
                    max={168}
                    disabled={!canEdit}
                />
                <span className="text-xs text-default-500 font-bold">hours</span>
                {!canEdit && <Lock size={12} className="text-warning ml-1" />}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
                {suggestions.map((s) => {
                    const isRestricted = s.value < minAllowed || !canEdit;
                    const content = (
                        <button
                            key={s.value}
                            type="button"
                            disabled={isRestricted}
                            onClick={() => !isRestricted && onChange(s.value)}
                            className={`h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors flex items-center gap-1 ${
                                value === s.value
                                    ? "bg-primary border-primary text-white"
                                    : isRestricted
                                    ? "bg-default-100 border-divider text-default-300 cursor-not-allowed opacity-60"
                                    : "bg-transparent border-divider text-default-400 hover:border-primary/50 hover:text-primary"
                            }`}
                        >
                            {isRestricted && <Lock size={8} />}
                            {s.label}
                        </button>
                    );

                    if (isRestricted) {
                        return (
                            <Tooltip key={s.value} closeDelay={0}>
                                <Tooltip.Trigger>
                                    {content}
                                </Tooltip.Trigger>
                                <Tooltip.Content placement="top">
                                    {!canEdit 
                                        ? "Manual schedule settings require Pro tier." 
                                        : `Requires higher tier (Current: ${currentPlanLabel} limit ${minAllowed}h)`}
                                </Tooltip.Content>
                            </Tooltip>
                        );
                    }

                    return content;
                })}
            </div>
            {warning && (
                <p className="text-[10px] text-warning font-bold mt-1">{warning}</p>
            )}
            {!canEdit ? (
                <p className="text-[9px] text-warning font-bold mt-0.5 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={8} /> Pro feature: Custom schedule intervals
                </p>
            ) : minAllowed > 1 && (
                <p className="text-[9px] text-default-400 mt-0.5">
                    * Your {currentPlanLabel} plan allows minimum {minAllowed}h interval.
                </p>
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
        customSystemPrompt: "",
        customToneInstructions: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    // Temp states for custom inputs
    const [customGoal, setCustomGoal] = useState("");
    const [customNiche, setCustomNiche] = useState("");
    const [customSub, setCustomSub] = useState("");

    const planDetails = useQuery(api.subscriptions.getPlanDetails);
    const currentPlan = (planDetails?.plan as PlanId) ?? "starter";
    const limits = planDetails?.limits ?? PLAN_LIMITS[currentPlan];

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
                customSystemPrompt: preferences.customSystemPrompt ?? "",
                customToneInstructions: preferences.customToneInstructions ?? "",
            });
            setTopics(preferences.topics || []);
            setSubtopics(preferences.subtopics || []);
            setTags(preferences.tags || []);

            // Check if goal is custom
            if (preferences.goal && !SUGGESTED_GOALS.includes(preferences.goal)) {
                setCustomGoal(preferences.goal);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [preferences]);

    const activeNicheKey = topics[0];
    const activeSubcategories = subtopics;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Determine final goal
            const finalGoal = customGoal.trim() || localPrefs.goal;

            await updatePrefs({
                topics,
                subtopics,
                tags,
                tone: localPrefs.tone,
                goal: finalGoal,
                frequency: localPrefs.generateIntervalHours, // keep legacy field in sync
                generateIntervalHours: localPrefs.generateIntervalHours,
                postIntervalHours: localPrefs.postIntervalHours,
                customSystemPrompt: localPrefs.customSystemPrompt,
                customToneInstructions: localPrefs.customToneInstructions,
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
                    <CardRoot className="bg-surface border-divider border shadow-sm">
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
                                minAllowed={limits.minGenerateIntervalHours}
                                currentPlanLabel={limits.label}
                                canEdit={['pro', 'standard', 'enterprise'].includes(currentPlan)}
                            />
                            <IntervalPicker
                                label="Publish interval"
                                description="How often a pending post is published to Bluesky."
                                value={localPrefs.postIntervalHours}
                                onChange={(v) => setLocalPrefs({ ...localPrefs, postIntervalHours: v })}
                                suggestions={POST_SUGGESTIONS}
                                minAllowed={limits.minGenerateIntervalHours} // Using same limit for publishing
                                currentPlanLabel={limits.label}
                                canEdit={['pro', 'standard', 'enterprise'].includes(currentPlan)}
                                warning={
                                    postTooFast
                                        ? "⚠ Publish interval is shorter than generate interval — posts may run out before new ones are ready."
                                        : undefined
                                }
                            />

                            {/* Tone */}
                            <TextFieldRoot className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">AI Voice Tone</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

                    {/* Advanced AI Settings (Pro+) */}
                    <PlanGate required="pro" currentPlan={currentPlan} fallback={
                        <CardRoot className="bg-surface border-divider border opacity-70">
                            <CardHeader className="flex gap-3 p-6">
                                <MessageSquareQuote className="text-default-400" size={20} />
                                <div className="flex flex-col text-left">
                                    <p className="font-black uppercase tracking-widest text-sm text-default-400">Advanced AI Controls</p>
                                    <p className="text-xs text-default-500">Custom prompts and fine-tuning</p>
                                </div>
                                <div className="ml-auto">
                                    <Lock size={16} className="text-default-400" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-[10px] text-default-500 font-bold uppercase text-center border border-dashed border-divider p-4 rounded-xl">
                                    Upgrade to PRO to unlock custom system prompts and tone instructions.
                                </p>
                            </CardContent>
                        </CardRoot>
                    }>
                        <CardRoot className="bg-surface border-divider border shadow-lg shadow-primary/5">
                            <CardHeader className="flex gap-3 p-6">
                                <MessageSquareQuote className="text-primary" size={20} />
                                <div className="flex flex-col text-left">
                                    <p className="font-black uppercase tracking-widest text-sm">Advanced AI Controls</p>
                                    <p className="text-xs text-default-500">Fine-tune the AI&apos;s behavior</p>
                                </div>
                            </CardHeader>
                            <div className="h-px bg-divider w-full" />
                            <CardContent className="p-6 space-y-6">
                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400 flex items-center gap-2">
                                        <MessageSquareQuote size={12} /> Custom System Prompt
                                    </Label>
                                    <TextArea
                                        placeholder="Act as a tech philosopher who focuses on decentralization..."
                                        value={localPrefs.customSystemPrompt}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalPrefs({ ...localPrefs, customSystemPrompt: e.target.value })}
                                        className="bg-default-50 border-divider min-h-[100px]"
                                    />
                                    <p className="text-[9px] text-default-400 italic">This overrides the default AI personality instructions.</p>
                                </TextFieldRoot>

                                <TextFieldRoot className="flex flex-col gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400 flex items-center gap-2">
                                        <Volume2 size={12} /> Custom Tone Instructions
                                    </Label>
                                    <TextArea
                                        placeholder="Use short, punchy sentences. Avoid emojis. End with a question..."
                                        value={localPrefs.customToneInstructions}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalPrefs({ ...localPrefs, customToneInstructions: e.target.value })}
                                        className="bg-default-50 border-divider min-h-[80px]"
                                    />
                                </TextFieldRoot>
                            </CardContent>
                        </CardRoot>
                    </PlanGate>

                    {/* System Status */}
                    <CardRoot className="bg-surface border-divider border">
                        <CardHeader className="flex gap-3 p-6">
                            <Zap className="text-warning" size={20} />
                            <div className="flex flex-col text-left">
                                <p className="font-black uppercase tracking-widest text-sm text-white">System Status</p>
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
                        <CardRoot className="bg-surface border-divider border shadow-sm">
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
                    <CardRoot className="bg-surface border-divider border h-fit shadow-sm">
                        <CardHeader className="flex items-center justify-between p-6">
                            <div className="flex gap-3">
                                <Sparkles className="text-primary" size={20} />
                                <div className="flex flex-col text-left">
                                    <p className="font-black uppercase tracking-widest text-sm text-white">Content Strategy</p>
                                    <p className="text-xs text-default-500">Define your AI persona and topics</p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[10px] font-black uppercase tracking-widest text-danger hover:bg-danger/10"
                                onPress={() => {
                                    setTopics([]);
                                    setSubtopics([]);
                                    setTags([]);
                                    setLocalPrefs({ ...localPrefs, goal: "educate" });
                                    setCustomGoal("");
                                    setCustomNiche("");
                                    setCustomSub("");
                                }}
                            >
                                Clear All
                            </Button>
                        </CardHeader>
                        <div className="h-px bg-divider w-full" />
                        <CardContent className="p-6 space-y-8">
                            {/* Plan Guidance Note */}
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
                                <Zap className="text-primary mt-1" size={16} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                        Plan Guidance: {limits.label} Tier
                                    </p>
                                    <p className="text-xs text-default-600 leading-relaxed">
                                        Your current plan allows up to <span className="font-bold text-white">{limits.maxTopics}</span> primary niches and <span className="font-bold text-white">{limits.maxSubtopics}</span> sub-categories.
                                        {currentPlan === 'starter' && " Upgrade for broader content reach."}
                                    </p>
                                </div>
                            </div>

                            {/* Primary Goal */}
                            <TextFieldRoot className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Primary Goal</Label>
                                    <button 
                                        onClick={() => { setLocalPrefs({ ...localPrefs, goal: "educate" }); setCustomGoal(""); }}
                                        className="text-[9px] font-black uppercase tracking-widest text-default-400 hover:text-danger transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {SUGGESTED_GOALS.map((g) => (
                                        <Button
                                            key={g}
                                            variant={localPrefs.goal === g && !customGoal ? "primary" : "outline"}
                                            className="font-bold uppercase text-[10px] tracking-widest h-9"
                                            onPress={() => {
                                                setLocalPrefs({ ...localPrefs, goal: g });
                                                setCustomGoal("");
                                            }}
                                        >
                                            {g}
                                        </Button>
                                    ))}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <Input
                                        placeholder="Or enter custom goal..."
                                        value={customGoal}
                                        onChange={(e) => setCustomGoal(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && customGoal.trim()) {
                                                setLocalPrefs({ ...localPrefs, goal: customGoal.trim() });
                                            }
                                        }}
                                        className="h-8 text-[10px] bg-default-50/50 border-divider font-bold uppercase tracking-widest"
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 min-w-0 px-2"
                                        onPress={() => {
                                            if (customGoal.trim()) {
                                                setLocalPrefs({ ...localPrefs, goal: customGoal.trim() });
                                            }
                                        }}
                                    >
                                        <Plus size={14} />
                                    </Button>
                                    {(customGoal === localPrefs.goal || (customGoal && localPrefs.goal === customGoal)) && (
                                        <Sparkles size={14} className="text-primary animate-pulse shrink-0" />
                                    )}
                                </div>
                            </TextFieldRoot>

                            {/* Niches */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Primary Niches</Label>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-default-400 opacity-60">
                                            {topics.length} / {limits.maxTopics}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => { setTopics([]); setSubtopics([]); setCustomNiche(""); }}
                                        className="text-[9px] font-black uppercase tracking-widest text-default-400 hover:text-danger transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {getNicheOptions().map(({ value, label }) => {
                                        const isSelected = topics.includes(value);
                                        const isAtLimit = topics.length >= limits.maxTopics;
                                        const isRestricted = !isSelected && isAtLimit;

                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                disabled={isRestricted}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setTopics(topics.filter(t => t !== value));
                                                        setSubtopics([]);
                                                    } else if (!isRestricted) {
                                                        setTopics([...topics, value]);
                                                    }
                                                }}
                                                className={`h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-200 flex items-center gap-1 ${isSelected
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                    : isRestricted
                                                    ? "bg-default-100 border-divider text-default-300 cursor-not-allowed opacity-60"
                                                    : "bg-transparent border-divider text-default-500 hover:border-primary/50 hover:text-primary"
                                                    }`}
                                            >
                                                {isRestricted && <Lock size={8} />}
                                                {label}
                                            </button>
                                        );
                                    })}
                                    {/* Render custom niches if selected and not in predefined list */}
                                    {topics.filter(t => !getNicheOptions().map(n => n.value).includes(t)).map(custom => (
                                        <button
                                            key={`custom-niche-${custom}`}
                                            type="button"
                                            onClick={() => setTopics(topics.filter(t => t !== custom))}
                                            className="h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest border bg-primary border-primary text-white shadow-lg shadow-primary/20 flex items-center gap-1"
                                        >
                                            {custom}
                                            <span className="opacity-60 ml-1 font-bold text-xs">×</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <Input
                                        placeholder="Add custom niche..."
                                        value={customNiche}
                                        onChange={(e) => setCustomNiche(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && customNiche.trim()) {
                                                const val = customNiche.trim();
                                                if (topics.length < limits.maxTopics && !topics.includes(val)) {
                                                    setTopics([...topics, val]);
                                                    setCustomNiche("");
                                                }
                                            }
                                        }}
                                        className="h-8 text-[10px] bg-default-50/50 border-divider font-bold uppercase tracking-widest"
                                        disabled={topics.length >= limits.maxTopics}
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 min-w-0 px-2"
                                        onPress={() => {
                                            const val = customNiche.trim();
                                            if (val && topics.length < limits.maxTopics && !topics.includes(val)) {
                                                setTopics([...topics, val]);
                                                setCustomNiche("");
                                            }
                                        }}
                                        isDisabled={topics.length >= limits.maxTopics}
                                    >
                                        <Plus size={14} />
                                    </Button>
                                </div>
                            </div>

                            {/* Subcategories */}
                            {topics.length > 0 && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-400">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-default-400 opacity-60">Sub-Categories</Label>
                                            <p className="text-[9px] text-default-500 italic">Based on your selected niches</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-default-400">
                                                {activeSubcategories.length} / {limits.maxSubtopics}
                                            </span>
                                            <button 
                                                onClick={() => { setSubtopics([]); setCustomSub(""); }}
                                                className="text-[9px] font-black uppercase tracking-widest text-default-400 hover:text-danger transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Get subcategories for ALL selected niches */}
                                        {Array.from(new Set(topics.flatMap(t => getSubcategories(t)))).map((sub) => {
                                            const isSelected = activeSubcategories.includes(sub);
                                            const isAtLimit = activeSubcategories.length >= limits.maxSubtopics;
                                            const isRestricted = !isSelected && isAtLimit;

                                            const content = (
                                                <button
                                                    key={sub}
                                                    type="button"
                                                    disabled={isRestricted}
                                                    onClick={() => {
                                                        if (isRestricted) return;
                                                        let next;
                                                        if (isSelected) {
                                                            next = activeSubcategories.filter(x => x !== sub);
                                                        } else {
                                                            next = [...activeSubcategories, sub];
                                                            // Find which niche this sub belongs to for tags
                                                            const parentNiche = topics.find(t => getSubcategories(t).includes(sub));
                                                            if (parentNiche) {
                                                                const nicheTags = HASHTAG_DATABASE[parentNiche]?.[sub] || [];
                                                                const newTags = Array.from(new Set([...tags, ...nicheTags]));
                                                                setTags(newTags.slice(0, 10));
                                                            }
                                                        }
                                                        setSubtopics(next);
                                                    }}
                                                    className={`h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 flex items-center gap-1 ${
                                                        isSelected
                                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                            : isRestricted
                                                            ? "bg-default-100 border-divider text-default-300 cursor-not-allowed opacity-60"
                                                            : "bg-transparent border-divider text-default-400 hover:border-primary/50 hover:text-primary"
                                                    }`}
                                                >
                                                    {isRestricted && <Lock size={8} />}
                                                    {sub}
                                                </button>
                                            );

                                            if (isRestricted) {
                                                return (
                                                    <Tooltip key={sub}>
                                                        <Tooltip.Trigger>
                                                            {content}
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Content placement="top">
                                                            {`${limits.label} plan limit: ${limits.maxSubtopics} sub-categories. Upgrade for more.`}
                                                        </Tooltip.Content>
                                                    </Tooltip>
                                                );
                                            }

                                            return content;
                                        })}
                                        {/* Custom Sub-category inside suggested list area */}
                                        {activeSubcategories.filter(s => !topics.some(t => getSubcategories(t).includes(s))).map(custom => (
                                            <button
                                                key={custom}
                                                type="button"
                                                onClick={() => setSubtopics(activeSubcategories.filter(x => x !== custom))}
                                                className="h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-primary border-primary text-white shadow-lg shadow-primary/20 flex items-center gap-1"
                                            >
                                                {custom}
                                                <span className="opacity-60 ml-1 font-bold text-xs">×</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Input
                                            placeholder="Add custom sub-category..."
                                            value={customSub}
                                            onChange={(e) => setCustomSub(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && customSub.trim()) {
                                                    const val = customSub.trim();
                                                    if (activeSubcategories.length < limits.maxSubtopics && !activeSubcategories.includes(val)) {
                                                        setSubtopics([...activeSubcategories, val]);
                                                        setCustomSub("");
                                                    }
                                                }
                                            }}
                                            className="h-8 text-[10px] bg-default-50/50 border-divider font-bold uppercase tracking-widest"
                                            disabled={activeSubcategories.length >= limits.maxSubtopics}
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 min-w-0 px-2"
                                            onPress={() => {
                                                const val = customSub.trim();
                                                if (val && activeSubcategories.length < limits.maxSubtopics && !activeSubcategories.includes(val)) {
                                                    setSubtopics([...activeSubcategories, val]);
                                                    setCustomSub("");
                                                }
                                            }}
                                            isDisabled={activeSubcategories.length >= limits.maxSubtopics}
                                        >
                                            <Plus size={14} />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Hashtags Pool</Label>
                                    <button 
                                        onClick={() => { setTags([]); }}
                                        className="text-[9px] font-black uppercase tracking-widest text-default-400 hover:text-danger transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
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
