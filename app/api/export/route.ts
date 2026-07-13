import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: memberRows } = await admin.rpc("get_org_member", { p_user_id: user.id });
  const member = (memberRows as { org_id: string; role: string }[])?.[0];
  if (!member || member.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { data: orgRows } = await admin.rpc("get_organization", { p_org_id: member.org_id });
  const org = (orgRows as { id: string; name: string }[])?.[0];
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  // Fetch all data
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const siteIds = (sites ?? []).map((s: { id: string }) => s.id);
  const propertyIds = (sites ?? []).map((s: { property_id: string }) => s.property_id);

  const [
    { data: zones },
    { data: stays },
    { data: members },
    { data: visitors },
    { data: locks },
  ] = await Promise.all([
    siteIds.length > 0 ? admin.rpc("get_enterprise_zones", { p_site_ids: siteIds }) : Promise.resolve({ data: [] }),
    siteIds.length > 0 ? admin.rpc("get_enterprise_guest_stays", { p_site_ids: siteIds, p_statuses: ["upcoming", "checked_in", "checked_out", "cancelled", "no_show"] }) : Promise.resolve({ data: [] }),
    admin.rpc("get_org_members", { p_org_id: org.id }),
    siteIds.length > 0 ? admin.rpc("get_visitor_passes", { p_site_ids: siteIds }) : Promise.resolve({ data: [] }),
    propertyIds.length > 0 ? admin.from("locks").select("id,name,unit_label,is_locked,is_online,battery_level,manufacturer,model").in("property_id", propertyIds) : Promise.resolve({ data: [] }),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    organization: org.name,
    sites: sites ?? [],
    zones: zones ?? [],
    guest_stays: stays ?? [],
    team_members: members ?? [],
    visitor_passes: visitors ?? [],
    locks: locks ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${org.name.replace(/[^a-z0-9]/gi, "_")}_export_${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
