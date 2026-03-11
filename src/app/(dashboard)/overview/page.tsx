"use client";

import { useDashboard } from "@/hooks/use-api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#00D4AA", "#D4A574", "#FF9900", "#0078D4", "#4285F4"];

function StatCard({ label, value, sub, trend, accent }: {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  accent?: boolean;
}) {
  const trendClass = trend == null ? "" : trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "trend-flat";
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
        {trend != null && (
          <span className={trendClass} style={{ fontSize: "12px", fontWeight: 600 }}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "—"} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="stat-value" style={{ color: accent ? "var(--accent)" : undefined }}>{value}</div>
      {sub && <div style={{ fontSize: "13px", color: "var(--text-subtle)", marginTop: "6px" }}>{sub}</div>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ width: "60%", height: "14px", marginBottom: "12px" }} />
            <div className="skeleton" style={{ width: "80%", height: "32px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { data, loading, error } = useDashboard("30d", "day");

  if (loading) return <LoadingSkeleton />;
  if (error) return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
      <p style={{ fontSize: "16px", marginBottom: "8px" }}>⚠ Failed to load dashboard</p>
      <p style={{ fontSize: "13px" }}>{error}</p>
    </div>
  );

  const overview = data?.overview;
  const byProvider = data?.byProvider ?? [];
  const timeSeries = data?.timeSeries ?? [];
  const anomalies = data?.anomalies ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>Overview</h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Last 30 days</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
        <StatCard
          label="Total AI Spend"
          value={`$${(overview?.totalSpend ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend={overview?.spendChange}
          accent
        />
        <StatCard
          label="Active Tools"
          value={String(overview?.activeTools ?? 0)}
          sub={`+${overview?.newToolsThisPeriod ?? 0} new this period`}
        />
        <StatCard
          label="Waste Detected"
          value={`$${(overview?.wasteDetected ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="Estimated saveable spend"
        />
        <StatCard
          label="ROI Score"
          value={overview?.roiScore != null ? `${overview.roiScore}/100` : "N/A"}
          sub="Based on usage patterns"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
        {/* Time Series */}
        <div className="card">
          <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Spend Over Time</h2>
          {timeSeries.length === 0 ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-subtle)", fontSize: "14px" }}>
              No data — connect a provider to see spend trends
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: number) => [`$${v.toFixed(2)}`, "Spend"]}
                  contentStyle={{ background: "#1A2235", border: "1px solid var(--border)", borderRadius: "10px" }}
                  labelStyle={{ color: "var(--text-muted)" }}
                />
                <Line type="monotone" dataKey="totalCost" stroke="var(--accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Provider Breakdown */}
        <div className="card">
          <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>By Provider</h2>
          {byProvider.length === 0 ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-subtle)", fontSize: "14px", textAlign: "center" }}>
              No providers connected yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={byProvider} dataKey="totalCost" nameKey="displayName" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                    {byProvider.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ background: "#1A2235", border: "1px solid var(--border)", borderRadius: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {byProvider.slice(0, 4).map((p, i) => (
                  <div key={p.provider} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", flex: 1 }}>{p.displayName}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>{p.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>⚡ Anomalies & Alerts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {anomalies.map(a => (
              <div key={a.id} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "14px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}>
                <span className={`badge badge-${a.severity === "high" ? "error" : a.severity === "medium" ? "warning" : "info"}`}>
                  {a.severity}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{a.title}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{a.description}</div>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--accent)", flexShrink: 0 }}>
                  ${a.estimatedImpact.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
