import { SignUp } from "@clerk/nextjs";
import { Cloud } from "lucide-react";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
            <div className="flex flex-col items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Cloud className="text-primary w-10 h-10" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-black tracking-tight text-white">Create Account</h1>
                    <p className="text-zinc-400 text-sm mt-1">Start automating your Bluesky with AI</p>
                </div>
            </div>
            <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-zinc-950/50 border border-white/10 shadow-2xl",
                        headerTitle: "text-white",
                        headerSubtitle: "text-zinc-400",
                        formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
                        footerActionLink: "text-primary hover:text-primary/80",
                        formFieldInput: "bg-zinc-900 border-white/10 text-white focus:border-primary",
                        formFieldLabel: "text-zinc-300",
                        dividerLine: "bg-white/10",
                        dividerText: "text-zinc-500",
                        socialButtonsBlockButton: "border-white/10 text-white hover:bg-white/5",
                        socialButtonsBlockButtonText: "text-zinc-300",
                    },
                }}
            />
        </div>
    );
}