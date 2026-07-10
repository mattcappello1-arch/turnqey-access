import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GuestStay } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { org } = await requireAuth();
  const admin = createAdminClient();

  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const propertyIds = (sites ?? []).map((s: { property_id: string }) => s.property_id);
  const siteIds = (sites ?? []).map((s: { id: string }) => s.id);

  // Get all guest stays (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: allStays } = siteIds.length > 0
    ? await admin.rpc("get_enterprise_guest_stays", { p_site_ids: siteIds, p_statuses: ["upcoming", "checked_in", "checked_out", "cancelled", "no_show"] })
    : await Promise.resolve({ data: [] });
  const stays = ((allStays ?? []) as GuestStay[]).filter(s => s.created_at > ninetyDaysAgo);

  // Get zones
  const { data: zones } = siteIds.length > 0
    ? await admin.rpc("get_enterprise_zones", { p_site_ids: siteIds })
    : await Promise.resolve({ data: [] });
  const roomZones = (zones ?? []).filter((z: { zone_type: string }) => z.zone_type === "room");

  // Get locks
  const { data: locks } = propertyIds.length > 0
    ? await admin.from("locks").select("id,battery_level,is_online").in("property_id", propertyIds)
    : await Promise.resolve({ data: [] });
  const lockList = (locks ?? []) as { id: string; battery_level: number | null; is_online: boolean | null }[];

  // Get access events (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = propertyIds.length > 0
    ? await admin.from("access_events").select("id,event_type,occurred_at").in("property_id", propertyIds).gte("occurred_at", thirtyDaysAgo)
    : await Promise.resolve({ data: [] });
  const eventList = (events ?? []) as { id: string; event_type: string; occurred_at: string }[];

  // Calculate metrics
  const totalStays = stays.length;
  const checkedIn = stays.filter(s => s.status === "checked_in").length;
  const checkedOut = stays.filter(s => s.status === "checked_out").length;
  const noShows = stays.filter(s => s.status === "no_show").length;
  const cancelled = stays.filter(s => s.status === "cancelled").length;
  const totalRooms = roomZones.length;
  const avgOccupancy = totalRooms > 0 ? Math.round((checkedIn / totalRooms) * 100) : 0;
  const totalEvents = eventList.length;
  const unlocks = eventList.filter(e => e.event_type === "unlock").length;
  const avgBattery = lockList.length > 0 ? Math.round(lockList.reduce((sum, l) => sum + (l.battery_level ?? 1) * 100, 0) / lockList.length) : 0;
  const offlineLocks = lockList.filter(l => l.is_online === false).length;

  // Check-ins per day (last 14 days)
  const last14Days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
    const count = stays.filter(s => s.check_in.slice(0, 10) === dateStr).length;
    last14Days.push({ date: label, count });
  }
  const maxDaily = Math.max(...last14Days.map(d => d.count), 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Analytics</h1>
          <p style={{ fontSize: 14, color: "#8A8A8E" }}>Performance overview for the last 90 days</p>
        </div>
        <Link href="/dashboard/reports" style={{ fontSize: 12, color: "#8A8A8E", textDecoration: "none", padding: "8px 16px", border: "1px solid #E8E6E1", borderRadius: 8 }}>Audit log</Link>
      </div>

      {/* Key metrics */}
      <div className="grid-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 28 }}>
        {[
          { val: totalStays, label: "Total stays", sub: "Last 90 days" },
          { val: `${avgOccupancy}%`, label: "Current occupancy", highlight: avgOccupancy > 70 },
          { val: checkedOut, label: "Completed stays" },
          { val: noShows + cancelled, label: "No-shows / cancelled", warn: noShows + cancelled > 0 },
          { val: totalEvents, label: "Access events", sub: "Last 30 days" },
          { val: unlocks, label: "Unlocks", sub: "Last 30 days" },
          { val: `${avgBattery}%`, label: "Avg battery" },
          { val: offlineLocks, label: "Offline locks", warn: offlineLocks > 0 },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: "16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: -1, color: s.warn ? "#8A3324" : s.highlight ? "#0A6E3B" : "#0A0A0B" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: 10, color: "#8A8A8E", marginTop: 1 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Check-in trend chart (CSS bar chart) */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B", marginBottom: 16 }}>Check-ins (last 14 days)</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
          {last14Days.map(d => (
            <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, color: "#8A8A8E" }}>{d.count || ""}</span>
              <div style={{
                width: "100%", minHeight: 4,
                height: `${(d.count / maxDaily) * 80}px`,
                background: d.count > 0 ? "#0A6E3B" : "#E8E6E1",
                borderRadius: 3,
                transition: "height 0.3s ease",
              }} />
              <span style={{ fontSize: 8, color: "#8A8A8E", whiteSpace: "nowrap" }}>{d.date.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stay breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Status breakdown */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B", marginBottom: 16 }}>Stay status breakdown</h2>
          {[
            { label: "Checked in", count: checkedIn, color: "#0A6E3B" },
            { label: "Checked out", count: checkedOut, color: "#3A3A3D" },
            { label: "Upcoming", count: stays.filter(s => s.status === "upcoming").length, color: "#B8860B" },
            { label: "Cancelled", count: cancelled, color: "#8A3324" },
            { label: "No-show", count: noShows, color: "#8A3324" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: "100%", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#3A3A3D" }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#0A0A0B" }}>{s.count}</span>
                </div>
                <div style={{ height: 4, background: "#E8E6E1", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: totalStays > 0 ? `${(s.count / totalStays) * 100}%` : "0%", background: s.color, borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lock health */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B", marginBottom: 16 }}>Lock health</h2>
          {[
            { label: "Total locks", val: lockList.length },
            { label: "Online", val: lockList.filter(l => l.is_online !== false).length },
            { label: "Offline", val: offlineLocks, warn: offlineLocks > 0 },
            { label: "Battery above 50%", val: lockList.filter(l => (l.battery_level ?? 1) > 0.5).length },
            { label: "Battery 20-50%", val: lockList.filter(l => (l.battery_level ?? 1) > 0.2 && (l.battery_level ?? 1) <= 0.5).length },
            { label: "Battery below 20%", val: lockList.filter(l => l.battery_level !== null && l.battery_level <= 0.2).length, warn: true },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E8E6E1", fontSize: 13 }}>
              <span style={{ color: "#8A8A8E" }}>{s.label}</span>
              <span style={{ fontWeight: 500, color: s.warn && s.val > 0 ? "#8A3324" : "#0A0A0B" }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
