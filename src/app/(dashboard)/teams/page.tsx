"use client";

import { useState } from "react";
import { useTeams, createTeam } from "@/hooks/use-api";

export default function TeamsPage() {
  const { data: teams, loading, error, refetch } = useTeams();
  const [showModal, setShowModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);

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
                <div>
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>{team.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{team.memberCount} member{team.memberCount !== 1 ? "s" : ""}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Monthly Spend</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600, color: "var(--accent)" }}>
                    ${team.monthlySpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>API Keys</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600 }}>{team.apiKeyCount}</div>
                </div>
              </div>

              {team.topModels.length > 0 && (
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Top models</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {team.topModels.slice(0, 3).map(m => (
                      <span key={m} className="badge badge-muted" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
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
    </div>
  );
}
