"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
    active: { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    pending_verification: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    canceled: { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
    rejected: { color: "#f87171", bg: "rgba(239,68,68,0.1)" },
    expired: { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
};

const PLAN_COLORS: Record<string, string> = {
    starter: "#52525b", lite: "#16a34a", basic: "#2563eb",
    pro: "#7c3aed", standard: "#db2777", enterprise: "#ea580c",
};

function fmt(ts: number) {
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminSubscriptionsPage() {
    const pending = useQuery(api.admin.subscriptions.getPendingSubscriptions);
    const all = useQuery(api.admin.subscriptions.getAllSubscriptions);
    const verify = useMutation(api.admin.subscriptions.verifySubscription);

    if (pending === undefined || all === undefined) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                <Loader2 size={20} style={{ color: "#3b82f6" }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
                <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Subscriptions</h1>
                <p style={{ fontSize: 13, color: "#52525b", margin: "4px 0 0" }}>{all.length} total · {pending.length} pending review</p>
            </div>

            {/* Pending queue */}
            {pending.length > 0 && (
                <div>
                    <h2 style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        ⚠ Pending Verification ({pending.length})
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {pending.map((sub) => (
                            <div key={sub._id} style={{
                                background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)",
                                borderRadius: 12, padding: "16px 18px",
                                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                            }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{sub.user.handle}</div>
                                    <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>
                                        Plan: <span style={{ color: PLAN_COLORS[sub.plan] ?? "#fff", textTransform: "capitalize" }}>{sub.plan}</span>
                                        {sub.txHash && <> · TX: <span style={{ fontFamily: "monospace", color: "#a1a1aa" }}>{sub.txHash.slice(0, 16)}…</span></>}
                                        {sub.amountPaid && <> · ${sub.amountPaid} {sub.currency}</>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => verify({ subscriptionId: sub._id as Id<"subscriptions">, approve: true })}
                                        style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#34d399" }}
                                    >
                                        <CheckCircle size={14} /> Approve
                                    </button>
                                    <button
                                        onClick={() => verify({ subscriptionId: sub._id as Id<"subscriptions">, approve: false })}
                                        style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#f87171" }}
                                    >
                                        <XCircle size={14} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All subscriptions */}
            <div style={{ background: "rgba(24,24,27,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["User", "Plan", "Status", "Method", "Period End"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {all.map((sub) => {
                            const sc = STATUS_COLORS[sub.status] ?? { color: "#71717a", bg: "rgba(113,113,122,0.1)" };
                            return (
                                <tr key={sub._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>{sub.user.handle ?? "—"}</td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", color: PLAN_COLORS[sub.plan] ?? "#fff", background: `${PLAN_COLORS[sub.plan] ?? "#71717a"}18`, padding: "3px 8px", borderRadius: 6 }}>{sub.plan}</span>
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg, padding: "3px 8px", borderRadius: 6 }}>{sub.status.replace("_", " ")}</span>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#71717a" }}>{sub.paymentMethod ?? "—"}</td>
                                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#71717a" }}>{fmt(sub.currentPeriodEnd)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
