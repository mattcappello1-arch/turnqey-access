import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { SettingsForm } from "./form";
import { SiteManager } from "./SiteManager";
import { PmsConnections } from "./PmsConnections";

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

  // Get PMS connections for all org sites
  const siteIds = siteList.map(s => s.id);
  const { data: pmsRows } = siteIds.length > 0
    ? await admin.from("pms_connections").select("*").in("site_id", siteIds).order("created_at", { ascending: false })
    : { data: [] };
  const pmsConnections = (pmsRows ?? []) as {
    id: string;
    site_id: string;
    provider: string;
    webhook_secret: string;
    auto_checkin: boolean;
    auto_checkout: boolean;
    room_mapping: Record<string, string>;
    last_synced_at: string | null;
    created_at: string;
  }[];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "var(--ink)", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--slate)" }}>Organisation details, sites, and branding</p>
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
        <h2 style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)", marginBottom: 16 }}>Sites</h2>
        <SiteManager orgId={org.id} sites={siteList} availableProperties={availableProperties} />
      </div>

      {/* PMS connections section */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>PMS Connections</h2>
        <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 16 }}>
          Connect your property management system to sync reservations and automate guest access.
        </p>
        <PmsConnections
          connections={pmsConnections}
          sites={siteList.map(s => ({ id: s.id, name: s.name }))}
        />
      </div>

      {/* Data export */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>Data Export</h2>
        <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 16 }}>
          Download a complete export of your organisation data for compliance or backup.
        </p>
        <a
          href="/api/export"
          download
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--ink, #0A0A0B)", color: "var(--bg, #F7F5F0)", borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Export all data (JSON)
        </a>
      </div>
    </div>
  );
}
