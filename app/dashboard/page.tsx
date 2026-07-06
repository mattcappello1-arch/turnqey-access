import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GuestStay, Lock } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const { org, member } = await requireAuth();
  const admin = createAdminClient();

  // Get sites for this org
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const propertyIds = (sites ?? []).map((s: { property_id: string }) => s.property_id);
  const siteIds = (sites ?? []).map((s: { id: string }) => s.id);

  // Get locks and guest stays
  const [{ data: locks }, { data: stays }] = await Promise.all([
    propertyIds.length > 0
      ? admin.from("locks").select("id,name,unit_label,is_locked,is_online,battery_level,property_id").in("property_id", propertyIds)
      : Promise.resolve({ data: [] }),
    siteIds.length > 0
      ? admin.rpc("get_enterprise_guest_stays", { p_site_ids: siteIds, p_statuses: ["upcoming", "checked_in"] })
      : Promise.resolve({ data: [] }),
  ]);

  const lockList = (locks ?? []) as Lock[];
  const stayList = (stays ?? []) as GuestStay[];

  const totalLocks = lockList.length;
  const onlineLocks = lockList.filter(l => l.is_online !== false).length;
  const lockedCount = lockList.filter(l => l.is_locked === true).length;
  const lowBattery = lockList.filter(l => l.battery_level !== null && l.battery_level < 0.2).length;
  const todayCheckins = stayList.filter(s => s.status === "upcoming" && new Date(s.check_in).toDateString() === new Date().toDateString()).length;
  const currentGuests = stayList.filter(s => s.status === "checked_in").length;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Overview</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>{org.name} · {(sites ?? []).length} site{(sites ?? []).length !== 1 ? "s" : ""}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
        {[
          { val: totalLocks, label: "Total locks", sub: `${onlineLocks} online` },
          { val: lockedCount, label: "Locked", sub: `${totalLocks - lockedCount} unlocked` },
          { val: lowBattery, label: "Low battery", sub: "Below 20%", warn: lowBattery > 0 },
          { val: todayCheckins, label: "Check-ins today" },
          { val: currentGuests, label: "Guests in-house" },
          { val: (sites ?? []).length, label: "Sites" },
        ].map(s => (
          <div key={s.label} style={{ padding: "20px 18px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: -1, color: s.warn ? "#8A3324" : "#0A0A0B" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: 10, color: "#8A8A8E", marginTop: 2 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Today's check-ins */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#0A0A0B", marginBottom: 12 }}>Today&apos;s check-ins</h2>
        {todayCheckins === 0 ? (
          <div style={{ padding: 32, background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, textAlign: "center", color: "#8A8A8E", fontSize: 14 }}>No check-ins scheduled for today.</div>
        ) : (
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            {stayList.filter(s => s.status === "upcoming" && new Date(s.check_in).toDateString() === new Date().toDateString()).map(stay => (
              <div key={stay.id} style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{stay.guest_name}</div>
                  <div style={{ fontSize: 12, color: "#8A8A8E" }}>{stay.guest_email}</div>
                </div>
                <div style={{ fontSize: 12, color: "#8A8A8E" }}>
                  {new Date(stay.check_in).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low battery alerts */}
      {lowBattery > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: "#8A3324", marginBottom: 12 }}>Low battery alerts</h2>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            {lockList.filter(l => l.battery_level !== null && l.battery_level < 0.2).map(lock => (
              <div key={lock.id} style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, color: "#0A0A0B" }}>{lock.unit_label || lock.name}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#8A3324" }}>{Math.round((lock.battery_level ?? 0) * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
