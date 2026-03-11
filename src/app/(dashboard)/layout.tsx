import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <DashboardSidebar
        orgName={(session.user as any)?.organizationName ?? "My Org"}
        userName={session.user?.name ?? "User"}
        userEmail={session.user?.email ?? ""}
      />
      <main style={{
        flex: 1,
        marginLeft: "240px",
        padding: "32px",
        minHeight: "100vh",
        overflow: "auto",
      }}>
        {children}
      </main>
    </div>
  );
}
