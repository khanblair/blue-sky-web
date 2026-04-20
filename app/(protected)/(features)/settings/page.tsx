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
    Chip,
} from "@heroui/react";
import {
    Settings as SettingsIcon,
    Key,
    User,
    ShieldCheck,
    RefreshCw,
    Clock,
    Zap,
    MessageSquare,
    Eye,
    EyeOff,
    Loader2,
    MessageCircle,
    Smartphone,
    Send
} from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SettingsPage() {
    const user = useQuery(api.users.getCurrentUser);
    const preferences = useQuery(api.users.getPreferences);
    const integrationDefaults = useQuery(api.users.getIntegrationDefaults);

    // @ts-ignore
    const updateCredentials = useMutation(api.users.createOrUpdateUser);
    // @ts-ignore
    const syncProfile = useAction(api.bluesky?.syncProfile);
    const updatePrefs = useMutation(api.users.updatePreferences);

    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSavingPrefs, setIsSavingPrefs] = useState(false);

    // Form states for preferences
    const [tone, setTone] = useState("professional");
    const [frequency, setFrequency] = useState(24);
    const [isActive, setIsActive] = useState(false);

    // Integrations State
    const [telegramBotToken, setTelegramBotToken] = useState("");
    const [telegramChatId, setTelegramChatId] = useState("");
    const [whatsappTargetNumber, setWhatsappTargetNumber] = useState("");
    const [maytapiProductId, setMaytapiProductId] = useState("");
    const [maytapiPhoneId, setMaytapiPhoneId] = useState("");
    const [maytapiApiToken, setMaytapiApiToken] = useState("");

    useEffect(() => {
        if (user) {
            setHandle(user.handle || "");
            setIsActive(user.isActive);
        }
        if (preferences) {
            setTone(preferences.tone);
            setFrequency(preferences.frequency);
            // Prefer per-user overrides; fall back to globally-configured env var values
            setTelegramBotToken(preferences.telegramBotToken || integrationDefaults?.telegramBotToken || "");
            setTelegramChatId(preferences.telegramChatId || integrationDefaults?.telegramChatId || "");
            setWhatsappTargetNumber(preferences.whatsappTargetNumber || integrationDefaults?.whatsappTargetNumber || "");
            setMaytapiProductId(preferences.maytapiProductId || integrationDefaults?.maytapiProductId || "");
            setMaytapiPhoneId(preferences.maytapiPhoneId || integrationDefaults?.maytapiPhoneId || "");
            setMaytapiApiToken(preferences.maytapiApiToken || integrationDefaults?.maytapiApiToken || "");
        }
    }, [user, preferences, integrationDefaults]);

    const handleUpdateCredentials = async () => {
        setIsUpdatingCreds(true);
        try {
            await updateCredentials({
                handle,
                appPassword: password || user?.appPassword || "",
                isActive
            });
            // Auto sync after credential update
            if (syncProfile) await syncProfile();
            alert("Credentials updated successfully!");
        } catch (err: any) {
            alert("Failed to update credentials: " + err.message);
        } finally {
            setIsUpdatingCreds(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            if (syncProfile) {
                await syncProfile();
                alert("Profile synced with Bluesky!");
            }
        } catch (err: any) {
            alert("Sync failed: " + err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSavePrefs = async () => {
        setIsSavingPrefs(true);
        try {
            await updatePrefs({
                topics: preferences?.topics || [],
                tone,
                frequency,
                telegramBotToken: telegramBotToken || undefined,
                telegramChatId: telegramChatId || undefined,
                whatsappTargetNumber: whatsappTargetNumber || undefined,
                maytapiProductId: maytapiProductId || undefined,
                maytapiPhoneId: maytapiPhoneId || undefined,
                maytapiApiToken: maytapiApiToken || undefined,
            });
            alert("Preferences saved!");
        } catch (err: any) {
            alert("Failed to save preferences");
        } finally {
            setIsSavingPrefs(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header>
                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Settings</h1>
                <p className="text-default-500">Manage your connection and automation behavior</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Connection Settings */}
                <div className="space-y-8">
                    <CardRoot className="bg-surface border-divider border">
                        <CardHeader className="flex flex-col items-start gap-1 p-6">
                            <div className="flex items-center gap-3">
                                <Key className="text-primary" size={20} />
                                <p className="font-black uppercase tracking-widest text-sm">Bluesky Connection</p>
                            </div>
                            <p className="text-xs text-default-500">Update your linked account credentials</p>
                        </CardHeader>
                        <div className="h-px bg-divider w-full" />
                        <CardContent className="p-6 space-y-6">
                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Bluesky Handle</Label>
                                <Input
                                    placeholder="yourname.bsky.social"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    className="bg-default-50 border-divider"
                                />
                            </TextFieldRoot>

                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">App Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••-••••-••••-••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-default-50 border-divider pr-10"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 outline-none"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-default-400 italic">Leave blank to keep current password</p>
                            </TextFieldRoot>

                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-black uppercase tracking-tight">Profile Data</p>
                                    <p className="text-[10px] text-default-500">Refresh your avatar and bio from Bluesky</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onPress={handleSync}
                                    className="font-bold text-[10px] h-8 px-3"
                                    isDisabled={isSyncing}
                                >
                                    {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                                    <span className="ml-1">FORCE SYNC</span>
                                </Button>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20"
                                onPress={handleUpdateCredentials}
                                isDisabled={isUpdatingCreds}
                            >
                                {isUpdatingCreds ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Credentials"
                                )}
                            </Button>
                        </CardContent>
                    </CardRoot>

                </div>

                <div className="space-y-8">
                    <CardRoot className="bg-surface border-divider border">
                        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                            <ShieldCheck className="text-primary w-12 h-12" />
                            <div className="space-y-2">
                                <p className="font-black uppercase tracking-widest text-sm">Security & Privacy</p>
                                <p className="text-sm text-default-500">
                                    Your app password is encrypted at rest and never transmitted over unsecured networks.
                                    Automation only interacts with the Bluesky AT Protocol.
                                </p>
                            </div>
                        </CardContent>
                    </CardRoot>

                </div>
            </div>

            {/* Integrations — full-width below the grid */}
            <CardRoot className="bg-surface border-divider border">
                <CardHeader className="flex flex-col items-start gap-1 p-6">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="text-primary" size={20} />
                        <p className="font-black uppercase tracking-widest text-sm">Integrations</p>
                    </div>
                    <p className="text-xs text-default-500">Configure real-time alerts via Telegram and WhatsApp</p>
                </CardHeader>
                <div className="h-px bg-divider w-full" />
                <CardContent className="p-6 space-y-8">

                    {/* Telegram Section */}
                    <div className="space-y-4">
                        <p className="text-xs font-black tracking-widest uppercase text-white flex items-center gap-2">
                            <Send size={14} className="text-blue-400" /> Telegram
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Bot Token</Label>
                                <Input
                                    placeholder="123456:ABC-DEF1234ghIkl-zyx5c"
                                    value={telegramBotToken}
                                    onChange={(e) => setTelegramBotToken(e.target.value)}
                                    className="bg-default-50 border-divider"
                                />
                            </TextFieldRoot>
                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Chat ID</Label>
                                <Input
                                    placeholder="-1001234567890"
                                    value={telegramChatId}
                                    onChange={(e) => setTelegramChatId(e.target.value)}
                                    className="bg-default-50 border-divider"
                                />
                            </TextFieldRoot>
                        </div>
                    </div>

                    <div className="h-px bg-divider w-full" />

                    {/* WhatsApp Maytapi Section */}
                    <div className="space-y-4">
                        <p className="text-xs font-black tracking-widest uppercase text-white flex items-center gap-2">
                            <Smartphone size={14} className="text-green-500" /> WhatsApp (Maytapi)
                        </p>
                        <TextFieldRoot className="flex flex-col gap-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Target Number</Label>
                            <Input
                                placeholder="Country code + number (e.g. 254742736501)"
                                value={whatsappTargetNumber}
                                onChange={(e) => setWhatsappTargetNumber(e.target.value)}
                                className="bg-default-50 border-divider"
                            />
                        </TextFieldRoot>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Product ID</Label>
                                <Input
                                    placeholder="0d0f0dd3-..."
                                    value={maytapiProductId}
                                    onChange={(e) => setMaytapiProductId(e.target.value)}
                                    className="bg-default-50 border-divider"
                                />
                            </TextFieldRoot>
                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">Phone ID</Label>
                                <Input
                                    placeholder="140393"
                                    value={maytapiPhoneId}
                                    onChange={(e) => setMaytapiPhoneId(e.target.value)}
                                    className="bg-default-50 border-divider"
                                />
                            </TextFieldRoot>
                            <TextFieldRoot className="flex flex-col gap-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">API Token</Label>
                                <Input
                                    type="password"
                                    placeholder="ddc6fce9-..."
                                    value={maytapiApiToken}
                                    onChange={(e) => setMaytapiApiToken(e.target.value)}
                                    className="bg-default-50 border-divider"
                                />
                            </TextFieldRoot>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        className="w-full font-black uppercase tracking-widest text-xs h-11"
                        onPress={handleSavePrefs}
                        isDisabled={isSavingPrefs}
                    >
                        {isSavingPrefs ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={16} />
                                Saving...
                            </>
                        ) : (
                            "Save Integrations"
                        )}
                    </Button>
                </CardContent>
            </CardRoot>
        </div>
    );
}
