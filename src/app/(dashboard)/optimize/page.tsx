"use client";

import { useOptimizations } from "@/hooks/use-api";

export default function OptimizePage() {
  const { data, loading, error } = useOptimizations();

  const suggestions = data?.suggestions ?? [];
  const totalSavings = data?.totalSavings ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Optimize</h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>AI-powered recommendations to reduce your spend</p>
      </div>

      {/* Summary Banner */}
      {totalSavings > 0 && (
        <div style={{
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(0,212,170,0.04) 100%)",
          border: "1px solid rgba(0,212,170,0.2)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}>
          <div style={{ fontSize: "40px" }}>💡</div>
          <div>
            <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Potential monthly savings</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "32px", fontWeight: 700, color: "var(--accent)" }}>
              ${totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: "48px" }}><span className="spinner" /></div>}
      {error && <div style={{ color: "var(--error)", fontSize: "14px" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {suggestions.length === 0 ? (
            <div style={{ padding: "64px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>✨</div>
              <div style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-muted)", marginBottom: "8px" }}>
                No suggestions yet
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-subtle)" }}>
                Connect providers and let us track a few days of usage to generate optimization recommendations.
              </div>
            </div>
          ) : (
            suggestions.map((s, i) => (
              <div key={i} className="card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>
                        Switch <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{s.currentModel}</span>
                        {" → "}
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{s.suggestedModel}</span>
                      </div>
                      <span className={`badge badge-${s.confidence === "high" ? "success" : s.confidence === "medium" ? "warning" : "muted"}`}>
                        {s.confidence} confidence
                      </span>
                    </div>
                    {s.team && (
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>
                        Team: <span style={{ color: "var(--text-secondary)" }}>{s.team}</span>
                      </div>
                    )}
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{s.rationale}</div>
                  </div>

                  <div style={{ textAlign: "right", marginLeft: "24px", flexShrink: 0 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Monthly savings</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 700, color: "var(--success)" }}>
                      ${s.monthlySavings.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-subtle)" }}>
                      ${s.currentMonthlyCost.toFixed(2)} → ${s.projectedMonthlyCost.toFixed(2)}/mo
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
