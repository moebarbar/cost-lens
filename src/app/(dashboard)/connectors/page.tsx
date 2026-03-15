"use client";

import { useState } from "react";
import { useConnectors, addConnector, deleteConnector, syncConnector } from "@/hooks/use-api";
import Link from "next/link";
import { Plug, Zap, AlertTriangle, ShieldCheck, PowerOff, Database, Key, ServerCog } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

const PROVIDER_OPTIONS = [
  { value: "OPENAI",        label: "OpenAI",         icon: ServerCog, color: "#00FF88", fields: [{ key: "apiKey", label: "Admin API Key", type: "password", placeholder: "sk-..." }] },
  { value: "ANTHROPIC",     label: "Anthropic",      icon: ServerCog, color: "#FFB800", fields: [{ key: "apiKey", label: "API Key", type: "password", placeholder: "sk-ant-..." }] },
  { value: "AWS_BEDROCK",   label: "AWS Bedrock",    icon: Database,  color: "#8B5CF6", fields: [
    { key: "accessKeyId",     label: "Access Key ID",      type: "password", placeholder: "AKIA..." },
    { key: "secretAccessKey", label: "Secret Access Key",   type: "password", placeholder: "Secret..." },
    { key: "region",          label: "Region",              type: "text",     placeholder: "us-east-1" },
  ]},
  { value: "AZURE_OPENAI",  label: "Azure OpenAI",   icon: ServerCog, color: "#00F0FF", fields: [{ key: "apiKey", label: "API Key", type: "password", placeholder: "Azure API key..." }], comingSoon: true },
  { value: "GOOGLE_VERTEX", label: "Google Vertex",  icon: Database,  color: "#38BDF8", fields: [{ key: "serviceAccount", label: "Service Account JSON", type: "textarea", placeholder: '{"type": "service_account", ...}' }], comingSoon: true },
];

const STATUS_CONFIG: Record<string, { color: string, icon: any, label: string }> = {
  ACTIVE: { color: "#00FF88", icon: Zap, label: "ONLINE" },
  PENDING: { color: "#FFB800", icon: AlertTriangle, label: "INITIALIZING" },
  ERROR: { color: "#FF3366", icon: PowerOff, label: "CONNECTION LOST" },
  DISABLED: { color: "#475569", icon: PowerOff, label: "OFFLINE" },
};

