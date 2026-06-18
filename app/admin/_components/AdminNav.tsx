"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Activity, ShieldCheck } from "lucide-react";

const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/admin/cron-logs", label: "Cron Logs", icon: Activity },
];

export function AdminNav() {
    const pathname = usePathname();

    return (
        <aside style={{
            width: 220,
            flexShrink: 0,
            background: "rgba(24,24,27,0.6)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            minHeight: "100vh",
            padding: "24px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
                <ShieldCheck size={18} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>Admin Panel</span>
            </div>
            {links.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                    <Link key={href} href={href} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 10, textDecoration: "none",
                        fontSize: 13, fontWeight: 600,
                        background: active ? "rgba(37,99,235,0.15)" : "transparent",
                        color: active ? "#93c5fd" : "#71717a",
                        transition: "all 0.15s",
                    }}>
                        <Icon size={16} />
                        {label}
                    </Link>
                );
            })}
        </aside>
    );
}
