"use client";

import { useOptimizations } from "@/hooks/use-api";
import { Zap, ArrowRight, Activity, Percent, BrainCircuit, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

export default function OptimizePage() {
  const { data, loading, error } = useOptimizations();

  const suggestions = data?.suggestions ?? [];
  const totalSavings = data?.totalSavings ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-[#00FF88]" />
          Neural Optimizer
        </h1>
        <p className="text-sm font-mono text-[#94A3B8] mt-1">Autonomous intelligence routines designed to maximize compute efficiency</p>
      </div>

      {/* Hero Savings Banner */}
      {totalSavings > 0 && (
        <div className="relative overflow-hidden bg-[#0A0F1C]/90 rounded-2xl border border-[#00FF88]/30 shadow-[0_0_40px_rgba(0,255,136,0.15)] flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 group">
          
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#00FF88]/20 via-transparent to-transparent opacity-60 pointer-events-none" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-[#00FF88]/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-[#00FF88]/20 transition-colors duration-1000" />
          
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-[10px] font-mono font-bold tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] shadow-[0_0_5px_currentColor] animate-pulse" />
              Optimization Available
            </div>
            <div className="text-sm font-mono text-[#94A3B8] uppercase tracking-wider mb-1">Projected Monthly Efficiency Gain</div>
            <div className="text-5xl md:text-7xl font-mono font-bold text-white tracking-tighter" style={{ textShadow: "0 0 30px rgba(0,255,136,0.5)" }}>
              ${totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            <GlowButton variant="primary" className="w-full md:w-auto text-lg py-4 px-8 bg-[#00FF88] hover:bg-[#2CEFFF] text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]" icon={<Zap className="w-5 h-5" />}>
              Apply All Recommendations
            </GlowButton>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="p-6 border border-[#FF3366]/30 bg-[#FF3366]/5 rounded-xl text-[#FF3366] font-mono text-sm text-center flex items-center justify-center gap-3">
          <Activity className="w-5 h-5 animate-pulse" />
          [ ROUTINE FAILURE: {error} ]
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="font-heading font-bold text-lg text-white">Suggested Sequences</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          {suggestions.length === 0 ? (
            <div className="p-16 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-black/20">
              <CheckCircle2 className="w-16 h-16 text-[#00FF88] mb-4 drop-shadow-[0_0_15px_rgba(0,255,136,0.4)]" />
              <h3 className="text-xl font-heading font-bold text-white mb-2">System Optimized</h3>
              <p className="text-sm font-mono text-[#94A3B8] max-w-md">All neural pathways are operating at maximum financial efficiency. Re-evaluating continuously.</p>
            </div>
          ) : (
            suggestions.map((s, i) => {
              const isHighConf = s.confidence === "high";
              const confColor = isHighConf ? "#00FF88" : "#FFB800";
              
              return (
                <GlassCard key={i} delayIndex={i} className="flex flex-col md:flex-row items-center justify-between p-6 gap-6 relative overflow-hidden group">
                  
                  {/* Left: Details */}
                  <div className="flex-1 flex flex-col relative z-10 w-full">
                    
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-widest bg-black/40 border border-white/10 text-white">
                        <Zap className="w-3 h-3 text-[#00F0FF]" /> SEQUENCE OVERRIDE
                      </span>
                      <span 
                        className="px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest border bg-black/40"
                        style={{ borderColor: `${confColor}30`, color: confColor }}
                      >
                       {s.confidence} CONFIDENCE
                      </span>
                      {s.team && (
                        <span className="px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest bg-white/5 border border-white/10 text-[#94A3B8]">
                          UNIT: {s.team}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-2 md:gap-4 font-mono mb-2">
                      <span className="text-sm md:text-base text-white bg-white/5 px-3 py-1.5 rounded">{s.currentModel}</span>
                      <ArrowRight className="w-5 h-5 text-[#00F0FF] animate-pulse" />
                      <span className="text-sm md:text-base text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-3 py-1.5 rounded shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                        {s.suggestedModel}
                      </span>
                    </div>

                    <p className="text-sm text-[#94A3B8] leading-relaxed max-w-2xl mt-2 font-body">
                      {s.rationale}
                    </p>
                  </div>

                  {/* Right: Savings & CTA */}
                  <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between md:items-end md:justify-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 relative z-10">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] font-mono text-[#00FF88] uppercase tracking-widest mb-1 flex items-center justify-start md:justify-end gap-1">
                        <Percent className="w-3 h-3" /> Net Gain
                      </div>
                      <div className="text-3xl font-mono font-bold text-[#00FF88]" style={{ textShadow: "0 0 15px rgba(0,255,136,0.3)" }}>
                        ${s.monthlySavings.toFixed(2)}<span className="text-sm text-[#00FF88]/50">/mo</span>
                      </div>
                      <div className="text-xs font-mono text-[#475569] mt-1 whitespace-nowrap">
                        <span className="line-through">${s.currentMonthlyCost.toFixed(2)}</span>
                        {" → "}
                        <span className="text-white">${s.projectedMonthlyCost.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button className="hidden sm:flex px-6 py-2.5 bg-white/5 hover:bg-[#00FF88]/10 text-white hover:text-[#00FF88] hover:border-[#00FF88]/50 border border-white/10 rounded-lg font-heading text-sm transition-all whitespace-nowrap">
                      Execute Route
                    </button>
                  </div>

                  {/* Hover Scan */}
                  <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-white/10 to-transparent -translate-x-full group-hover:animate-[scanHorizontal_1s_ease-out] pointer-events-none" />
                </GlassCard>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
