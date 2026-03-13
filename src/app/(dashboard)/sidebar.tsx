"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Bell, 
  Plug, 
  Zap, 
  Settings,
  LogOut
} from "lucide-react";
import { ScanLine } from "@/components/ui/ScanLine";

const NAV_ITEMS = [
  { href: "/overview",    icon: LayoutDashboard, label: "Command Center" },
  { href: "/costs",       icon: DollarSign,      label: "Cost Intelligence" },
  { href: "/teams",       icon: Users,           label: "Team Matrix" },
  { href: "/alerts",      icon: Bell,            label: "Alert Grid" },
  { href: "/connectors",  icon: Plug,            label: "Neural Links" },
  { href: "/optimize",    icon: Zap,             label: "Optimizer" },
  { href: "/settings",    icon: Settings,        label: "System Config" },
];

interface Props {
  orgName: string;
  userName: string;
  userRole: string;
  plan: string;
}

export function DashboardSidebar({ orgName, userName, userRole, plan }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[260px] bg-[#030712]/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-[100] overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#00F0FF]/10 to-transparent pointer-events-none" />
      <ScanLine vertical duration={12} opacity={0.5} />

      {/* Holographic Logo */}
      <div className="p-6 pb-8 border-b border-white/5 relative z-10 flex items-center gap-4 group">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF] to-[#00FF88] rounded-lg opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 border border-[#00F0FF] rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.3)] animate-[pulse_4s_ease-in-out_infinite]" />
          <span className="font-heading font-bold text-[#00F0FF] z-10 text-xl">C</span>
        </div>
        <div>
          <div className="font-heading font-bold text-lg tracking-tight text-white mb-0.5">CostLens</div>
          <div className="text-xs font-mono text-[#00F0FF] tracking-wider uppercase opacity-80">{orgName}</div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 relative z-10 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300
                ${active 
                  ? 'text-[#00F0FF] bg-[#00F0FF]/10' 
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5 hover:translate-x-1'}
              `}
            >
              {/* Active styling effects */}
              {active && (
                <>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/4 bg-[#00F0FF] rounded-r shadow-[0_0_10px_#00F0FF]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/0 via-[#00F0FF]/5 to-transparent rounded-lg" />
                </>
              )}
              
              <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : 'group-hover:scale-110'}`} />
              <span className="font-heading">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status / Plan */}
      <div className="px-6 py-4 flex flex-col gap-3 relative z-10">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-[#94A3B8]">SYSTEM STATUS</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 uppercase tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.2)]">
            {plan} TIER
          </span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-[#94A3B8] mb-1.5 font-mono">
            <span>Neural Links</span>
            <span>2 / 5 Active</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] w-2/5 shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5 bg-black/20 flex items-center gap-3 relative z-10 group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => signOut({ callbackUrl: "/login" })}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#8B5CF6] p-[2px]">
          <div className="w-full h-full bg-[#030712] rounded-full flex items-center justify-center text-[#F0F6FF] font-heading font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-heading font-bold text-white truncate">{userName}</div>
          <div className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider truncate">{userRole}</div>
        </div>
        <LogOut className="w-4 h-4 text-[#475569] group-hover:text-[#FF3366] transition-colors" />
      </div>

    </aside>
  );
}
