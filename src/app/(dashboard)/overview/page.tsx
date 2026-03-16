"use client";

import { useDashboard } from "@/hooks/use-api";
import { useDashboardPeriod } from "../dashboard-context";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { Zap, AlertTriangle, ArrowUpRight, ArrowDownRight, ShieldAlert, Cpu, DollarSign, Layers } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScanLine } from "@/components/ui/ScanLine";
import { useState, useEffect } from "react";

// ============================================================================
// Animated Ticker for Metric Cards
// ============================================================================
function TickerNumber({ value, prefix = "", isCurrency = false }: { value: number, prefix?: string, isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  // Fake ticker effect for "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      // 30% chance to minutely fluctuate up or down
      if (Math.random() > 0.7) {
        const variance = value * 0.001; 
        const change = (Math.random() * variance * 2) - variance;
        setDisplayValue(v => {
          const nv = v + change;
          // Slowly revert back to actual value to prevent drifting too far
          return nv + (value - nv) * 0.1;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [value]);

  const formatted = isCurrency 
    ? displayValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : displayValue.toFixed(1).replace(/\.0$/, '');

  return <span className="font-mono tracking-tight">{prefix}{formatted}</span>;
}

// ============================================================================
// Metric Card
// ============================================================================
function MetricCard({ title, value, trend, isCurrency, icon: Icon, glow, delay }: {
  title: string;
  value: number;
  trend?: number;
  isCurrency?: boolean;
  icon: any;
  glow: "cyan" | "green" | "purple" | "red" | "amber";
  delay: number;
}) {
  const isPositiveTrend = trend && trend > 0;
  
  // Map glow to hex for the icon circle
  const hexMap = { cyan: "#00F0FF", green: "#00FF88", purple: "#8B5CF6", red: "#FF3366", amber: "#FFB800" };
  const hex = hexMap[glow];

  return (
    <GlassCard glowColor={glow} animateIn delayIndex={delay} className="p-5 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center border"
          style={{ backgroundColor: `${hex}15`, borderColor: `${hex}30` }}
        >
          <Icon className="w-4 h-4" style={{ color: hex }} />
        </div>
        {trend != null && (
          <div className={`flex items-center gap-1 text-xs font-mono font-bold ${isPositiveTrend ? 'text-[#FFB800]' : 'text-[#00FF88]'}`}>
            {isPositiveTrend ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] mb-1">{title}</div>
        <div className="text-3xl text-white font-bold text-shadow-sm">
          <TickerNumber value={value} isCurrency={isCurrency} prefix={isCurrency ? "$" : ""} />
        </div>
      </div>

      {/* Fake sparkline background */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20 pointer-events-none fade-out-top">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,30 Q10,20 20,25 T40,15 T60,20 T80,5 T100,10 L100,30 Z" fill={hex} />
        </svg>
      </div>
    </GlassCard>
  );
}

// ============================================================================
// Skeleton Loader
// ============================================================================
function CommandSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-xl" />)}
      </div>
      <div className="skeleton h-[400px] rounded-xl w-full" />
      <div className="grid grid-cols-2 gap-6">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================================
// Custom Chart Tooltip
// ============================================================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0F1C]/95 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <p className="text-[#94A3B8] font-mono text-xs mb-3">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-6 font-mono text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 5px ${entry.color}` }} />
                <span className="text-white">{entry.name}</span>
              </div>
              <span className="font-bold" style={{ color: entry.color }}>${entry.value.toFixed(2)}</span>
            </div>
          ))}
          <div className="h-px bg-white/10 my-1" />
          <div className="flex items-center justify-between gap-6 font-mono text-xs">
            <span className="text-[#94A3B8]">TOTAL</span>
            <span className="text-white font-bold">
              ${payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ============================================================================
// Main Page End Component
// ============================================================================
export default function CommandPage() {
  const { period } = useDashboardPeriod();
  const { data, loading, error } = useDashboard(period, "day");

  if (loading) return <CommandSkeleton />;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 border border-[#FF3366]/30 bg-[#FF3366]/5 rounded-xl text-[#FF3366]">
      <AlertTriangle className="w-8 h-8 mb-4 animate-pulse" />
      <h2 className="font-heading font-bold text-lg mb-2">SYSTEM FAILURE</h2>
      <p className="font-mono text-sm opacity-80">{error}</p>
    </div>
  );

  const overview = data?.overview;
  const byProvider = data?.byProvider ?? [];
  const byModel = data?.byModel ?? [];
  const timeSeries = data?.timeSeries ?? [];
  const anomalies = data?.anomalies ?? [];
  const waste = data?.waste;

  // Unattributed key warning: waste categories include "unused_connectors"
  const unattributedWaste = waste?.categories?.find(c => c.type === "unused_connectors");

  // Colors mapping matching globals.css accents
  const provColors: Record<string, string> = {
    'openai': '#00FF88',      // accent-green
    'anthropic': '#FFB800',   // accent-amber
    'aws_bedrock': '#8B5CF6', // accent-purple
  };
  const defaultProviderColor = '#00F0FF'; // accent-cyan

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">

      {/* Unattributed Key Warning Banner */}
      {unattributedWaste && (
        <div className="flex items-center gap-4 p-4 bg-[#FFB800]/5 border border-[#FFB800]/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-[#FFB800] shrink-0 animate-pulse" />
          <p className="text-sm text-[#FFB800] flex-1">
            <span className="font-bold">Unattributed spend detected.</span>{" "}
            {unattributedWaste.description}
          </p>
          <Link
            href="/connectors"
            className="text-xs font-mono text-[#FFB800] border border-[#FFB800]/30 rounded-lg px-3 py-1.5 hover:bg-[#FFB800]/10 transition-colors whitespace-nowrap"
          >
            Set up attribution →
          </Link>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total AI Spend"
          value={overview?.totalSpend ?? 0}
          trend={overview?.spendChange ?? undefined}
          isCurrency
          icon={DollarSign}
          glow="cyan"
          delay={1}
        />
        <MetricCard
          title="Active Channels"
          value={overview?.activeTools ?? 0}
          trend={overview?.newToolsThisPeriod != null ? overview.newToolsThisPeriod : undefined}
          icon={Cpu}
          glow="green"
          delay={2}
        />
        <MetricCard 
          title="Detected Waste" 
          value={overview?.wasteDetected ?? 0} 
          isCurrency 
          icon={AlertTriangle} 
          glow="red" 
          delay={3} 
        />
        <MetricCard 
          title="ROI Matrix Score" 
          value={overview?.roiScore ?? 0} 
          icon={Zap} 
          glow="purple" 
          delay={4} 
        />
      </div>

      {/* Main Command Chart */}
      <GlassCard animateIn delayIndex={5} className="p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-bold text-lg text-white tracking-widest uppercase">Spend Topology</h2>
            <div className="h-px w-32 bg-gradient-to-r from-[#00F0FF]/50 to-transparent" />
          </div>
          <div className="text-xs font-mono text-[#94A3B8] border border-white/10 px-2 py-1 rounded bg-black/20">{period.toUpperCase()} SCAN</div>
        </div>

        {timeSeries.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center font-mono text-[#475569] border border-white/5 border-dashed rounded-lg bg-black/20">
            [ NO TELEMETRY DATA DETECTED ]
          </div>
        ) : (
          <div className="h-[350px] w-full relative">
            {/* Animated background grid effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
            
            <ScanLine vertical duration={10} color="rgba(0, 240, 255, 0.15)" />

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {byProvider.map((p) => {
                    const color = provColors[p.provider.toLowerCase()] || defaultProviderColor;
                    return (
                      <linearGradient key={p.provider} id={`grad-${p.provider}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-plex)" }} 
                  tickLine={false} 
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={v => `$${v}`} 
                  tick={{ fill: "#475569", fontSize: 10, fontFamily: "var(--font-plex)" }} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                
                {/* Dynamically render areas for each provider */}
                {byProvider.map((p) => {
                  const color = provColors[p.provider.toLowerCase()] || defaultProviderColor;
                  return (
                    <Area 
                      key={p.provider}
                      type="monotone" 
                      dataKey={(d) => d.byProvider[p.provider] || 0} 
                      name={p.displayName}
                      stackId="1" 
                      stroke={color} 
                      strokeWidth={2}
                      fill={`url(#grad-${p.provider})`} 
                      animationDuration={1500}
                      activeDot={{ r: 4, fill: color, stroke: "#000", strokeWidth: 2 }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      {/* Model Breakdown */}
      {byModel.length > 0 && (
        <GlassCard animateIn delayIndex={6} className="p-6">
          <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
            <Layers className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="font-heading font-bold text-lg text-white uppercase tracking-widest">Model Breakdown</h2>
            <div className="ml-auto text-xs font-mono text-[#475569]">{byModel.length} MODELS</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#475569] border-b border-white/5">
                  <th className="text-left pb-3 font-medium">Model</th>
                  <th className="text-right pb-3 font-medium">Requests</th>
                  <th className="text-right pb-3 font-medium">Tokens</th>
                  <th className="text-right pb-3 font-medium">Avg / Req</th>
                  <th className="text-right pb-3 font-medium">Total Cost</th>
                  <th className="pb-3 w-32" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {byModel.slice(0, 8).map((m, i) => {
                  const maxCost = byModel[0]?.totalCost || 1;
                  const pct = (m.totalCost / maxCost) * 100;
                  return (
                    <tr key={`${m.provider}-${m.model}-${i}`} className="group hover:bg-white/3 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                          <span className="text-white font-medium truncate max-w-[180px]">{m.model || "unknown"}</span>
                          <span className="text-[10px] text-[#475569] hidden sm:inline">{m.provider}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-[#94A3B8]">{m.requestCount.toLocaleString()}</td>
                      <td className="py-3 text-right text-[#94A3B8]">{m.totalTokens.toLocaleString()}</td>
                      <td className="py-3 text-right text-[#94A3B8]">${m.avgCostPerRequest.toFixed(4)}</td>
                      <td className="py-3 text-right font-bold text-[#00FF88]">${m.totalCost.toFixed(2)}</td>
                      <td className="py-3 pl-4">
                        <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full bg-[#8B5CF6] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Provider Matrix */}
        <GlassCard animateIn delayIndex={6} className="col-span-1 p-6 flex flex-col">
          <h2 className="font-heading font-bold text-lg text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Provider Matrix</h2>
          
          <div className="flex-1 flex flex-col gap-5 justify-center">
            {byProvider.length === 0 ? (
              <div className="text-center font-mono text-xs text-[#475569] my-auto">NO PROVIDERS LINKED</div>
            ) : (
              byProvider.slice(0, 5).map((p) => {
                const color = provColors[p.provider.toLowerCase()] || defaultProviderColor;
                return (
                  <div key={p.provider} className="group relative">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: color, color: color }} />
                        <span className="text-sm font-medium text-white group-hover:text-cyan-glow transition-all">{p.displayName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white text-sm">${p.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_currentColor]" 
                        style={{ width: `${p.percentage}%`, backgroundColor: color, color: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Right Col: Threat Detection (Anomalies) */}
        <GlassCard animateIn delayIndex={7} className="col-span-1 lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="font-heading font-bold text-lg text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#FF3366]" /> Threat Detection
            </h2>
            <div className="text-xs font-mono text-[#94A3B8]">{anomalies.length} ALERTS ACTIVE</div>
          </div>

          <div className="flex flex-col gap-3">
            {anomalies.length === 0 ? (
              <div className="h-32 flex items-center justify-center font-mono text-xs text-[#00FF88] border border-[#00FF88]/20 bg-[#00FF88]/5 rounded-lg shadow-[inset_0_0_10px_rgba(0,255,136,0.1)]">
                [ SYSTEM NOMINAL — NO THREATS DETECTED ]
              </div>
            ) : (
              anomalies.map(a => {
                const isHigh = a.severity === "high";
                const isMed = a.severity === "medium";
                const badgeClass = isHigh ? "badge-error pulse-red" : isMed ? "badge-warning" : "badge-info";
                const borderClass = isHigh ? "border-l-[#FF3366]" : isMed ? "border-l-[#FFB800]" : "border-l-[#00F0FF]";
                
                return (
                  <div key={a.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-black/20 border border-white/5 border-l-4 rounded-lg relative overflow-hidden group hover:bg-white/5 transition-colors ${borderClass}`}>
                    {/* Hover scanline */}
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white/10 to-transparent -translate-x-full group-hover:animate-[scanHorizontal_1.5s_ease-out] pointer-events-none" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`badge ${badgeClass}`}>{a.severity}</span>
                        <span className="font-heading font-bold text-white tracking-wide">{a.title}</span>
                      </div>
                      <p className="text-sm text-[#94A3B8]">{a.description}</p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
                      <div className="text-xs font-mono text-[#94A3B8]">IMPACT</div>
                      <div className="font-mono font-bold text-[#FFB800] text-lg">${a.estimatedImpact.toFixed(2)}/mo</div>
                    </div>
                    
                    <div className="hidden sm:flex items-center justify-center p-2">
                      <button className="text-[#00F0FF] hover:text-white hover:drop-shadow-[0_0_8px_#00F0FF] transition-all">
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}

// Ensure Recharts doesn't cause hydration mismatch by wrapping in dynamic if needed, 
// but since this is inside a 'use client' page, Next 14 handles it fine usually.
// The loading skeleton protects initial render.
