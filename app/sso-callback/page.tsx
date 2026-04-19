import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { Cloud } from 'lucide-react'

export default function SSOCallbackPage() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
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

            <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/onboarding" signInForceRedirectUrl="/dashboard" />
        </div>
    )
}
