"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, ShieldCheck, UserX, UserCheck } from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
    starter: "#52525b", lite: "#16a34a", basic: "#2563eb",
    pro: "#7c3aed", standard: "#db2777", enterprise: "#ea580c",
};

export default function AdminUsersPage() {
    const users = useQuery(api.admin.users.listUsers);
    const setRole = useMutation(api.admin.users.setUserRole);
    const deactivate = useMutation(api.admin.users.deactivateUser);
    const reactivate = useMutation(api.admin.users.reactivateUser);

    if (users === undefined) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                <Loader2 size={20} style={{ color: "#3b82f6" }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Users</h1>
                <p style={{ fontSize: 13, color: "#52525b", margin: "4px 0 0" }}>{users.length} total accounts</p>
            </div>

            <div style={{ background: "rgba(24,24,27,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["Handle", "Plan", "Role", "Status", "Actions"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <td style={{ padding: "13px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        {user.bskyAvatar && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.bskyAvatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                                        )}
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>{user.handle ?? "—"}</div>
                                            <div style={{ fontSize: 11, color: "#52525b" }}>{user.bskyDisplayName || ""}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "13px 16px" }}>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, textTransform: "capitalize",
                                        color: PLAN_COLORS[user.plan] ?? "#71717a",
                                        background: `${PLAN_COLORS[user.plan] ?? "#71717a"}18`,
                                        padding: "3px 8px", borderRadius: 6,
                                    }}>{user.plan}</span>
                                </td>
                                <td style={{ padding: "13px 16px" }}>
                                    {user.role === "admin" ? (
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", background: "rgba(251,191,36,0.1)", padding: "3px 8px", borderRadius: 6 }}>Admin</span>
                                    ) : (
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#71717a", background: "rgba(113,113,122,0.1)", padding: "3px 8px", borderRadius: 6 }}>User</span>
                                    )}
                                </td>
                                <td style={{ padding: "13px 16px" }}>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700,
                                        color: user.isActive ? "#34d399" : "#71717a",
                                        background: user.isActive ? "rgba(52,211,153,0.1)" : "rgba(113,113,122,0.1)",
                                        padding: "3px 8px", borderRadius: 6,
                                    }}>{user.isActive ? "Active" : "Inactive"}</span>
                                </td>
                                <td style={{ padding: "13px 16px" }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                            title={user.role === "admin" ? "Revoke admin" : "Make admin"}
                                            onClick={() => setRole({ userId: user._id as Id<"users">, role: user.role === "admin" ? "user" : "admin" })}
                                            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
                                        >
                                            <ShieldCheck size={13} style={{ color: "#fbbf24" }} />
                                        </button>
                                        <button
                                            title={user.isActive ? "Deactivate" : "Reactivate"}
                                            onClick={() => user.isActive ? deactivate({ userId: user._id as Id<"users"> }) : reactivate({ userId: user._id as Id<"users"> })}
                                            style={{ background: user.isActive ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)", border: `1px solid ${user.isActive ? "rgba(239,68,68,0.2)" : "rgba(52,211,153,0.2)"}`, borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
                                        >
                                            {user.isActive ? <UserX size={13} style={{ color: "#f87171" }} /> : <UserCheck size={13} style={{ color: "#34d399" }} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
