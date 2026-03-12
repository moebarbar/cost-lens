"use client";

import { useState } from "react";
import { useTeams, createTeam, mapApiKeyToTeam } from "@/hooks/use-api";

export default function TeamsPage() {
  const { data: teams, loading, error, refetch } = useTeams();
  const [showModal, setShowModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  // API Key Mapping state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyTeamId, setKeyTeamId] = useState("");
  const [keyTeamName, setKeyTeamName] = useState("");
  const [keyPrefix, setKeyPrefix] = useState("");
  const [keyAlias, setKeyAlias] = useState("");
  const [keyProvider, setKeyProvider] = useState("OPENAI");
  const [mappingKey, setMappingKey] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreating(true);
    await createTeam(newTeamName.trim());
    setNewTeamName("");
    setCreating(false);
    setShowModal(false);
    refetch();
  }

  function openKeyModal(teamId: string, teamName: string) {
    setKeyTeamId(teamId);
    setKeyTeamName(teamName);
    setKeyPrefix("");
    setKeyAlias("");
    setKeyProvider("OPENAI");
    setShowKeyModal(true);
  }

  async function handleMapKey(e: React.FormEvent) {
    e.preventDefault();
    if (!keyPrefix.trim()) return;
    setMappingKey(true);
    await mapApiKeyToTeam(keyTeamId, keyPrefix.trim(), keyProvider, keyAlias.trim() || undefined);
    setMappingKey(false);
    setShowKeyModal(false);
    refetch();
  }

  const TEAM_COLORS = ["#00D4AA", "#D4A574", "#FF9900", "#0078D4", "#4285F4", "#22D377", "#F59E0B", "#EF4444"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Teams</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Attribute AI costs to teams and projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Team</button>
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ width: "40%", height: "16px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ width: "60%", height: "28px", marginBottom: "8px" }} />
              <div className="skeleton" style={{ width: "80%", height: "12px" }} />
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ color: "var(--error)", fontSize: "14px" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {(teams ?? []).map((team, i) => (
            <div key={team.id} className="card" style={{ borderTop: `3px solid ${TEAM_COLORS[i % TEAM_COLORS.length]}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: "36px", height: "36px",
                  background: `${TEAM_COLORS[i % TEAM_COLORS.length]}20`,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700,
                  color: TEAM_COLORS[i % TEAM_COLORS.length],
                  fontSize: "14px",
                }}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>{team.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{team.memberCount} member{team.memberCount !== 1 ? "s" : ""}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Monthly Spend</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600, color: "var(--accent)" }}>
                    ${(team.currentMonthSpend ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>API Keys</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600 }}>{team.apiKeys?.length ?? 0}</div>
                </div>
              </div>

              {/* Mapped API keys */}
              {(team.apiKeys?.length ?? 0) > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Mapped keys</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {team.apiKeys.map(k => (
                      <div key={k.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "6px 8px", background: "var(--bg-input)", borderRadius: "var(--radius-sm)",
                        fontSize: "12px",
                      }}>
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {k.keyAlias || k.keyPrefix}
                        </span>
                        <span className="badge badge-muted" style={{ fontSize: "10px" }}>{k.provider}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(team.topModels?.length ?? 0) > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Top models</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {team.topModels!.slice(0, 3).map(m => (
                      <span key={m} className="badge badge-muted" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", marginTop: "4px" }}
                onClick={() => openKeyModal(team.id, team.name)}
              >
                🔑 Map API Key
              </button>
            </div>
          ))}

          {(teams ?? []).length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "64px", textAlign: "center", color: "var(--text-subtle)", fontSize: "14px" }}>
              No teams yet. Create your first team to start attributing costs.
            </div>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-in">
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Create Team</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
              Teams let you attribute AI costs to departments or projects.
            </p>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="label">Team name</label>
                <input
                  className="input"
                  placeholder="e.g. Engineering, Marketing..."
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <span className="spinner" /> : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map API Key Modal */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowKeyModal(false)}>
          <div className="modal animate-in">
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
              Map API Key to {keyTeamName}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
              Enter the first 8 characters of your API key. Cost records matching this prefix will be attributed to this team.
            </p>
            <form onSubmit={handleMapKey} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="label">Provider</label>
                <select
                  className="input"
                  value={keyProvider}
                  onChange={e => setKeyProvider(e.target.value)}
                >
                  <option value="OPENAI">OpenAI</option>
                  <option value="ANTHROPIC">Anthropic</option>
                  <option value="AWS_BEDROCK">AWS Bedrock</option>
                </select>
              </div>
              <div>
                <label className="label">API Key Prefix (first 8 chars)</label>
                <input
                  className="input"
                  placeholder="sk-abcd1234"
                  value={keyPrefix}
                  onChange={e => setKeyPrefix(e.target.value)}
                  maxLength={8}
                  required
                  autoFocus
                  style={{ fontFamily: "var(--font-mono)" }}
                />
                <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "4px" }}>
                  Only the prefix is stored — your full key is never exposed
                </div>
              </div>
              <div>
                <label className="label">Alias (optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Production key, Dev key..."
                  value={keyAlias}
                  onChange={e => setKeyAlias(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowKeyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={mappingKey}>
                  {mappingKey ? <span className="spinner" /> : "Map Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
