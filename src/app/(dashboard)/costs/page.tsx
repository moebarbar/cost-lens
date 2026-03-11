"use client";

import { useState } from "react";
import { useCostRecords } from "@/hooks/use-api";

const PROVIDERS = ["All", "OPENAI", "ANTHROPIC", "AWS_BEDROCK", "AZURE_OPENAI", "GOOGLE_VERTEX"];

export default function CostsPage() {
  const [page, setPage] = useState(1);
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");

  const { data, loading, error } = useCostRecords({
    provider: provider || undefined,
    model: model || undefined,
    page,
    pageSize: 20,
  });

  const records = data?.records ?? [];
  const meta = data?.meta;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Cost Explorer</h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Browse and filter all AI cost records</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <select
          className="input"
          style={{ width: "180px" }}
          value={provider}
          onChange={e => { setProvider(e.target.value === "All" ? "" : e.target.value); setPage(1); }}
        >
          {PROVIDERS.map(p => <option key={p} value={p === "All" ? "" : p}>{p}</option>)}
        </select>
        <input
          className="input"
          style={{ width: "200px" }}
          placeholder="Filter by model..."
          value={model}
          onChange={e => { setModel(e.target.value); setPage(1); }}
        />
        {meta && (
          <div style={{ display: "flex", alignItems: "center", marginLeft: "auto", color: "var(--text-muted)", fontSize: "13px" }}>
            {meta.total.toLocaleString()} records
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            <span className="spinner" />
          </div>
        ) : error ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--error)", fontSize: "14px" }}>{error}</div>
        ) : records.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center", color: "var(--text-subtle)", fontSize: "14px" }}>
            No cost records found. Connect a provider to start tracking.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Provider</th>
                <th>Model</th>
                <th>Cost</th>
                <th>Input Tokens</th>
                <th>Output Tokens</th>
                <th>Team</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    {new Date(r.usageDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="badge badge-muted">{r.provider}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {r.model ?? "—"}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent)" }}>
                    ${r.costUsd.toFixed(4)}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    {r.inputTokens?.toLocaleString() ?? "—"}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    {r.outputTokens?.toLocaleString() ?? "—"}
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {r.teamName ?? <span style={{ color: "var(--text-subtle)" }}>Unattributed</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${r.confidence === "CONFIRMED" ? "success" : r.confidence === "ESTIMATED" ? "warning" : "muted"}`}>
                      {r.confidence.toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Page {meta.page} of {meta.totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
