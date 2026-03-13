"use client";

import { useState } from "react";
import { useTeams, createTeam, mapApiKeyToTeam } from "@/hooks/use-api";
import { Key, Plus, Users as UsersIcon, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

export default function TeamsPage() {
  const { data: teams, loading, error, refetch } = useTeams();
  const [showModal, setShowModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState("#00F0FF");
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
    // Note: The original API didn't take a color, but we're adding it for UI 
    // It will just be ignored by the backend if not supported, but let's pass it anyway
    await createTeam(newTeamName.trim() /* , newTeamColor */); 
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

  // Sci-fi themed team colors
  const TEAM_COLORS = ["#00F0FF", "#00FF88", "#8B5CF6", "#FFB800", "#FF3366", "#38BDF8", "#A78BFA", "#F87171"];

  // Calculate total spend for percentages
  const totalSpend = (teams ?? []).reduce((sum, t) => sum + (t.currentMonthSpend ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/20 p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">Team Matrix</h1>
          <p className="text-sm font-mono text-[#94A3B8] mt-1">Attribute telemetry and compute cost to specific organizational units</p>
        </div>
        <GlowButton variant="primary" onClick={() => setShowModal(true)} icon={<Plus className="w-4 h-4" />}>
          Initialize Team
        </GlowButton>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="p-6 border border-[#FF3366]/30 bg-[#FF3366]/5 rounded-xl text-[#FF3366] font-mono text-sm text-center">
          [ SYSTEM ERROR: {error} ]
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(teams ?? []).map((team, i) => {
              const color = TEAM_COLORS[i % TEAM_COLORS.length];
              const spend = team.currentMonthSpend ?? 0;
              const percent = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;
              
              return (
                <GlassCard key={team.id} className="flex flex-col h-full group">
                  {/* Glowing Top Border */}
                  <div className="absolute top-0 inset-x-0 h-[3px] shadow-[0_0_15px_currentColor]" style={{ backgroundColor: color, color }} />
                  
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-heading font-bold text-lg border relative overflow-hidden"
                          style={{ backgroundColor: `${color}15`, color, borderColor: `${color}30` }}
                        >
                          {/* Inner glow */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20" />
                          <span className="relative z-10">{team.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text transition-colors" style={{ backgroundImage: `linear-gradient(to right, white, ${color})` }}>
                            {team.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] font-mono">
                            <UsersIcon className="w-3 h-3" />
                            {team.memberCount} UNIT{team.memberCount !== 1 && 'S'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Spend & Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">Compute Burn</div>
                        <div className="text-[10px] font-mono text-[#94A3B8]">{percent.toFixed(1)}% OF TOTAL</div>
                      </div>
                      <div className="text-3xl font-mono font-bold tracking-tight mb-3" style={{ color, textShadow: `0 0 20px ${color}40` }}>
                        ${spend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      
                      {/* Animated Progress */}
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]" 
                          style={{ width: `${percent}%`, backgroundColor: color, color }}
                        />
                      </div>
                    </div>

                    {/* Mapped Keys & Models */}
                    <div className="flex-1 space-y-4">
                      {/* APIs */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">Authorization Keys</span>
                          <span className="font-mono text-xs text-white bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{team.apiKeys?.length ?? 0}</span>
                        </div>
                        
                        {(team.apiKeys?.length ?? 0) > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {team.apiKeys?.slice(0, 3).map(k => (
                              <div key={k.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A0F1C] border border-white/5 text-[10px] font-mono text-[#94A3B8]">
                                <Key className="w-3 h-3 text-[var(--accent-cyan)]" />
                                {k.keyAlias || k.keyPrefix}
                              </div>
                            ))}
                            {(team.apiKeys?.length ?? 0) > 3 && (
                               <div className="px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-[#94A3B8]">
                                 +{(team.apiKeys?.length ?? 0) - 3} MORE
                               </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-[#475569] italic">NO KEYS ATTACHED</div>
                        )}
                      </div>

                      {/* Models */}
                      {(team.topModels?.length ?? 0) > 0 && (
                        <div>
                          <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2">Primary Models</div>
                          <div className="flex flex-wrap gap-1.5">
                            {team.topModels!.slice(0, 3).map(m => (
                              <span key={m} className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-[#CBD5E1] whitespace-nowrap">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => openKeyModal(team.id, team.name)}
                    className="w-full py-3 px-5 border-t border-white/10 bg-black/20 hover:bg-white/5 transition-colors flex items-center justify-between text-sm group/btn"
                  >
                    <span className="font-mono text-[#94A3B8] group-hover/btn:text-white transition-colors">Attach Neural Key</span>
                    <Key className="w-4 h-4 text-[#475569] group-hover/btn:text-[var(--accent-cyan)] transition-colors" />
                  </button>
                </GlassCard>
              );
            })}
          </div>

          {(teams ?? []).length === 0 && (
            <div className="p-12 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-black/20">
              <UsersIcon className="w-12 h-12 text-[#475569] mb-4" />
              <h3 className="text-lg font-heading font-bold text-white mb-2">No Organizational Units Found</h3>
              <p className="text-sm font-mono text-[#94A3B8] max-w-md">Initialize your first team to start attributing AI compute costs to specific departments and projects.</p>
            </div>
          )}
        </>
      )}

      {/* Initialize Team Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-in">
            <h2 className="text-xl font-heading font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF] animate-pulse" />
              Initialize Team
            </h2>
            <p className="text-sm font-mono text-[#94A3B8] mb-6">Create a new organizational unit for cost attribution telemetry.</p>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="label">Unit Designation (Name)</label>
                <input
                  className="input"
                  placeholder="e.g. Engineering, Applied AI..."
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Aesthetic Signature (Color)</label>
                <div className="flex flex-wrap gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                  {TEAM_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTeamColor(c)}
                      className={`w-8 h-8 rounded-full transition-all focus:outline-none ${newTeamColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#0A0F1C]' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                      style={{ backgroundColor: c, boxShadow: newTeamColor === c ? `0 0 15px ${c}` : 'none' }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Abort</button>
                <GlowButton type="submit" variant="primary" className="py-2 px-6">
                  {creating ? <span className="spinner" /> : "Initialize"}
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Key Modal */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowKeyModal(false)}>
          <div className="modal animate-in">
            <h2 className="text-xl font-heading font-bold text-white mb-2 flex items-center gap-3">
              <Key className="w-5 h-5 text-[#00F0FF]" />
              Attach Key to {keyTeamName}
            </h2>
            <p className="text-sm font-mono text-[#94A3B8] mb-6">Link provider authorization keys to automatically route cost telemetry to this unit.</p>
            
            <form onSubmit={handleMapKey} className="space-y-5">
              <div>
                <label className="label">Neural Provider</label>
                <select
                  className="input appearance-none cursor-pointer"
                  value={keyProvider}
                  onChange={e => setKeyProvider(e.target.value)}
                >
                  <option value="OPENAI">OpenAI</option>
                  <option value="ANTHROPIC">Anthropic</option>
                  <option value="AWS_BEDROCK">AWS Bedrock</option>
                  <option value="AZURE_OPENAI">Azure OpenAI</option>
                </select>
              </div>

              <div>
                <label className="label">Key Signature Prefix (First 8 chars)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    className="input pl-10 tracking-widest uppercase"
                    placeholder="SK-ABCD12"
                    value={keyPrefix}
                    onChange={e => setKeyPrefix(e.target.value)}
                    maxLength={8}
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
                <div className="text-[10px] font-mono text-[#475569] mt-2 italic">
                  * Security protocol: We only store the prefix signature, never the full key execution string.
                </div>
              </div>

              <div>
                <label className="label">Alias Designation (Optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Production Core, R&D Labs..."
                  value={keyAlias}
                  onChange={e => setKeyAlias(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button type="button" className="btn btn-ghost" onClick={() => setShowKeyModal(false)}>Abort</button>
                <GlowButton type="submit" variant="primary" className="py-2 px-6">
                  {mappingKey ? <span className="spinner" /> : "Attach Link"}
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
