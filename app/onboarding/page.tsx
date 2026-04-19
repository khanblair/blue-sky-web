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
import { Cloud, ArrowRight, ArrowLeft, ShieldCheck, Key, User } from "lucide-react";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);

    return (
        <div className="max-w-xl mx-auto py-12">
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
                                className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                            />
                        </TextFieldRoot>
                        <Button variant="primary" className="font-bold mt-4" onPress={() => setStep(2)}>
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
                                <li>Create one named "BlueSky AI"</li>
                            </ol>
                        </div>

                        <TextFieldRoot className="flex flex-col gap-2">
                            <Label className="text-sm font-semibold">App Password</Label>
                            <Input
                                placeholder="xxxx-xxxx-xxxx-xxxx"
                                type="password"
                                className="px-3 py-2 bg-default-100 rounded-lg text-sm border border-transparent focus:border-primary outline-none transition-colors"
                            />
                        </TextFieldRoot>

                        <div className="flex gap-4 mt-4">
                            <Button variant="ghost" className="font-bold flex-1" onPress={() => setStep(1)}>
                                <ArrowLeft size={18} className="mr-2" />
                                Back
                            </Button>
                            <Button variant="primary" className="font-bold flex-1" onPress={() => setStep(3)}>
                                Secure Connect
                                <ArrowRight size={18} className="ml-2" />
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
                            <h1 className="text-4xl font-black tracking-tight">You're All Set!</h1>
                            <p className="text-default-500 max-w-xs mx-auto">Your account is connected and encrypted. Let's take you to the dashboard.</p>
                        </div>
                        <Link href="/dashboard" className={buttonVariants({ variant: "primary", className: "font-bold px-12 shadow-lg shadow-primary/20" })}>
                            Go to Dashboard
                        </Link>
                    </CardContent>
                </CardRoot>
            )}
        </div>
    );
}
