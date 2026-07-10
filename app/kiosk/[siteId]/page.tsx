import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { GuestStay } from "@/lib/types";
import { KioskClient } from "./client";

export const dynamic = "force-dynamic";

export default async function KioskPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const admin = createAdminClient();

  // Get site and org info
  const { data: orgInfo } = await admin.rpc("get_org_for_site", { p_site_id: siteId });
  const org = (orgInfo as { org_name: string; site_name: string; logo_url: string | null; primary_color: string }[])?.[0];
  if (!org) notFound();

  // Get today's check-ins
  const { data: stays } = await admin.rpc("get_enterprise_guest_stays", {
    p_site_ids: [siteId],
    p_statuses: ["upcoming", "checked_in"],
  });
  const stayList = (stays ?? []) as GuestStay[];
  const todayStays = stayList.filter(s =>
    s.status === "upcoming" && new Date(s.check_in).toDateString() === new Date().toDateString()
  );

  // Get room names
  const { data: zones } = await admin.rpc("get_enterprise_zones", { p_site_ids: [siteId] });
  const roomMap: Record<string, string> = {};
  for (const z of (zones ?? []) as { id: string; name: string; unit_number: string | null; zone_type: string }[]) {
    if (z.zone_type === "room") roomMap[z.id] = z.unit_number || z.name;
  }

  return (
    <KioskClient
      orgName={org.org_name}
      siteName={org.site_name}
      logoUrl={org.logo_url}
      primaryColor={org.primary_color}
      todayStays={todayStays.map(s => ({
        id: s.id,
        guest_name: s.guest_name,
        guest_email: s.guest_email,
        room: s.room_zone_id ? roomMap[s.room_zone_id] || null : null,
        check_in: s.check_in,
      }))}
      inHouseCount={stayList.filter(s => s.status === "checked_in").length}
    />
  );
}
