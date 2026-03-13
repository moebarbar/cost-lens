"use client";

import { usePathname } from "next/navigation";
import { useDashboardPeriod, DashboardPeriod } from "./dashboard-context";

const PERIODS: { label: string; value: DashboardPeriod }[] = [
  { label: "7D",  value: "7d"  },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "12M", value: "12m" },
];

// Map path segments to readable names for the breadcrumb
const PAGE_LABELS: Record<string, string> = {
  overview:   "Command Center",
  costs:      "Cost Intelligence",
  teams:      "Team Matrix",
  alerts:     "Alert Grid",
  connectors: "Neural Links",
  optimize:   "Optimizer",
  settings:   "System Config",
};

export function DashboardTopBar() {
  const { period, setPeriod } = useDashboardPeriod();
  const pathname = usePathname();

  // Derive page label from the first path segment
  const segment = pathname.split("/").filter(Boolean)[0] ?? "overview";
  const pageLabel = PAGE_LABELS[segment] ?? "Command Center";

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0A0F1C]/80 backdrop-blur-md sticky top-0 z-40">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-mono text-[#475569]">
        <span>CostLens</span>
        <span className="text-white/20">/</span>
        <span className="text-[#94A3B8]">{pageLabel}</span>
      </div>

      <div className="flex items-center gap-6">

        {/* Period Toggle — only show on overview where it has an effect */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                period === p.value
                  ? "bg-[#00F0FF]/10 text-[#00F0FF] shadow-[inset_0_0_8px_rgba(0,240,255,0.2)]"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/5"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-white/10" />

        {/* LIVE Status Indicator */}
        <div className="flex items-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/20 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-[#00FF88] tracking-widest uppercase mt-0.5">Live</span>
        </div>

        {/* Notification Bell */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#94A3B8] hover:text-white transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF3366] shadow-[0_0_8px_#FF3366] animate-pulse" />
        </button>

      </div>
    </header>
  );
}