export default function ConnectorsPage() {
  const { data: connectors, loading, error, refetch } = useConnectors();
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDER_OPTIONS[0]);
  const [credValues, setCredValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await addConnector(selectedProvider.value, credValues);
    setSaving(false);
    setShowModal(false);
    setCredValues({});
    refetch();
  }

  async function handleSync(provider: string) {
    setSyncing(provider);
    await syncConnector(provider);
    setSyncing(null);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Sever neural link? This will halt all incoming telemetry but retain existing cost records.")) return;
    await deleteConnector(id);
    refetch();
  }

  function selectProvider(p: typeof PROVIDER_OPTIONS[0]) {
    if (p.comingSoon) return;
    setSelectedProvider(p);
    setCredValues({});
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/20 p-6 rounded-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#00F0FF]/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide">Neural Links</h1>
          <p className="text-sm font-mono text-[#94A3B8] mt-1">Establish direct telemetry connections to external AI service providers</p>
        </div>
        <GlowButton variant="primary" onClick={() => setShowModal(true)} icon={<Plug className="w-4 h-4" />} className="relative z-10">
          Establish New Link
        </GlowButton>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-64 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="p-6 border border-[#FF3366]/30 bg-[#FF3366]/5 rounded-xl text-[#FF3366] font-mono text-sm text-center flex items-center justify-center gap-3">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          [ SYSTEM ERROR: {error} ]
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(connectors ?? []).length === 0 ? (
            <div className="col-span-full p-12 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-black/20">
              <Plug className="w-12 h-12 text-[#475569] mb-4" />
              <h3 className="text-lg font-heading font-bold text-white mb-2">No Uplinks Established</h3>
              <p className="text-sm font-mono text-[#94A3B8] max-w-md">Connect your first AI provider to initiate automated cost telemetry acquisition.</p>
            </div>
          ) : (
            (connectors ?? []).map((conn, i) => {
              const providerMeta = PROVIDER_OPTIONS.find(p => p.value === conn.provider);
              const status = STATUS_CONFIG[conn.status] || STATUS_CONFIG.DISABLED;
              const StatusIcon = status.icon;
              const isSyncing = syncing === conn.provider;
              const ProvIcon = providerMeta?.icon || Plug;

              return (
                <GlassCard key={conn.id} delayIndex={i} className="flex flex-col group relative overflow-hidden">
                  
                  {/* Status Indicator Bar at Top */}
                  <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: status.color, boxShadow: `0 0 10px ${status.color}80` }} />
                  {isSyncing && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/50 animate-[scanHorizontal_1.5s_linear_infinite]" />
                  )}

                  <div className="p-6 flex-1 flex flex-col z-10">
                    
                    {/* Header: Icon & Title */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner overflow-hidden relative"
                          style={{ backgroundColor: `${providerMeta?.color ?? "#888"}10`, borderColor: `${providerMeta?.color ?? "#888"}30` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                          <ProvIcon className="w-6 h-6 z-10" style={{ color: providerMeta?.color ?? "#888" }} />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-lg text-white">{providerMeta?.label ?? conn.provider}</h3>
                          <div className="flex items-center gap-1.5 mt-1" style={{ color: status.color }}>
                            <StatusIcon className={`w-3 h-3 ${conn.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-mono tracking-widest">{status.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6 bg-black/40 p-4 rounded-lg border border-white/5">
                      <div>
                        <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-1.5">Packets Fetched</div>
                        <div className="font-mono text-xl font-bold text-white">
                          {conn.recordCount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-1.5">Tracked Value</div>
                        <div className="font-mono text-xl font-bold text-[#00F0FF]">
                          ${conn.totalCostTracked.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {conn.lastError && (
                      <div className="mb-4 p-3 bg-[#FF3366]/10 border border-[#FF3366]/30 rounded-lg text-xs font-mono text-[#FF3366] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="break-all">{conn.lastError}</span>
                      </div>
                    )}

                    <div className="mt-auto">
                      <div className="text-[10px] font-mono text-[#475569] mb-4 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${conn.lastSyncAt ? 'bg-[#00FF88]' : 'bg-[#475569]'}`} />
                        LAST UPLINK: {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString() : "AWAITING FIRST SYNC"}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg font-heading font-medium text-sm transition-all border ${
                            isSyncing
                              ? 'bg-white/10 border-white/20 text-white cursor-wait'
                              : 'bg-black/40 border-white/10 text-[#94A3B8] hover:text-[#00F0FF] hover:border-[#00F0FF]/30 hover:bg-[#00F0FF]/5'
                          }`}
                          onClick={() => handleSync(conn.provider)}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> SYNCING...</>
                          ) : (
                            <><Zap className="w-4 h-4" /> SYNC</>
                          )}
                        </button>
                        <Link
                          href={`/connectors/${conn.id}/setup`}
                          className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border border-white/10 bg-black/40 text-[#475569] hover:text-[#8B5CF6] hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10 transition-colors text-xs font-mono"
                          title="Manage API Key Attribution"
                        >
                          <Key className="w-3.5 h-3.5" /> KEYS
                        </Link>
                        <button
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-black/40 text-[#475569] hover:text-[#FF3366] hover:border-[#FF3366]/30 hover:bg-[#FF3366]/10 transition-colors"
                          onClick={() => handleDelete(conn.id)}
                          title="Sever Link"
                        >
                          <PowerOff className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* Add Connector Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-in w-full max-w-2xl bg-[#0A0F1C] border border-[#00F0FF]/30 shadow-[0_0_40px_rgba(0,240,255,0.15)]">
            
            <div className="flex items-center gap-3 mb-2">
              <Plug className="w-6 h-6 text-[#00F0FF]" />
              <h2 className="text-xl font-heading font-bold text-white">Establish Neural Link</h2>
            </div>
            
            <p className="text-sm font-mono text-[#94A3B8] mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00FF88]" /> 
              Authorization keys are encrypted via AES-256 vault protocol.
            </p>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-6">
              
              {/* Provider Selection Grid */}
              <div>
                <label className="label text-[#00F0FF] mb-3">Select Provider Matrix</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PROVIDER_OPTIONS.map(p => {
                    const isSelected = selectedProvider.value === p.value;
                    const ProvIcon = p.icon;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => selectProvider(p)}
                        disabled={p.comingSoon}
                        className={`
                          relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300
                          ${p.comingSoon ? 'opacity-40 cursor-not-allowed bg-black/40 border-white/5 grayscale' : 'cursor-pointer hover:-translate-y-1'}
                          ${isSelected && !p.comingSoon ? 'bg-[#00F0FF]/10 border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)] scale-105 z-10' : 'bg-black/40 border-white/10 hover:bg-white/5'}
                        `}
                      >
                        <ProvIcon className="w-8 h-8 mb-2" style={{ color: p.comingSoon ? '#475569' : p.color }} />
                        <span className={`text-[10px] font-heading font-bold text-center ${isSelected ? 'text-white' : 'text-[#94A3B8]'}`}>
                          {p.label.split(" ")[0]}
                        </span>
                        
                        {p.comingSoon && (
                          <div className="absolute -top-2 right-1/2 translate-x-1/2 bg-[#030712] border border-white/10 text-[#475569] text-[8px] font-mono px-2 py-0.5 rounded tracking-widest whitespace-nowrap">
                            LOCKED
                          </div>
                        )}
                        
                        {/* selection glow */}
                        {isSelected && !p.comingSoon && (
                          <div className="absolute inset-0 bg-gradient-to-t from-[#00F0FF]/20 to-transparent pointer-events-none rounded-xl" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Credential Fields */}
              <div className="bg-black/30 p-5 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-xs font-mono text-[#00F0FF] uppercase tracking-widest border-b border-white/10 pb-2 mb-4">
                  Authorization Requirements
                </h4>
                
                {selectedProvider.fields.map(f => (
                  <div key={f.key}>
                    <label className="label flex items-center gap-2">
                       {f.type === 'password' ? <Key className="w-3.5 h-3.5 text-[#475569]" /> : <Database className="w-3.5 h-3.5 text-[#475569]" />}
                       {f.label}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea
                        className="input font-mono text-xs min-h-[100px] bg-[#0A0F1C]/80"
                        placeholder={f.placeholder}
                        value={credValues[f.key] || ""}
                        onChange={e => setCredValues({ ...credValues, [f.key]: e.target.value })}
                        required
                      />
                    ) : (
                      <input
                        className="input font-mono text-sm bg-[#0A0F1C]/80"
                        type={f.type}
                        placeholder={f.placeholder}
                        value={credValues[f.key] || ""}
                        onChange={e => setCredValues({ ...credValues, [f.key]: e.target.value })}
                        required
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="btn btn-ghost hover:text-[#FF3366]" onClick={() => setShowModal(false)}>Abort Sequence</button>
                <GlowButton type="submit" variant="primary" className="py-2.5 px-8">
                  {saving ? <span className="spinner" /> : "Verify & Link"}
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
