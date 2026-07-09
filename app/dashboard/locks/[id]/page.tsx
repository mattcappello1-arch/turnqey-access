import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { LockControl } from "../LockControl";

export const dynamic = "force-dynamic";

export default async function LockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { org } = await requireAuth();
  const admin = createAdminClient();

  // Get the lock
  const { data: lock } = await admin.from("locks").select("*").eq("id", id).maybeSingle();
  if (!lock) return <div style={{ padding: 48, textAlign: "center", color: "#8A8A8E" }}>Lock not found.</div>;

  // Verify it belongs to this org's sites
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const propertyIds = (sites ?? []).map((s: { property_id: string }) => s.property_id);
  if (!propertyIds.includes(lock.property_id)) {
    return <div style={{ padding: 48, textAlign: "center", color: "#8A8A8E" }}>Access denied.</div>;
  }

  const site = (sites ?? []).find((s: { property_id: string }) => s.property_id === lock.property_id) as { name: string } | undefined;

  // Get recent events for this lock
  const { data: events } = await admin.from("access_events").select("id,event_type,actor,occurred_at,source").eq("lock_id", id).order("occurred_at", { ascending: false }).limit(20);
  const eventList = (events ?? []) as { id: string; event_type: string; actor: string | null; occurred_at: string; source: string | null }[];

  // Get zones this lock is assigned to
  const allZoneIds = await admin.rpc("get_zone_locks", { p_zone_ids: (sites ?? []).map((s: { id: string }) => s.id) });
  // Actually need zone IDs from zones table first
  const { data: zones } = await admin.rpc("get_enterprise_zones", { p_site_ids: (sites ?? []).map((s: { id: string }) => s.id) });
  const zoneIds = (zones ?? []).map((z: { id: string }) => z.id);
  const { data: zoneLocks } = zoneIds.length > 0 ? await admin.rpc("get_zone_locks", { p_zone_ids: zoneIds }) : { data: [] };
  const assignedZones = (zoneLocks ?? [])
    .filter((zl: { lock_id: string }) => zl.lock_id === id)
    .map((zl: { zone_id: string }) => {
      const zone = (zones ?? []).find((z: { id: string }) => z.id === zl.zone_id) as { name: string; unit_number: string | null } | undefined;
      return zone ? (zone.unit_number || zone.name) : null;
    })
    .filter(Boolean);

  void allZoneIds;

  const batPct = lock.battery_level !== null ? Math.round(lock.battery_level * 100) : null;
  const isOffline = lock.is_online === false;
  const lastSync = lock.last_synced_at ? new Date(lock.last_synced_at) : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 13, color: "#8A8A8E" }}>
        <Link href="/dashboard/locks" style={{ color: "#8A8A8E", textDecoration: "none" }}>Locks</Link>
        <span>/</span>
        <span style={{ color: "#0A0A0B" }}>{lock.unit_label || lock.name}</span>
      </div>

      {/* Lock header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>{lock.unit_label || lock.name}</h1>
          {lock.unit_label && <div style={{ fontSize: 14, color: "#3A3A3D", marginBottom: 4 }}>{lock.name}</div>}
          <div style={{ fontSize: 13, color: "#8A8A8E" }}>{site?.name} · {lock.manufacturer} {lock.model}</div>
        </div>
        <LockControl lockId={lock.id} isLocked={lock.is_locked} isOnline={lock.is_online} />
      </div>

      {/* Status cards */}
      <div className="grid-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 28 }}>
        <div className="stat-card" style={{ padding: "16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: isOffline ? "#8A8A8E" : lock.is_locked ? "#8A3324" : "#0A6E3B" }} />
            <span style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>{isOffline ? "Offline" : lock.is_locked ? "Locked" : "Unlocked"}</span>
          </div>
          <div style={{ fontSize: 11, color: "#8A8A8E" }}>Current state</div>
        </div>

        <div className="stat-card" style={{ padding: "16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: batPct !== null && batPct < 20 ? "#8A3324" : "#0A0A0B" }}>{batPct !== null ? `${batPct}%` : "N/A"}</div>
          <div style={{ fontSize: 11, color: "#8A8A8E" }}>Battery</div>
        </div>

        <div className="stat-card" style={{ padding: "16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>{isOffline ? "Offline" : "Online"}</div>
          <div style={{ fontSize: 11, color: "#8A8A8E" }}>Connectivity</div>
        </div>

        <div className="stat-card" style={{ padding: "16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>{lastSync ? lastSync.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }) : "Never"}</div>
          <div style={{ fontSize: 11, color: "#8A8A8E" }}>Last synced</div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {/* Info */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B", marginBottom: 12 }}>Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Manufacturer", val: lock.manufacturer || "Unknown" },
              { label: "Model", val: lock.model || "Unknown" },
              { label: "Zones", val: assignedZones.length > 0 ? (assignedZones as string[]).join(", ") : "Not assigned" },
              { label: "Supports PIN", val: lock.supports_pin_codes ? "Yes" : "No" },
              { label: "Supports remote", val: lock.supports_remote ? "Yes" : "No" },
              { label: "Has keypad", val: lock.has_keypad ? "Yes" : "No" },
              { label: "Has gateway", val: lock.has_gateway ? "Yes" : "No" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#8A8A8E" }}>{r.label}</span>
                <span style={{ color: "#0A0A0B", fontWeight: 500 }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B", marginBottom: 12 }}>Capabilities</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              lock.supports_pin_codes && "PIN codes",
              lock.supports_remote && "Remote unlock",
              lock.supports_nfc && "NFC",
              lock.supports_fingerprint && "Fingerprint",
              lock.has_keypad && "Keypad",
              lock.has_gateway && "Gateway",
              lock.has_auto_lock && "Auto-lock",
              lock.has_door_sensor && "Door sensor",
              lock.has_wifi && "Wi-Fi",
              lock.has_bluetooth_5 && "Bluetooth 5",
              lock.supports_wallet_key && "Wallet key",
            ].filter(Boolean).map(cap => (
              <span key={cap as string} style={{ fontSize: 11, padding: "4px 10px", background: "rgba(10,110,59,0.06)", color: "#0A6E3B", borderRadius: 6, fontWeight: 500 }}>{cap}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B", marginBottom: 12 }}>Recent activity</h2>
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
          {eventList.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#8A8A8E", fontSize: 13 }}>No activity recorded yet.</div>
          ) : (
            eventList.map(ev => {
              const time = new Date(ev.occurred_at);
              const isUnlock = ev.event_type === "unlock";
              return (
                <div key={ev.id} className="list-row" style={{ padding: "10px 16px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isUnlock ? "#0A6E3B" : "#8A3324" }} />
                    <span style={{ fontSize: 13, color: "#0A0A0B", textTransform: "capitalize" }}>{ev.event_type}</span>
                    {ev.actor && <span style={{ fontSize: 12, color: "#8A8A8E" }}>by {ev.actor}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#8A8A8E", fontFamily: "'Courier New', monospace" }}>
                    {time.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} {time.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
