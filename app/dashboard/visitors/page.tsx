import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPermission } from "@/lib/permissions";
import type { VisitorPass, Zone, Site } from "@/lib/types";
import { VisitorsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function VisitorsPage() {
  const { org, member } = await requireAuth();
  const admin = createAdminClient();

  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const siteList = (sites ?? []) as Site[];
  const siteIds = siteList.map((s) => s.id);

  const [{ data: passes }, { data: zones }] = await Promise.all([
    siteIds.length > 0
      ? admin.rpc("get_visitor_passes", { p_site_ids: siteIds })
      : Promise.resolve({ data: [] }),
    siteIds.length > 0
      ? admin.rpc("get_enterprise_zones", { p_site_ids: siteIds })
      : Promise.resolve({ data: [] }),
  ]);

  const passList = (passes ?? []) as VisitorPass[];
  const zoneList = (zones ?? []) as Zone[];
  const canManage = hasPermission(member.role, "visitors:manage");

  const activePasses = passList.filter((p) => p.status === "active");
  const expiredPasses = passList.filter((p) => p.status === "expired");
  const revokedPasses = passList.filter((p) => p.status === "revoked");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Visitor Passes</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>
          {activePasses.length} active · {expiredPasses.length} expired · {revokedPasses.length} revoked
        </p>
      </div>

      <VisitorsClient
        activePasses={activePasses}
        expiredPasses={expiredPasses}
        revokedPasses={revokedPasses}
        sites={siteList}
        zones={zoneList}
        canManage={canManage}
      />
    </div>
  );
}
