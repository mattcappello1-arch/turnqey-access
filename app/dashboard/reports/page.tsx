import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReportsClient } from "./client";

export const dynamic = "force-dynamic";

type AccessEvent = {
  id: string;
  property_id: string;
  lock_id: string | null;
  lock_name: string | null;
  zone_name: string | null;
  event_type: string;
  actor_name: string | null;
  actor_email: string | null;
  actor_type: string | null;
  method: string | null;
  status: string;
  occurred_at: string;
  metadata: Record<string, unknown>;
};

type SiteRow = { id: string; property_id: string; name: string };

export default async function ReportsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { org } = await requireAuth();
  const admin = createAdminClient();
  const sp = await props.searchParams;

  // Get sites
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const siteList = (sites ?? []) as SiteRow[];
  const propertyIds = siteList.map((s) => s.property_id);

  // Parse filters
  const from = typeof sp.from === "string" ? sp.from : "";
  const to = typeof sp.to === "string" ? sp.to : "";
  const zone = typeof sp.zone === "string" ? sp.zone : "";
  const eventType = typeof sp.type === "string" ? sp.type : "";

  // Query access events
  let events: AccessEvent[] = [];
  if (propertyIds.length > 0) {
    let query = admin
      .from("access_events")
      .select("*")
      .in("property_id", propertyIds)
      .order("occurred_at", { ascending: false })
      .limit(200);

    if (from) query = query.gte("occurred_at", `${from}T00:00:00`);
    if (to) query = query.lte("occurred_at", `${to}T23:59:59`);
    if (zone) query = query.eq("zone_name", zone);
    if (eventType) query = query.eq("event_type", eventType);

    const { data } = await query;
    events = (data ?? []) as AccessEvent[];
  }

  // Compute stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter((e) => e.occurred_at.slice(0, 10) === todayStr);
  const uniqueActors = new Set(todayEvents.map((e) => e.actor_email ?? e.actor_name).filter(Boolean));
  const zoneCounts = new Map<string, number>();
  for (const e of todayEvents) {
    const z = e.zone_name ?? "Unknown";
    zoneCounts.set(z, (zoneCounts.get(z) ?? 0) + 1);
  }
  let mostActiveZone = "—";
  let maxCount = 0;
  for (const [z, c] of zoneCounts) {
    if (c > maxCount) { mostActiveZone = z; maxCount = c; }
  }

  // Unique zones and event types for filters
  const allZones = [...new Set(events.map((e) => e.zone_name).filter(Boolean))] as string[];
  const allTypes = [...new Set(events.map((e) => e.event_type).filter(Boolean))] as string[];

  // Site map for display
  const siteMap: Record<string, string> = {};
  for (const s of siteList) siteMap[s.property_id] = s.name;

  return (
    <ReportsClient
      events={events}
      stats={{
        totalToday: todayEvents.length,
        uniqueUsers: uniqueActors.size,
        mostActiveZone,
      }}
      zones={allZones}
      eventTypes={allTypes}
      siteMap={siteMap}
      filters={{ from, to, zone, eventType }}
    />
  );
}
