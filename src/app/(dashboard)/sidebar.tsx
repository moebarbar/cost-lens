"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/overview",    icon: "◈", label: "Overview" },
  { href: "/costs",       icon: "◉", label: "Cost Explorer" },
  { href: "/teams",       icon: "◐", label: "Teams" },
  { href: "/alerts",      icon: "◬", label: "Alerts" },
  { href: "/connectors",  icon: "◌", label: "Connectors" },
  { href: "/optimize",    icon: "◆", label: "Optimize" },
];

interface Props {
  orgName: string;
  userName: string;
  userEmail: string;
}

export function DashboardSidebar({ orgName, userName, userEmail }: Props) {
  const pathname = usePathname();

  return (
    <aside style={{
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      width: "240px",
      background: "rgba(13,21,38,0.95)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
      backdropFilter: "blur(10px)",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "var(--accent)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px",
            flexShrink: 0,
          }}>💡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>CostLens</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{orgName}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--accent)" : "var(--text-muted)",
                background: active ? "var(--accent-dim)" : "transparent",
                transition: "all var(--transition)",
                border: active ? "1px solid rgba(0,212,170,0.15)" : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: "16px", opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
              {active && (
                <div style={{
                  marginLeft: "auto",
                  width: "4px", height: "4px",
                  background: "var(--accent)",
                  borderRadius: "50%",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sync button */}
      <div style={{ padding: "0 12px 12px" }}>
        <button
          className="btn btn-secondary"
          style={{ width: "100%", fontSize: "13px", padding: "8px 12px" }}
          onClick={async () => {
            await fetch("/api/connectors/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullSync: false }) });
          }}
        >
          ↻ Sync Now
        </button>
      </div>

      {/* User footer */}
      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <div style={{
          width: "32px", height: "32px",
          background: "var(--accent-dim)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--accent)",
          flexShrink: 0,
        }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
          <div style={{ fontSize: "11px", color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "16px", padding: "4px",
            transition: "color var(--transition)",
            flexShrink: 0,
          }}
          title="Sign out"
        >
          ⎋
        </button>
      </div>
    </aside>
  );
}
