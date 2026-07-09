import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { org, member, email } = await requireAuth();

  const admin = createAdminClient();
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const propertyIds = (sites ?? []).map((s: { property_id: string }) => s.property_id);

  return (
    <div className="flex min-h-screen" style={{ background: "#F7F5F0" }}>
      <Sidebar orgName={org.name} role={member.role} userEmail={email} propertyIds={propertyIds} />
      <main className="flex-1 min-w-0 p-6 md:p-8 max-w-[1200px]">
        {children}
      </main>
    </div>
  );
}
