"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function AdminCronLogsPage() {
    const cronStatus = useQuery(api.admin.cronLogs.getRecentCronStatus);
    const logs = useQuery(api.admin.cronLogs.getCronLogs);

    if (cronStatus === undefined || logs === undefined) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                <Loader2 size={20} style={{ color: "#3b82f6" }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
                <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Cron Logs</h1>
                <p style={{ fontSize: 13, color: "#52525b", margin: "4px 0 0" }}>Scheduled job health</p>
            </div>

            {/* Job status cards */}
            {cronStatus.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                    {cronStatus.map((job) => {
                        const ok = job.status === "success";
                        return (
                            <div key={job.name} style={{
                                background: "rgba(24,24,27,0.8)", border: `1px solid ${ok ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.2)"}`,
                                borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {job.name.replace(/-/g, " ")}
                                    </span>
                                    {ok
                                        ? <CheckCircle size={14} style={{ color: "#34d399" }} />
                                        : <XCircle size={14} style={{ color: "#f87171" }} />
                                    }
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#52525b" }}>
                                    <Clock size={11} />
                                    {timeAgo(job.timestamp)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Log table */}
            <div style={{ background: "rgba(24,24,27,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["Job", "Status", "Time"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 && (
                            <tr><td colSpan={3} style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "#3f3f46" }}>No logs yet</td></tr>
                        )}
                        {logs.map((log) => {
                            const ok = log.status === "success";
                            return (
                                <tr key={log._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <td style={{ padding: "11px 16px", fontSize: 13, color: "#a1a1aa" }}>{log.name}</td>
                                    <td style={{ padding: "11px 16px" }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700,
                                            color: ok ? "#34d399" : "#f87171",
                                            background: ok ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                                            padding: "3px 8px", borderRadius: 6,
                                        }}>{log.status}</span>
                                    </td>
                                    <td style={{ padding: "11px 16px", fontSize: 12, color: "#52525b" }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
