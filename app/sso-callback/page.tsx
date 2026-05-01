"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Cloud, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SSOCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const errorCode = searchParams.get("error_code");
        const status = searchParams.get("status");

        if (errorCode === "oauth_access_denied" || errorCode === "oauth_token_revoked") {
            setError("You cancelled the sign-in process.");
        } else if (status === "abandoned") {
            setError("Sign-in was abandoned. Please try again.");
        } else if (errorCode) {
            setError("Authentication failed. Please try again.");
        }
    }, [searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4">
                <div className="flex flex-col items-center gap-6 max-w-md text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
                        <AlertCircle className="text-red-400 w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white tracking-tight">Sign-in Cancelled</h2>
                        <p className="text-zinc-400 text-sm">{error}</p>
                    </div>
                    <Link
                        href="/"
                        className="px-6 h-11 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
                        <Cloud className="text-blue-500 w-10 h-10 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 border-t-2 border-blue-500 rounded-2xl animate-spin"></div>
                </div>
                <div className="space-y-1 text-center">
                    <h2 className="text-xl font-bold text-white tracking-tight">Authenticating...</h2>
                    <p className="text-zinc-400 text-sm">Please wait while we log you in</p>
                </div>
            </div>

            <AuthenticateWithRedirectCallback
                signUpForceRedirectUrl="/onboarding"
                signInForceRedirectUrl="/dashboard"
            />
        </div>
    );
}