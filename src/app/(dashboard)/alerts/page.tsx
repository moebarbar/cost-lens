"use client";

import { useState } from "react";
import { useAlerts, createAlert, updateAlert, deleteAlert } from "@/hooks/use-api";
import { Bell, Plus, ShieldAlert, Activity, Trash2, Power, TriangleAlert, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

export default function AlertsPage() {
  const { data: alerts, loading, error, refetch } = useAlerts();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", threshold: "", period: "MONTHLY", scope: "ORGANIZATION", scopeFilter: "" });
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createAlert({
      name: form.name,
      threshold: parseFloat(form.threshold),
      period: form.period as any,
      scope: form.scope as any,
      scopeFilter: form.scopeFilter || undefined,
      enabled: true,
    });
    setSaving(false);
    setShowModal(false);
    setForm({ name: "", threshold: "", period: "MONTHLY", scope: "ORGANIZATION", scopeFilter: "" });
    refetch();
  }

  async function handleToggle(id: string, enabled: boolean) {
    await updateAlert(id, { enabled: !enabled });
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Deactivate and purge this alert sequence?")) return;
    await deleteAlert(id);
    refetch();
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/20 p-6 rounded-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3366]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">Alert Grid</h1>
          <p className="text-sm font-mono text-[#94A3B8] mt-1">Configure automated budget thresholds and anomaly detection routines</p>
        </div>
        <GlowButton variant="primary" onClick={() => setShowModal(true)} icon={<Plus className="w-4 h-4" />} className="relative z-10">
          New Alert Sequence
        </GlowButton>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="p-6 border border-[#FF3366]/30 bg-[#FF3366]/5 rounded-xl text-[#FF3366] font-mono text-sm text-center flex items-center justify-center gap-3">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          [ SENSOR FAILURE: {error} ]
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(alerts ?? []).length === 0 ? (
            <div className="col-span-full p-12 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-black/20">
              <Bell className="w-12 h-12 text-[#475569] mb-4" />
              <h3 className="text-lg font-heading font-bold text-white mb-2">No Active Sentinels</h3>
              <p className="text-sm font-mono text-[#94A3B8] max-w-md">Initialize alert thresholds to prevent cost overruns and detect unauthorized AI telemetry.</p>
            </div>
          ) : (
            (alerts ?? []).map((alert, i) => {
              const pct = Math.min(100, (alert.percentUsed ?? 0));
              const danger = pct >= 90;
              const warning = pct >= 70 && !danger;
              
              let statusColor = "#00FF88"; // Nominal / Green
              let statusBg = "bg-[#00FF88]/10";
              let statusBorder = "border-[#00FF88]/30";
              let StatusIcon = CheckCircle2;
              let glowAnim = "";

              if (danger) {
                statusColor = "#FF3366"; // Critical / Red
                statusBg = "bg-[#FF3366]/10";
                statusBorder = "border-[#FF3366]/50";
                StatusIcon = ShieldAlert;
                glowAnim = "animate-pulse shadow-[0_0_20px_rgba(255,51,102,0.4)]";
              } else if (warning) {
                statusColor = "#FFB800"; // Warning / Amber
                statusBg = "bg-[#FFB800]/10";
                statusBorder = "border-[#FFB800]/50";
                StatusIcon = TriangleAlert;
              }

              if (!alert.enabled) {
                statusColor = "#475569";
                statusBg = "bg-white/5";
                statusBorder = "border-white/10";
                StatusIcon = Power;
                glowAnim = "";
              }

              return (
                <GlassCard key={alert.id} delayIndex={i * 2} className={`relative overflow-visible transition-opacity duration-300 ${alert.enabled ? 'opacity-100' : 'opacity-60 grayscale-[0.5]'}`}>
                  
                  {/* Danger border glow */}
                  {danger && alert.enabled && (
                    <div className="absolute -inset-[1px] rounded-xl border border-[#FF3366]/50 animate-pulse pointer-events-none" />
                  )}

                  <div className="p-6 flex flex-col h-full relative z-10 bg-[#0A0F1C]/90 rounded-xl">
                    
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${statusBg} ${statusBorder} ${glowAnim}`}>
                          <StatusIcon className="w-5 h-5" style={{ color: statusColor }} />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text transition-colors">
                            {alert.name}
                          </h3>
                          <div className="flex gap-2 items-center mt-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider border border-white/10 bg-black/40 text-[#94A3B8]">
                              {alert.period}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider border border-white/10 bg-black/40 text-[#00F0FF]">
                              {alert.scope}
                            </span>
                            {alert.scopeFilter && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider border border-white/10 bg-white/10 text-white">
                                {alert.scopeFilter}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(alert.id, alert.enabled)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
                            alert.enabled 
                              ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                              : 'bg-white/5 border-white/10 text-[#475569] hover:text-white'
                          }`}
                          title={alert.enabled ? "Deactivate sentinel" : "Activate sentinel"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(alert.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 bg-black/20 text-[#475569] hover:text-[#FF3366] hover:border-[#FF3366]/30 hover:bg-[#FF3366]/10 transition-all"
                          title="Purge alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Spend Metrics */}
                    <div className="mb-4">
                      <div className="flex justify-between items-end mb-2">
                        <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest flex items-center gap-1.5">
                          <Activity className="w-3 h-3" />
                          Threshold Status
                        </div>
                        <div className="font-mono text-xl font-bold" style={{ color: alert.enabled ? statusColor : '#94A3B8' }}>
                          {pct.toFixed(1)}%
                        </div>
                      </div>
                      
                      {/* Sci-Fi Progress Bar */}
                      <div className="relative h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                        {/* Segment markers */}
                        <div className="absolute inset-0 flex justify-between px-[10%] pointer-events-none opacity-20">
                          {[1,2,3,4,5,6,7,8,9].map(x => <div key={x} className="w-px h-full bg-white" />)}
                        </div>
                        
                        <div 
                          className={`h-full relative transition-all duration-1000 ease-out`}
                          style={{ width: `${pct}%`, backgroundColor: alert.enabled ? statusColor : '#475569' }}
                        >
                          {/* Inner glow on the bar itself */}
                          {alert.enabled && (
                            <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/40 to-transparent" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-2 font-mono text-xs">
                        <span className="text-white">${(alert.currentSpend ?? 0).toFixed(2)}</span>
                        <span className="text-[#475569] border-l border-white/10 pl-2">Limit: ${alert.threshold.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Footer / Last Trigger */}
                    {alert.lastTriggeredAt && (
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-[#94A3B8]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
                        LAST TRIGGERED: {new Date(alert.lastTriggeredAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* Configuration Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-in border border-[#00F0FF]/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden">
            
            {/* Holographic grid bg inside modal */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            <div className="relative z-10 w-full">
              <h2 className="text-xl font-heading font-bold text-white mb-2 flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#00F0FF]" />
                Configure Sentinel Alert
              </h2>
              <p className="text-sm font-mono text-[#94A3B8] mb-6 border-b border-white/10 pb-4">
                Define parameters for automated threshold anomaly detection.
              </p>
              
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="label text-[#00F0FF]">Designation (Name)</label>
                  <input 
                    className="input bg-[#0A0F1C]/80 border-[#00F0FF]/20 focus:border-[#00F0FF]" 
                    placeholder="e.g. Critical Global Spend Limit" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[#00F0FF]">Threshold Limit ($USD)</label>
                    <input 
                      className="input font-mono bg-[#0A0F1C]/80 border-[#00F0FF]/20 focus:border-[#00F0FF]" 
                      type="number" min="1" step="0.01" 
                      placeholder="1000.00" 
                      value={form.threshold} 
                      onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="label text-[#00F0FF]">Time Horizon</label>
                    <select 
                      className="input appearance-none bg-[#0A0F1C]/80 border-[#00F0FF]/20 focus:border-[#00F0FF]" 
                      value={form.period} 
                      onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                    >
                      <option value="DAILY">Daily Cycle</option>
                      <option value="WEEKLY">Weekly Cycle</option>
                      <option value="MONTHLY">Monthly Cycle</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[#00F0FF]">Scan Scope</label>
                    <select 
                      className="input appearance-none bg-[#0A0F1C]/80 border-[#00F0FF]/20 focus:border-[#00F0FF]" 
                      value={form.scope} 
                      onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}
                    >
                      <option value="ORGANIZATION">Global (All)</option>
                      <option value="TEAM">Specific Team</option>
                      <option value="PROVIDER">Specific Provider</option>
                      <option value="MODEL">Specific Model</option>
                    </select>
                  </div>
                  
                  {form.scope !== "ORGANIZATION" && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="label text-[#00F0FF]">Target Filter</label>
                      <input 
                        className="input bg-[#0A0F1C]/80 border-[#00F0FF]/20 focus:border-[#00F0FF]" 
                        placeholder={
                          form.scope === "TEAM" ? "e.g. Engineering" : 
                          form.scope === "PROVIDER" ? "e.g. OPENAI" : "e.g. gpt-4"
                        }
                        value={form.scopeFilter} 
                        onChange={e => setForm(f => ({ ...f, scopeFilter: e.target.value }))} 
                        required 
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-white/10">
                  <button type="button" className="btn btn-ghost hover:text-[#FF3366]" onClick={() => setShowModal(false)}>Abort</button>
                  <GlowButton type="submit" variant="primary" className="py-2.5 px-6">
                    {saving ? <span className="spinner" /> : "Deploy Sentinel"}
                  </GlowButton>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
