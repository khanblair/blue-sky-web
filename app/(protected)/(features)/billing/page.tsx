"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    CardRoot,
    CardHeader,
    CardContent,
    Button,
    Chip,
    Input,
    Label,
    TextFieldRoot,
} from "@heroui/react";
import {
    WalletCards,
    Check,
    Copy,
    ExternalLink,
    Loader2,
    Sparkles,
    ShieldCheck,
    Clock,
    AlertCircle,
    Crown,
    Zap,
    Globe,
    Feather,
} from "lucide-react";
import { PlanCard } from "@/components/subscription/PlanCard";
import { UsageBar, PageHeader } from "@/components/ui";
import { PLAN_LIMITS, CRYPTO_WALLETS, type PlanId } from "@/lib/plans";
import { format } from "date-fns";

type PaymentStep = "select_plan" | "choose_method" | "submit_proof" | "pending" | "confirmed";

export default function BillingPage() {
    const planDetails = useQuery(api.subscriptions.getPlanDetails);
    const currentSub = useQuery(api.subscriptions.getCurrentSubscription);
    const submitProof = useMutation(api.subscriptions.submitPaymentProof);

    const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");
    const [step, setStep] = useState<PaymentStep>("select_plan");
    const [selectedWallet, setSelectedWallet] = useState<string>("usdc_base");
    const [txHash, setTxHash] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const plan = planDetails?.plan ?? "starter";
    const limits = planDetails?.limits ?? PLAN_LIMITS.starter;
    const usage = planDetails?.usage;

    const wallet = CRYPTO_WALLETS[selectedWallet as keyof typeof CRYPTO_WALLETS];
    
    // Calculate display price based on billing cycle
    const getDisplayPrice = (pId: PlanId) => {
        const basePrice = PLAN_LIMITS[pId].priceUsd;
        if (basePrice === 0) return 0;
        if (billingCycle === "yearly") return basePrice * 10;
        if (billingCycle === "quarterly") return Math.round(basePrice * 2.8);
        return basePrice;
    };

    const displayPrice = getDisplayPrice(selectedPlan);

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    const handleSubmitProof = async () => {
        if (!txHash.trim()) return;
        setIsSubmitting(true);
        try {
            await submitProof({
                plan: selectedPlan,
                billingCycle,
                txHash: txHash.trim(),
                walletAddress: walletAddress.trim() || undefined,
                amountPaid: displayPrice,
                currency: wallet?.symbol ?? "USDC",
            });
            setStep("pending");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            alert(message || "Failed to submit proof");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (planDetails === undefined || currentSub === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-12">
            <PageHeader title="Billing" subtitle="Manage your subscription and view usage" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardRoot className={`bg-surface border ${plan === "pro" ? "border-primary/50" : plan === "enterprise" ? "border-warning/50" : plan === "standard" ? "border-violet-500/50" : plan === "lite" ? "border-sky-400/50" : "border-divider/50"}`}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                plan === "enterprise" ? "bg-warning/10" : plan === "pro" ? "bg-primary/10" : plan === "standard" ? "bg-violet-500/10" : plan === "lite" ? "bg-sky-400/10" : "bg-default-100"
                            }`}>
                                {plan === "enterprise" ? <Crown size={20} className="text-warning" /> :
                                 plan === "pro" ? <Zap size={20} className="text-primary" /> :
                                 plan === "standard" ? <Globe size={20} className="text-violet-400" /> :
                                 plan === "lite" ? <Feather size={20} className="text-sky-400" /> :
                                 <ShieldCheck size={20} className="text-default-400" />}
                            </div>
                            <div>
                                <p className="font-black uppercase tracking-widest text-white">{limits.label}</p>
                                <p className="text-[10px] text-default-500 uppercase tracking-widest">Current Plan</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <UsageBar
                                label="AI Generations"
                                current={usage?.aiGenerationsUsed ?? 0}
                                limit={limits.aiGenerationsPerMonth}
                            />
                            <UsageBar
                                label="Posts Published"
                                current={usage?.postsPublished ?? 0}
                                limit={limits.postsPerMonth}
                            />
                        </div>
{currentSub && currentSub.plan !== "starter" && (
                            <div className="mt-4 p-3 bg-default-50 rounded-xl">
                                <p className="text-[10px] font-bold text-default-500 uppercase tracking-widest">
                                    Renews {currentSub.currentPeriodEnd !== Infinity
                                        ? format(new Date(currentSub.currentPeriodEnd), "MMM d, yyyy")
                                        : "N/A"
                                    }
                                </p>
                            </div>
                        )}
                    </CardContent>
                </CardRoot>
            </div>

            {step === "select_plan" && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black uppercase tracking-widest text-white">Choose a Plan</h2>
                        <div className="flex items-center gap-1 p-1 bg-default-50 border border-divider rounded-xl">
                            {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                                <button
                                    key={cycle}
                                    onClick={() => setBillingCycle(cycle)}
                                    className={`px-4 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        billingCycle === cycle ? "bg-primary text-white shadow" : "text-default-400 hover:text-white"
                                    }`}
                                >
                                    {cycle}
                                    {cycle === "yearly" && <span className="ml-1 text-[8px] text-success">-17%</span>}
                                    {cycle === "quarterly" && <span className="ml-1 text-[8px] text-success">-7%</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(["starter", "lite", "basic", "pro", "standard", "enterprise"] as PlanId[]).map((pid) => (
                            <PlanCard
                                key={pid}
                                planId={pid}
                                isCurrent={plan === pid}
                                billingCycle={billingCycle}
                                onSelect={() => {
                                    if (pid === "starter") return;
                                    setSelectedPlan(pid);
                                    setStep("choose_method");
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {step === "choose_method" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-widest text-white">Pay with Crypto</h2>
                        <button
                            onClick={() => setStep("select_plan")}
                            className="text-[10px] font-black uppercase tracking-widest text-default-400 hover:text-white transition-colors"
                        >
                            ← Back to plans
                        </button>
                    </div>
                    <p className="text-sm text-default-500">
                        Send <strong>{displayPrice} {wallet?.symbol}</strong> to the address below for the <strong>{PLAN_LIMITS[selectedPlan].label}</strong> plan ({billingCycle}).
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(CRYPTO_WALLETS).map(([key, w]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedWallet(key)}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                    selectedWallet === key
                                        ? "border-primary bg-primary/5"
                                        : "border-divider bg-surface hover:border-primary/30"
                                }`}
                            >
                                <p className="text-xs font-black uppercase tracking-widest text-white">{w.symbol}</p>
                                <p className="text-[10px] text-default-500">{w.network}</p>
                            </button>
                        ))}
                    </div>

                    {wallet && (
                        <CardRoot className="bg-surface border-divider border">
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">
                                        Send {wallet.symbol} to this address
                                    </Label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="flex-1 text-xs font-mono bg-default-50 border border-divider rounded-xl px-4 py-3 text-white break-all">
                                            {wallet.address}
                                        </code>
                                        <button
                                            onClick={() => handleCopyAddress(wallet.address)}
                                            className="h-10 w-10 rounded-xl border border-divider flex items-center justify-center hover:bg-default-50 transition-colors"
                                        >
                                            {copiedAddress === wallet.address ? (
                                                <Check size={14} className="text-success" />
                                            ) : (
                                                <Copy size={14} className="text-default-400" />
                                            )}
                                        </button>
                                    </div>
                                    {"contractAddress" in wallet && (
                                        <div className="mt-2">
                                            <Label className="text-[9px] text-default-500">Contract: {wallet.contractAddress}</Label>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
                                    <p className="text-[10px] font-bold text-warning uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <AlertCircle size={12} /> Important
                                    </p>
                                    <p className="text-xs text-default-500">
                                        Send exactly the required amount on the {wallet.network} network. Include your transaction hash below after sending.
                                    </p>
                                </div>

                                <TextFieldRoot className="flex flex-col gap-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">
                                        Transaction Hash
                                    </Label>
                                    <Input
                                        placeholder="0x... or btc txid"
                                        value={txHash}
                                        onChange={(e) => setTxHash(e.target.value)}
                                        className="bg-default-50 border-divider"
                                    />
                                </TextFieldRoot>

                                <TextFieldRoot className="flex flex-col gap-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">
                                        Your Wallet Address (optional)
                                    </Label>
                                    <Input
                                        placeholder="0x... (the address you sent from)"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                        className="bg-default-50 border-divider"
                                    />
                                </TextFieldRoot>

                                <Button
                                    variant="primary"
                                    className="w-full font-black uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20"
                                    onPress={handleSubmitProof}
                                    isDisabled={isSubmitting || !txHash.trim()}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="animate-spin mr-2" size={16} />Verifying...</>
                                    ) : (
                                        <><WalletCards size={16} className="mr-2" />Submit Payment Proof</>
                                    )}
                                </Button>
                            </CardContent>
                        </CardRoot>
                    )}
                </div>
            )}

            {step === "pending" && (
                <CardRoot className="bg-surface border-divider border">
                    <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                            <Clock className="text-warning" size={32} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-widest text-white">Payment Pending Verification</h2>
                        <p className="text-sm text-default-500 max-w-md">
                            Your payment proof has been submitted. We verify crypto payments manually — this usually takes 1-12 hours.
                            You&apos;ll have full access once verified.
                        </p>
                        <Button
                            variant="outline"
                            className="font-bold mt-4"
                            onPress={() => {
                                setStep("select_plan");
                                setTxHash("");
                                setWalletAddress("");
                            }}
                        >
                            Back to Plans
                        </Button>
                    </CardContent>
                </CardRoot>
            )}

            {currentSub && currentSub.plan !== "starter" && (
                <CardRoot className="bg-surface border-divider border">
                    <CardHeader className="flex gap-3 p-6">
                        <Sparkles className="text-primary" size={20} />
                        <div className="flex flex-col text-left">
                            <p className="font-black uppercase tracking-widest text-sm text-white">Subscription Status</p>
                            <p className="text-xs text-default-500">Your current subscription details</p>
                        </div>
                    </CardHeader>
                    <div className="h-px bg-divider w-full" />
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-1">Plan</p>
                                <p className="text-lg font-black text-white">{PLAN_LIMITS[currentSub.plan as PlanId]?.label ?? currentSub.plan}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-1">Status</p>
                                <Chip variant="soft" color={currentSub.status === "active" ? "success" : "warning"} size="sm" className="font-black text-[9px] uppercase">
                                    {currentSub.status}
                                </Chip>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-1">Payment</p>
                                <p className="text-sm font-bold text-white">{currentSub.paymentMethod ?? "crypto"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-1">Renews</p>
                                <p className="text-sm font-bold text-white">
                                    {currentSub.currentPeriodEnd !== Infinity
                                        ? format(new Date(currentSub.currentPeriodEnd), "MMM d, yyyy")
                                        : "N/A"
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </CardRoot>
            )}
        </div>
    );
}