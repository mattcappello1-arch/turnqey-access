import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GuestStay } from "@/lib/types";
import { GuestStatusButton, DeleteStayButton } from "./GuestActions";
import { AddGuestForm } from "./AddGuestForm";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: "#E8E6E1", text: "#3A3A3D" },
  checked_in: { bg: "rgba(10,110,59,0.1)", text: "#0A6E3B" },
  checked_out: { bg: "#E8E6E1", text: "#8A8A8E" },
  cancelled: { bg: "rgba(138,50,36,0.1)", text: "#8A3324" },
  no_show: { bg: "rgba(138,50,36,0.1)", text: "#8A3324" },
};

export default async function GuestsPage() {
  const { org } = await requireAuth();
  const admin = createAdminClient();

  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const siteIds = (sites ?? []).map((s: { id: string }) => s.id);

  const [{ data: stays }, { data: zones }] = await Promise.all([
    siteIds.length > 0
      ? admin.rpc("get_enterprise_guest_stays", { p_site_ids: siteIds, p_statuses: ["upcoming", "checked_in", "checked_out", "cancelled", "no_show"] })
      : Promise.resolve({ data: [] }),
    siteIds.length > 0
      ? admin.rpc("get_enterprise_zones", { p_site_ids: siteIds })
      : Promise.resolve({ data: [] }),
  ]);

  const stayList = (stays ?? []) as GuestStay[];
  const allZones = (zones ?? []) as { id: string; name: string; unit_number: string | null; site_id: string; zone_type: string }[];
  const roomZones = allZones.filter(z => z.zone_type === "room");
  const zoneMap = new Map(roomZones.map(z => [z.id, z.unit_number || z.name]));
  const siteMap = new Map((sites ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));

  const activeStays = stayList.filter(s => s.status === "checked_in");
  const upcomingStays = stayList.filter(s => s.status === "upcoming");
  const pastStays = stayList.filter(s => ["checked_out", "cancelled", "no_show"].includes(s.status));

  function StayRow({ stay }: { stay: GuestStay }) {
    const room = stay.room_zone_id ? (zoneMap.get(stay.room_zone_id) as string | undefined) : null;
    const site = (siteMap.get(stay.site_id) as string | undefined) || "";
    const style = STATUS_STYLES[stay.status] || STATUS_STYLES.upcoming;
    const checkIn = new Date(stay.check_in);
    const checkOut = new Date(stay.check_out);

    return (
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{stay.guest_name}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: style.bg, color: style.text, textTransform: "uppercase" }}>{stay.status.replace("_", " ")}</span>
          </div>
          <div style={{ fontSize: 12, color: "#8A8A8E", marginTop: 2 }}>
            {room && <span>Room {room} · </span>}
            {site} · {checkIn.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} to {checkOut.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
          </div>
          {stay.notes && <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 4 }}>{stay.notes}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GuestStatusButton stayId={stay.id} currentStatus={stay.status} />
          <DeleteStayButton stayId={stay.id} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Guests</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>{activeStays.length} in-house · {upcomingStays.length} upcoming</p>
      </div>

      <AddGuestForm
        sites={(sites ?? []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }))}
        zones={allZones}
      />

      {/* In-house */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0A6E3B", marginBottom: 8 }}>In-house ({activeStays.length})</h2>
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
          {activeStays.length === 0
            ? <div style={{ padding: 32, textAlign: "center", color: "#8A8A8E", fontSize: 14 }}>No guests currently in-house.</div>
            : activeStays.map(s => <StayRow key={s.id} stay={s} />)
          }
        </div>
      </div>

      {/* Upcoming */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#3A3A3D", marginBottom: 8 }}>Upcoming ({upcomingStays.length})</h2>
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
          {upcomingStays.length === 0
            ? <div style={{ padding: 32, textAlign: "center", color: "#8A8A8E", fontSize: 14 }}>No upcoming stays.</div>
            : upcomingStays.map(s => <StayRow key={s.id} stay={s} />)
          }
        </div>
      </div>

      {/* Past */}
      {pastStays.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#8A8A8E", marginBottom: 8 }}>Past ({pastStays.length})</h2>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            {pastStays.slice(0, 20).map(s => <StayRow key={s.id} stay={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}
