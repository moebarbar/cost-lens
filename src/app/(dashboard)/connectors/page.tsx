"use client";

import { useState } from "react";
import { useConnectors, addConnector, deleteConnector, syncConnector } from "@/hooks/use-api";

const PROVIDER_OPTIONS = [
  { value: "OPENAI",        label: "OpenAI",         icon: "🟢", color: "#00A67E", field: "apiKey",       placeholder: "sk-..." },
  { value: "ANTHROPIC",     label: "Anthropic",      icon: "🟠", color: "#D4A574", field: "apiKey",       placeholder: "sk-ant-..." },
  { value: "AWS_BEDROCK",   label: "AWS Bedrock",    icon: "🟡", color: "#FF9900", field: "accessKeyId",  placeholder: "AKIA..." },
  { value: "AZURE_OPENAI",  label: "Azure OpenAI",   icon: "🔵", color: "#0078D4", field: "apiKey",       placeholder: "Azure API key..." },
  { value: "GOOGLE_VERTEX", label: "Google Vertex",  icon: "🔷", color: "#4285F4", field: "serviceAccount", placeholder: "JSON service account..." },
];

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-success",
  PENDING: "badge-warning",
  ERROR: "badge-error",
  DISABLED: "badge-muted",
};

export default function ConnectorsPage() {
  const { data: connectors, loading, error, refetch } = useConnectors();
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDER_OPTIONS[0]);
  const [credValue, setCredValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!credValue.trim()) return;
    setSaving(true);
    await addConnector(selectedProvider.value, { [selectedProvider.field]: credValue.trim() });
    setSaving(false);
    setShowModal(false);
    setCredValue("");
    refetch();
  }

  async function handleSync(provider: string) {
    setSyncing(provider);
    await syncConnector(provider);
    setSyncing(null);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this connector? This will not delete existing cost records.")) return;
    await deleteConnector(id);
    refetch();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Connectors</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Connect AI providers to automatically pull cost data</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Connector</button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "48px" }}><span className="spinner" /></div>}
      {error && <div style={{ color: "var(--error)", fontSize: "14px" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {(connectors ?? []).length === 0 ? (
            <div style={{ gridColumn: "1/-1", padding: "80px", textAlign: "center", color: "var(--text-subtle)", fontSize: "14px" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔌</div>
              <div style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-muted)", marginBottom: "8px" }}>No connectors yet</div>
              <div>Add your first AI provider to start tracking costs automatically.</div>
            </div>
          ) : (
            (connectors ?? []).map(conn => {
              const providerMeta = PROVIDER_OPTIONS.find(p => p.value === conn.provider);
              return (
                <div key={conn.id} className="card">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "40px", height: "40px",
                        background: `${providerMeta?.color ?? "#888"}20`,
                        borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px",
                      }}>
                        {providerMeta?.icon ?? "⚙️"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "15px" }}>{providerMeta?.label ?? conn.provider}</div>
                        <span className={`badge ${STATUS_BADGE[conn.status] ?? "badge-muted"}`} style={{ marginTop: "2px" }}>
                          {conn.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Records</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 600 }}>
                        {conn.recordCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Cost Tracked</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 600, color: "var(--accent)" }}>
                        ${conn.totalCostTracked.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {conn.lastError && (
                    <div style={{ marginBottom: "12px", padding: "10px", background: "rgba(239,68,68,0.08)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--error)" }}>
                      {conn.lastError}
                    </div>
                  )}

                  <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginBottom: "14px" }}>
                    {conn.lastSyncAt ? `Synced ${new Date(conn.lastSyncAt).toLocaleString()}` : "Never synced"}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleSync(conn.provider)}
                      disabled={syncing === conn.provider}
                    >
                      {syncing === conn.provider ? <span className="spinner" /> : "↻ Sync"}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(conn.id)}>Remove</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Connector Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-in" style={{ maxWidth: "520px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Add Provider</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
              Your API key is encrypted with AES-256 and never stored in plain text.
            </p>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="label">Provider</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "8px" }}>
                  {PROVIDER_OPTIONS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => { setSelectedProvider(p); setCredValue(""); }}
                      style={{
                        padding: "10px 4px",
                        borderRadius: "var(--radius-md)",
                        border: `2px solid ${selectedProvider.value === p.value ? p.color : "var(--border)"}`,
                        background: selectedProvider.value === p.value ? `${p.color}15` : "var(--bg-input)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all var(--transition)",
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>{p.icon}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>{p.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">{selectedProvider.field === "serviceAccount" ? "Service Account JSON" : "API Key"}</label>
                <input
                  className={selectedProvider.field === "serviceAccount" ? undefined : "input"}
                  style={selectedProvider.field === "serviceAccount" ? {
                    width: "100%", padding: "10px 14px",
                    background: "var(--bg-input)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)", fontSize: "12px", outline: "none",
                    height: "80px", resize: "vertical",
                  } as React.CSSProperties : undefined}
                  type={selectedProvider.field === "serviceAccount" ? undefined : "password"}
                  placeholder={selectedProvider.placeholder}
                  value={credValue}
                  onChange={e => setCredValue(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : "Connect Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
