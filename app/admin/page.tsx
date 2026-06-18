"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, CreditCard, FileText, Sparkles, TrendingUp, MessageSquare, Activity, XCircle, Loader2 } from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
    starter: "#52525b", lite: "#16a34a", basic: "#2563eb",
    pro: "#7c3aed", standard: "#db2777", enterprise: "#ea580c",
};

function StatCard({ label, value, icon: Icon, color = "#3b82f6", sub }: {
    label: string; value: string | number; icon: React.ElementType; color?: string; sub?: string;
}) {
    return (
        <div style={{
            background: "rgba(24,24,27,0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "22px 22px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
            minHeight: 120,
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={15} style={{ color }} />
                </div>
            </div>
            <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-1px" }}>{value}</div>
                {sub && <div style={{ fontSize: 11, color: "#3f3f46", marginTop: 5 }}>{sub}</div>}
            </div>
        </div>
    );
}

export default function AdminOverviewPage() {
    const metrics = useQuery(api.admin.metrics.getPlatformMetrics);

    if (metrics === undefined) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                <Loader2 size={20} style={{ color: "#3b82f6" }} className="animate-spin" />
            </div>
        );
    }

    const cards = [
        { label: "Total Users",      value: metrics.totalUsers,          icon: Users,          color: "#3b82f6", sub: `${metrics.activeUsers} active` },
        { label: "Paid Subs",        value: metrics.paidSubscriptions,   icon: CreditCard,     color: "#10b981", sub: `${metrics.pendingVerifications} pending review` },
        { label: "Est. MRR",         value: `$${metrics.estimatedMrr}`,  icon: TrendingUp,     color: "#f59e0b", sub: "based on active plans" },
        { label: "Posts Published",  value: metrics.totalPostsPublished, icon: FileText,       color: "#8b5cf6", sub: `${metrics.totalPostsInHistory} in history` },
        { label: "AI Generations",   value: metrics.totalAiGenerations,  icon: Sparkles,       color: "#ec4899", sub: "all time" },
        { label: "Auto Replies",     value: metrics.totalAutoReplies,    icon: MessageSquare,  color: "#06b6d4", sub: "automated responses" },
        { label: "Engagements",      value: metrics.totalEngagementActions, icon: Activity,   color: "#84cc16", sub: "likes + comments" },
        { label: "Failed Posts",     value: metrics.totalFailedPosts,    icon: XCircle,        color: "#ef4444", sub: "publishing errors" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
                <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Overview</h1>
                <p style={{ fontSize: 13, color: "#52525b", margin: "4px 0 0" }}>Platform-wide stats</p>
            </div>

            {/* 4 × 2 uniform grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {cards.map((c) => (
                    <StatCard key={c.label} {...c} />
                ))}
            </div>

            {/* Plan breakdown */}
            {Object.keys(metrics.planBreakdown).length > 0 && (
                <div style={{ background: "rgba(24,24,27,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 22px" }}>
                    <h2 style={{ fontSize: 11, fontWeight: 700, color: "#52525b", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Plan Breakdown</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {Object.entries(metrics.planBreakdown).map(([plan, count]) => (
                            <div key={plan} style={{
                                display: "flex", alignItems: "center", gap: 8,
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 8, padding: "7px 13px",
                            }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: PLAN_COLORS[plan] ?? "#71717a", flexShrink: 0 }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", textTransform: "capitalize" }}>{plan}</span>
                                <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
