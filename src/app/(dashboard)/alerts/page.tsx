"use client";

import { useState } from "react";
import { useAlerts, createAlert, updateAlert, deleteAlert } from "@/hooks/use-api";

export default function AlertsPage() {
  const { data: alerts, loading, error, refetch } = useAlerts();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", threshold: "", period: "MONTHLY", scope: "ORGANIZATION" });
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createAlert({
      name: form.name,
      threshold: parseFloat(form.threshold),
      period: form.period as any,
      scope: form.scope as any,
      enabled: true,
    });
    setSaving(false);
    setShowModal(false);
    setForm({ name: "", threshold: "", period: "MONTHLY", scope: "ORGANIZATION" });
    refetch();
  }

  async function handleToggle(id: string, enabled: boolean) {
    await updateAlert(id, { enabled: !enabled });
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this alert?")) return;
    await deleteAlert(id);
    refetch();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Budget Alerts</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Get notified when AI spend exceeds your limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Alert</button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "48px" }}><span className="spinner" /></div>}
      {error && <div style={{ color: "var(--error)", fontSize: "14px" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {(alerts ?? []).length === 0 ? (
            <div style={{ padding: "64px", textAlign: "center", color: "var(--text-subtle)", fontSize: "14px" }}>
              No alerts configured. Create an alert to stay within budget.
            </div>
          ) : (
            (alerts ?? []).map(alert => {
              const pct = Math.min(100, (alert.percentUsed ?? 0));
              const danger = pct >= 90;
              const warning = pct >= 70 && !danger;
              return (
                <div key={alert.id} className="card" style={{ opacity: alert.enabled ? 1 : 0.5 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>{alert.name}</div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span className="badge badge-muted">{alert.period}</span>
                        <span className="badge badge-muted">{alert.scope}</span>
                        {alert.scopeFilter && <span className="badge badge-muted">{alert.scopeFilter}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleToggle(alert.id, alert.enabled)}
                        style={{ fontSize: "18px", padding: "4px 8px" }}
                      >
                        {alert.enabled ? "◉" : "◎"}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(alert.id)}>Delete</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
                      ${(alert.currentSpend ?? 0).toFixed(2)} / ${alert.threshold.toFixed(2)}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600,
                      color: danger ? "var(--error)" : warning ? "var(--warning)" : "var(--text-secondary)",
                    }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${danger ? "danger" : warning ? "warning" : ""}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {alert.lastTriggeredAt && (
                    <div style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "8px" }}>
                      Last triggered: {new Date(alert.lastTriggeredAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Alert Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-in">
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Create Budget Alert</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
              You&apos;ll be alerted when spend exceeds the threshold.
            </p>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="label">Alert name</label>
                <input className="input" placeholder="e.g. Monthly OpenAI Budget" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="label">Threshold (USD)</label>
                  <input className="input" type="number" min="1" step="0.01" placeholder="500" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Period</label>
                  <select className="input" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Scope</label>
                <select className="input" value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}>
                  <option value="ORGANIZATION">Entire Organization</option>
                  <option value="TEAM">Specific Team</option>
                  <option value="PROVIDER">Specific Provider</option>
                  <option value="MODEL">Specific Model</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : "Create Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
