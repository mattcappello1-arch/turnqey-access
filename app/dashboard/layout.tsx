import { requireAuth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { org, member } = await requireAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={org.name} role={member.role} />
      <main className="flex-1 min-w-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
