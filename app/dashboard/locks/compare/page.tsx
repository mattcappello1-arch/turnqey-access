import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LockComparePage() {
  const { org } = await requireAuth();
  const admin = createAdminClient();

  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const propertyIds = (sites ?? []).map((s: { property_id: string }) => s.property_id);

  const { data: locks } = propertyIds.length > 0
    ? await admin.from("locks").select("id,name,unit_label,is_locked,is_online,battery_level,manufacturer,model,supports_nfc,supports_pin_codes,supports_remote,has_keypad,has_gateway,has_auto_lock,last_synced_at,property_id,maintenance_mode").in("property_id", propertyIds).order("name")
    : { data: [] };

  const lockList = (locks ?? []) as {
    id: string; name: string; unit_label: string | null; is_locked: boolean | null; is_online: boolean | null;
    battery_level: number | null; manufacturer: string | null; model: string | null; supports_nfc: boolean;
    supports_pin_codes: boolean | null; supports_remote: boolean; has_keypad: boolean; has_gateway: boolean | null;
    has_auto_lock: boolean; last_synced_at: string | null; property_id: string; maintenance_mode: boolean;
  }[];

  const siteMap = new Map((sites ?? []).map((s: { property_id: string; name: string }) => [s.property_id, s.name]));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <Link href="/dashboard/locks" style={{ fontSize: 13, color: "var(--slate, #8A8A8E)", textDecoration: "none" }}>Locks</Link>
        <span style={{ color: "var(--hairline, #E8E6E1)" }}>/</span>
        <span style={{ fontSize: 13, color: "var(--ink, #0A0A0B)" }}>Compare</span>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "var(--ink, #0A0A0B)", marginBottom: 4 }}>Lock comparison</h1>
      <p style={{ fontSize: 14, color: "var(--slate, #8A8A8E)", marginBottom: 24 }}>{lockList.length} locks side by side</p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--hairline, #E8E6E1)" }}>
              {["Lock", "Site", "Status", "Battery", "NFC", "PIN", "Remote", "Keypad", "Gateway", "Auto-lock", "Maintenance", "Last sync"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "var(--slate, #8A8A8E)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lockList.map(lock => {
              const batPct = lock.battery_level !== null ? Math.round(lock.battery_level * 100) : null;
              const isOffline = lock.is_online === false;
              const siteName = (siteMap.get(lock.property_id) as string | undefined) || "";

              return (
                <tr key={lock.id} style={{ borderBottom: "1px solid var(--hairline, #E8E6E1)", opacity: isOffline ? 0.5 : 1 }}>
                  <td style={{ padding: "10px 12px" }}>
                    <Link href={`/dashboard/locks/${lock.id}`} style={{ color: "var(--ink, #0A0A0B)", textDecoration: "none", fontWeight: 500 }}>{lock.unit_label || lock.name}</Link>
                    {lock.unit_label && <div style={{ fontSize: 10, color: "var(--slate, #8A8A8E)" }}>{lock.name}</div>}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--slate, #8A8A8E)" }}>{siteName}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isOffline ? "#8A8A8E" : lock.is_locked ? "#8A3324" : "#0A6E3B" }} />
                      <span style={{ fontSize: 11, color: isOffline ? "#8A8A8E" : lock.is_locked ? "#8A3324" : "#0A6E3B" }}>
                        {isOffline ? "Offline" : lock.is_locked ? "Locked" : "Open"}
                      </span>
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: batPct !== null && batPct < 20 ? "#8A3324" : "var(--ink, #0A0A0B)", fontWeight: batPct !== null && batPct < 20 ? 600 : 400 }}>
                    {batPct !== null ? `${batPct}%` : "—"}
                  </td>
                  {[lock.supports_nfc, lock.supports_pin_codes, lock.supports_remote, lock.has_keypad, lock.has_gateway, lock.has_auto_lock, lock.maintenance_mode].map((val, i) => (
                    <td key={i} style={{ padding: "10px 12px", textAlign: "center" }}>
                      {val ? (
                        <span style={{ color: i === 6 ? "#B8860B" : "#0A6E3B", fontSize: 12 }}>
                          {i === 6 ? "⚠" : "✓"}
                        </span>
                      ) : (
                        <span style={{ color: "var(--hairline, #E8E6E1)" }}>—</span>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: "10px 12px", fontSize: 10, color: "var(--slate, #8A8A8E)", fontFamily: "'Courier New', monospace" }}>
                    {lock.last_synced_at ? new Date(lock.last_synced_at).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
