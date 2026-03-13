import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./sidebar";
import { GlowButton } from "@/components/ui/GlowButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#030712] text-[#F0F6FF] selection:bg-[#00F0FF] selection:text-black">
      
      {/* Background Ambience for the whole dashboard */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-screen">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00F0FF]/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
      </div>

      <DashboardSidebar
        orgName={(session.user as any)?.organizationName ?? "Command HQ"}
        userName={session.user?.name ?? "Operator"}
        userRole={(session.user as any)?.role ?? "ADMIN"}
        plan={(session.user as any)?.plan ?? "PRO"}
      />
      
      <main className="flex-1 ml-[260px] min-h-screen flex flex-col relative z-10">
        
        {/* Top Header Bar */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0A0F1C]/80 backdrop-blur-md sticky top-0 z-40">
          
          <div className="flex items-center gap-2 text-sm font-mono text-[#475569]">
            <span>CostLens</span>
            <span className="text-white/20">/</span>
            <span className="text-[#94A3B8]">Command Center</span>
          </div>

          <div className="flex items-center gap-6">
            
            {/* Period Toggle */}
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
              {['7D', '30D', '90D', '12M'].map((p) => (
                <button 
                  key={p} 
                  className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                    p === '30D' 
                      ? 'bg-[#00F0FF]/10 text-[#00F0FF] shadow-[inset_0_0_8px_rgba(0,240,255,0.2)]' 
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p}
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

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
