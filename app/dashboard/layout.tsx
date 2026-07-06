import { requireAuth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { org, member, email } = await requireAuth();

  return (
    <div className="flex min-h-screen" style={{ background: "#F7F5F0" }}>
      <Sidebar orgName={org.name} role={member.role} userEmail={email} />
      <main className="flex-1 min-w-0 p-6 md:p-8 max-w-[1200px]">
        {children}
      </main>
    </div>
  );
}
