import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./sidebar";
import { DashboardProvider } from "./dashboard-context";
import { DashboardTopBar } from "./top-bar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <DashboardProvider>
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
          <DashboardTopBar />

          {/* Page Content */}
          <div className="flex-1 p-8 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
