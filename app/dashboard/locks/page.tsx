import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Lock } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LocksPage() {
  const { org } = await requireAuth();
  const admin = createAdminClient();

  const { data: sites } = await admin.schema("enterprise").from("sites").select("id,name,property_id").eq("org_id", org.id);
  const propertyIds = (sites ?? []).map(s => s.property_id);

  const { data: locks } = propertyIds.length > 0
    ? await admin.from("locks").select("id,name,unit_label,is_locked,is_online,battery_level,manufacturer,model,last_synced_at,property_id").in("property_id", propertyIds).order("name")
    : { data: [] };

  const lockList = (locks ?? []) as (Lock & { manufacturer: string | null; model: string | null; last_synced_at: string | null })[];
  const siteMap = new Map((sites ?? []).map(s => [s.property_id, s.name]));

  const online = lockList.filter(l => l.is_online !== false).length;
  const locked = lockList.filter(l => l.is_locked === true).length;
  const lowBat = lockList.filter(l => l.battery_level !== null && l.battery_level < 0.2).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Locks</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>{lockList.length} locks across {(sites ?? []).length} sites</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { val: `${online}/${lockList.length}`, label: "Online" },
          { val: locked, label: "Locked" },
          { val: lockList.length - locked, label: "Unlocked" },
          { val: lowBat, label: "Low battery", warn: lowBat > 0 },
        ].map(s => (
          <div key={s.label} style={{ padding: "14px 20px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12, textAlign: "center", minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 300, color: s.warn ? "#8A3324" : "#0A0A0B" }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "#8A8A8E" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Lock grid */}
      {lockList.length === 0 ? (
        <div style={{ padding: 48, background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, textAlign: "center", color: "#8A8A8E", fontSize: 14 }}>
          No locks connected yet. Add locks via the Turnqey dashboard, then assign them to zones here.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {lockList.map(lock => {
            const batPct = lock.battery_level !== null ? Math.round(lock.battery_level * 100) : null;
            const isOffline = lock.is_online === false;
            const isLow = batPct !== null && batPct < 20;
            const siteName = siteMap.get(lock.property_id) || "";

            return (
              <div key={lock.id} style={{
                padding: "16px 14px", background: "#FFFFFF", border: `1px solid ${isOffline ? "#8A332430" : "#E8E6E1"}`,
                borderRadius: 14, display: "flex", flexDirection: "column", gap: 8,
                opacity: isOffline ? 0.6 : 1,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B", lineHeight: 1.2 }}>{lock.unit_label || lock.name}</div>
                {lock.unit_label && <div style={{ fontSize: 11, color: "#8A8A8E" }}>{lock.name}</div>}
                <div style={{ fontSize: 10, color: "#8A8A8E" }}>{siteName}</div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: isOffline ? "#8A8A8E" : lock.is_locked ? "#8A3324" : "#0A6E3B",
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: isOffline ? "#8A8A8E" : lock.is_locked ? "#8A3324" : "#0A6E3B" }}>
                    {isOffline ? "Offline" : lock.is_locked ? "Locked" : "Unlocked"}
                  </span>
                </div>

                {batPct !== null && (
                  <div style={{ fontSize: 11, color: isLow ? "#8A3324" : "#8A8A8E", fontWeight: isLow ? 600 : 400 }}>
                    {batPct}% battery
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
