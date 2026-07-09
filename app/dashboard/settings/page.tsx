import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { SettingsForm } from "./form";
import { SiteManager } from "./SiteManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { org, member } = await requireAuth();
  if (member.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const siteList = (sites ?? []) as { id: string; name: string; address: string | null; site_type: string; property_id: string }[];

  // Get available properties (owned by org owner, not yet linked)
  const { data: properties } = await admin.from("properties").select("id,name").eq("owner_id", org.owner_id);
  const linkedPropertyIds = new Set(siteList.map(s => s.property_id));
  const availableProperties = (properties ?? []).filter((p: { id: string }) => !linkedPropertyIds.has(p.id)) as { id: string; name: string }[];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>Organisation details, sites, and branding</p>
      </div>

      <SettingsForm
        org={{
          name: org.name,
          support_email: org.support_email,
          support_phone: org.support_phone,
          timezone: org.timezone,
          primary_color: org.primary_color,
          logo_url: org.logo_url,
        }}
      />

      {/* Sites section */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 17, fontWeight: 500, color: "#0A0A0B", marginBottom: 16 }}>Sites</h2>
        <SiteManager orgId={org.id} sites={siteList} availableProperties={availableProperties} />
      </div>
    </div>
  );
}
