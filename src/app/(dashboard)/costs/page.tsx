"use client";

import { useState } from "react";
import { useCostRecords } from "@/hooks/use-api";
import { Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const PROVIDERS = ["All", "OPENAI", "ANTHROPIC", "AWS_BEDROCK", "AZURE_OPENAI", "GOOGLE_VERTEX"];

export default function CostsPage() {
  const [page, setPage] = useState(1);
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [groupBy, setGroupBy] = useState("model");

  const { data, loading, error } = useCostRecords({
    provider: provider || undefined,
    model: model || undefined,
    page,
    pageSize: 15,
  });

  const records = data?.records ?? [];
  const meta = data?.meta;

  const provColors: Record<string, string> = {
    'openai': '#00FF88',      
    'anthropic': '#FFB800',   
    'aws_bedrock': '#8B5CF6', 
  };
  const defaultColor = '#00F0FF';

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-white tracking-wide">Cost Intelligence</h1>
        <p className="text-sm font-mono text-[#94A3B8] mt-1">Granular telemetry across all neural links</p>
      </div>

      {/* Control Panel (Filter Bar) */}
      <GlassCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Group By Toggle */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 relative">
          <div 
            className="absolute inset-y-1 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-md transition-all duration-300 ease-out"
            style={{ 
              width: '33.33%', 
              left: groupBy === 'model' ? '0%' : groupBy === 'provider' ? '33.33%' : '66.66%' 
            }}
          />
          {['model', 'provider', 'service'].map((type) => (
            <button 
              key={type}
              onClick={() => setGroupBy(type)}
              className={`relative z-10 flex-1 px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                groupBy === type ? 'text-[#00F0FF]' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
            <select
              className="w-full sm:w-40 appearance-none bg-black/40 border border-white/10 text-white font-mono text-xs px-9 py-2 rounded-lg outline-none focus:border-[#00F0FF] focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all cursor-pointer"
              value={provider}
              onChange={e => { setProvider(e.target.value === "All" ? "" : e.target.value); setPage(1); }}
            >
              {PROVIDERS.map(p => <option key={p} value={p === "All" ? "" : p} className="bg-[#0A0F1C]">{p}</option>)}
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#475569] pointer-events-none" />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
            <input
              className="w-full sm:w-56 bg-black/40 border border-white/10 text-white font-mono text-xs pl-9 pr-4 py-2 rounded-lg outline-none focus:border-[#00F0FF] focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all placeholder:text-[#475569]"
              placeholder="Search sequence..."
              value={model}
              onChange={e => { setModel(e.target.value); setPage(1); }}
            />
          </div>
        </div>

      </GlassCard>

      {/* Telemetry Data Table */}
      <GlassCard delayIndex={1} className="overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse" />
            <h2 className="font-heading font-bold text-sm tracking-widest text-white uppercase">Data Stream</h2>
          </div>
          {meta && (
            <div className="text-xs font-mono text-[#94A3B8] border border-white/10 px-2 py-1 rounded bg-black/40">
              {meta.total.toLocaleString()} PACKETS
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10">
                {['Timestamp', 'Provider', 'Sequence (Model)', 'Metrics (In/Out)', 'Cost', 'Avg $/Req', 'Team'].map((head, i) => (
                  <th key={i} className="px-6 py-3 text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap group cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2">
                      {head}
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#00F0FF] transition-opacity" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-[400px]">
                    <div className="flex flex-col items-center justify-center gap-4 text-[#00F0FF]">
                      <div className="w-12 h-12 border-2 border-[#00F0FF]/20 border-t-[#00F0FF] rounded-full animate-spin" />
                      <div className="font-mono text-xs tracking-widest animate-pulse">ESTABLISHING STREAM...</div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="h-[400px] text-center font-mono text-sm text-[#FF3366] bg-[#FF3366]/5">
                    [ STREAM ERROR: {error} ]
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-[400px] text-center font-mono text-sm text-[#475569] bg-black/20">
                    [ NO TELEMETRY PACKETS DETECTED IN QUADRANT ]
                  </td>
                </tr>
              ) : (
                records.map((r, i) => {
                  const pColor = provColors[r.provider.toLowerCase()] || defaultColor;
                  // Fake requests for demo if missing
                  const reqs = 1;
                  const avgCost = r.costUsd / reqs;
                  
                  // Conditional coloring for cost
                  let costColorClass = "text-[#00FF88]"; // cheap
                  if (avgCost > 0.05) costColorClass = "text-[#FFB800]"; // warning
                  if (avgCost > 0.20) costColorClass = "text-[#FF3366]"; // expensive/red

                  return (
                    <tr 
                      key={r.id} 
                      className={`
                        border-b border-white/5 font-mono text-sm group transition-all duration-200
                        ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}
                        hover:bg-white/5
                      `}
                    >
                      {/* Timestamp */}
                      <td className="px-6 py-4 text-[#94A3B8] text-xs whitespace-nowrap">
                        {new Date(r.usageDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      
                      {/* Provider Badge */}
                      <td className="px-6 py-4">
                        <div 
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider"
                          style={{ backgroundColor: `${pColor}15`, color: pColor, border: `1px solid ${pColor}30` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pColor, boxShadow: `0 0 5px ${pColor}` }} />
                          {r.provider}
                        </div>
                      </td>

                      {/* Model */}
                      <td className="px-6 py-4 text-white text-xs">
                        {r.model ?? "—"}
                      </td>

                      {/* Tokens */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-[10px]">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[#475569]">IN:</span>
                            <span className="text-[#94A3B8]">{r.inputTokens?.toLocaleString() ?? "—"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[#475569]">OUT:</span>
                            <span className="text-[#94A3B8]">{r.outputTokens?.toLocaleString() ?? "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Total Cost */}
                      <td className="px-6 py-4 text-[#00F0FF] font-bold">
                        ${r.costUsd.toFixed(4)}
                      </td>

                      {/* Avg Cost */}
                      <td className={`px-6 py-4 ${costColorClass}`}>
                        ${avgCost.toFixed(4)}
                      </td>

                      {/* Team */}
                      <td className="px-6 py-4">
                        {r.teamName ? (
                          <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-[#E2E8F0]">
                            {r.teamName}
                          </div>
                        ) : (
                          <span className="text-xs text-[#475569] italic">Unattributed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
            <span className="text-xs font-mono text-[#475569]">
              PAGE {meta.page} OF {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-[#94A3B8] hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} 
                disabled={page === meta.totalPages}
                className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-[#94A3B8] hover:bg-white/10 hover:text-[#00F0FF] hover:border-[#00F0FF]/50 hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-white/10 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

    </div>
  );
}
