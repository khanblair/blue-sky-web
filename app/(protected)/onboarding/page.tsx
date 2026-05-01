"use client";

import { useState } from "react";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
    TextFieldRoot,
    Label,
    Input,
    Link,
} from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { Cloud, ArrowRight, ArrowLeft, ShieldCheck, Key, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createUser = useMutation(api.users.createOrUpdateUser);
    const syncProfile = useAction(api.bluesky.syncProfile);

    const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const selectionStart = e.target.selectionStart;

        if (value && !value.includes(".") && !handle.includes(".")) {
            const newHandle = value + ".bsky.social";
            setHandle(newHandle);
            setTimeout(() => {
                e.target.setSelectionRange(selectionStart, selectionStart);
            }, 0);
        } else {
            setHandle(value);
        }
    };

    const handleConnect = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Starting onboarding connection for handle:", handle);

            // 1. Save credentials
            await createUser({
                handle,
                appPassword: password,
                isActive: true
            });
            console.log("Credentials saved successfully");

            // 2. Sync profile metadata
            console.log("Triggering profile sync...");
            await syncProfile();
            console.log("Profile sync complete");

            setStep(3);
        } catch (err: unknown) {
            console.error("Connection failed with error:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (errorMessage.includes("Not authenticated")) {
                setError("Convex could not verify your Clerk identity. Please ensure you have created a JWT Template named 'convex' in your Clerk Dashboard.");
            } else {
                setError(errorMessage || "Failed to connect to Bluesky. Please check your credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-default-400">
                    <span>Step {step} of 3</span>
                    <span>{Math.round((step / 3) * 100)}% Complete</span>
                </div>
                <div className="w-full h-1 bg-divider rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            {step === 1 && (
                <CardRoot className="p-8 bg-surface border-divider border animate-in slide-in-from-right duration-500">
                    <CardHeader className="flex flex-col items-start gap-2 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                            <User className="text-primary" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Identify Yourself</h1>
                        <p className="text-default-500 lowercase">Tell us your Bluesky handle to get started</p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <TextFieldRoot className="flex flex-col gap-2">
                            <Label className="text-sm font-semibold">Bluesky Handle</Label>
                            <Input
                                placeholder="name.bsky.social"
                                value={handle}
                                onChange={handleHandleChange}
                                className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                            />
                        </TextFieldRoot>
                        <Button variant="primary" className="font-bold mt-4" onPress={() => setStep(2)} isDisabled={!handle}>
                            Continue
                            <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </CardContent>
                </CardRoot>
            )}

            {step === 2 && (
                <CardRoot className="p-8 bg-surface border-divider border animate-in slide-in-from-right duration-500">
                    <CardHeader className="flex flex-col items-start gap-2 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center mb-2">
                            <Key className="text-warning" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Connect Securely</h1>
                        <p className="text-default-500 lowercase">Use an App Password for maximum security</p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="p-4 rounded-2xl bg-default-100 border border-divider text-xs leading-relaxed">
                            <p className="font-bold mb-2 uppercase tracking-wider text-[10px] text-default-500">How to get an App Password:</p>
                            <ol className="list-decimal list-inside flex flex-col gap-2 opacity-70">
                                <li>Open <Link href="https://bsky.app" className="underline font-bold">Bluesky Settings</Link></li>
                                <li>Go to <span className="font-bold">Privacy and Security</span></li>
                                <li>Select <span className="font-bold">App Passwords</span></li>
                                <li>Create one named &ldquo;BlueSky AI&rdquo;</li>
                            </ol>
                        </div>

                        <TextFieldRoot className="flex flex-col gap-2">
                            <Label className="text-sm font-semibold">App Password</Label>
                            <div className="relative">
                                <Input
                                    placeholder="xxxx-xxxx-xxxx-xxxx"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </TextFieldRoot>

                        {error && (
                            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-center">
                                <p className="text-xs text-danger font-bold uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-4 mt-4">
                            <Button variant="ghost" className="font-bold flex-1" onPress={() => setStep(1)}>
                                <ArrowLeft size={18} className="mr-2" />
                                Back
                            </Button>
                            <Button variant="primary" className="font-bold flex-1" onPress={handleConnect} isDisabled={isLoading || !password}>
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        Secure Connect
                                        <ArrowRight size={18} className="ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </CardRoot>
            )}

            {step === 3 && (
                <CardRoot className="p-8 bg-surface border-divider border animate-in zoom-in duration-500 text-center flex flex-col items-center">
                    <CardContent className="gap-8 py-8 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-4">
                            <ShieldCheck size={48} className="text-success" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-black tracking-tight">You&apos;re All Set!</h1>
                            <p className="text-default-500 max-w-xs mx-auto">Your account is connected and encrypted. Let&apos;s take you to the dashboard.</p>
                        </div>
                        <Button
                            variant="primary"
                            className="font-bold px-12 shadow-lg shadow-primary/20"
                            onPress={() => router.push("/dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </CardRoot>
            )}
        </div>
    );
}
