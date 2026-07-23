import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { GuestUnlockButton } from "./UnlockButton";

export const dynamic = "force-dynamic";

export default async function GuestPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: stays } = await admin.rpc("get_guest_stay_by_id", { p_stay_id: token });
  const stay = (stays as { id: string; site_id: string; guest_name: string; guest_email: string | null; room_zone_id: string | null; common_zone_ids: string[]; check_in: string; check_out: string; status: string; access_code_ids: string[] }[])?.[0];
  if (!stay) notFound();

  const { data: orgInfo } = await admin.rpc("get_org_for_site", { p_site_id: stay.site_id });
  const org = (orgInfo as { org_name: string; site_name: string; logo_url: string | null; primary_color: string; support_email: string | null; support_phone: string | null }[])?.[0];

  // Get zones
  const { data: zones } = await admin.rpc("get_enterprise_zones", { p_site_ids: [stay.site_id] });
  const allZones = (zones ?? []) as { id: string; name: string; unit_number: string | null; zone_type: string }[];
  const roomZone = stay.room_zone_id ? allZones.find(z => z.id === stay.room_zone_id) : null;
  const roomName = roomZone ? (roomZone.unit_number || roomZone.name) : null;
  const commonAreas = allZones.filter(z => (stay.common_zone_ids || []).includes(z.id));

  // Get PIN code
  let pin: string | null = null;
  if (stay.access_code_ids?.length > 0) {
    const { data: codes } = await admin.from("access_codes").select("code").in("id", stay.access_code_ids).limit(1);
    pin = (codes as { code: string }[])?.[0]?.code || null;
  }

  // Get locks for unlock button
  const accessZoneIds = [stay.room_zone_id, ...(stay.common_zone_ids || [])].filter(Boolean) as string[];
  let lockIds: string[] = [];
  if (accessZoneIds.length > 0) {
    const { data: zoneLocks } = await admin.rpc("get_zone_locks", { p_zone_ids: accessZoneIds });
    lockIds = Array.from(new Set((zoneLocks ?? []).map((zl: { lock_id: string }) => zl.lock_id))) as string[];
  }

  const brandColor = org?.primary_color || "#0A0A0B";
  const isActive = stay.status === "checked_in";
  const isUpcoming = stay.status === "upcoming";
  const isEnded = !isActive && !isUpcoming;
  const checkIn = new Date(stay.check_in);
  const checkOut = new Date(stay.check_out);
  const firstName = stay.guest_name.split(" ")[0];

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {org?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logo_url} alt={org.org_name} style={{ height: 36, margin: "0 auto 10px", display: "block" }} />
          ) : (
            <div style={{ fontSize: 13, fontWeight: 400, letterSpacing: "0.15em", color: brandColor, textTransform: "uppercase", marginBottom: 10 }}>{org?.org_name || "Welcome"}</div>
          )}
          <div style={{ fontSize: 12, color: "#8A8A8E" }}>{org?.site_name}</div>
        </div>

        {/* Main card */}
        <div style={{ background: "#FFFFFF", borderRadius: 24, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.05)", border: "1px solid #E8E6E1" }}>

          {/* Header */}
          <div style={{ padding: "28px 28px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: isActive ? "#0A6E3B" : isUpcoming ? "#B8860B" : "#8A8A8E",
                animation: isActive ? "portalPulse 2s ease infinite" : "none",
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: isActive ? "#0A6E3B" : isUpcoming ? "#B8860B" : "#8A8A8E" }}>
                {isActive ? "Access active" : isUpcoming ? "Arriving soon" : "Stay ended"}
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 300, color: "#0A0A0B", letterSpacing: -0.5, marginBottom: 2 }}>
              Welcome, {firstName}
            </div>
            {roomName && (
              <div style={{ fontSize: 16, color: "#3A3A3D", marginBottom: 4 }}>Room {roomName}</div>
            )}
          </div>

          {/* Dates bar */}
          <div style={{ display: "flex", padding: "16px 28px", margin: "16px 0 0", borderTop: "1px solid #E8E6E1", background: "#FAFAF8" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 1.5, color: "#8A8A8E", textTransform: "uppercase", marginBottom: 4 }}>In</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{checkIn.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
              <div style={{ fontSize: 12, color: "#8A8A8E" }}>{checkIn.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <div style={{ width: 1, background: "#E8E6E1", margin: "0 20px" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 1.5, color: "#8A8A8E", textTransform: "uppercase", marginBottom: 4 }}>Out</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{checkOut.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
              <div style={{ fontSize: 12, color: "#8A8A8E" }}>{checkOut.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>

          {/* Active state: unlock + PIN */}
          {isActive && (
            <>
              {/* Unlock button */}
              <div style={{ padding: "28px", textAlign: "center" }}>
                <GuestUnlockButton lockIds={lockIds} brandColor={brandColor} />
              </div>

              {/* PIN code */}
              {pin && (
                <div style={{ padding: "20px 28px", borderTop: "1px solid #E8E6E1", background: "#FAFAF8" }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 1.5, color: "#8A8A8E", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>Keypad code</div>
                  <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: 10, color: "#0A0A0B", fontFamily: "'Courier New', monospace", textAlign: "center" }}>{pin}</div>
                  <div style={{ fontSize: 11, color: "#8A8A8E", textAlign: "center", marginTop: 8 }}>Enter on the door keypad. Expires at check-out.</div>
                </div>
              )}

              {/* NFC badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 28px", borderTop: "1px solid #E8E6E1" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 8c4 0 6 2 6 4s-2 4-6 4" />
                  <path d="M2 7v-1a2 2 0 012-2h16a2 2 0 012 2v1" />
                  <path d="M2 17v1a2 2 0 002 2h16a2 2 0 002-2v-1" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 500, color: brandColor }}>NFC enabled</span>
                <span style={{ fontSize: 10, color: "#8A8A8E" }}>Hold phone near lock</span>
              </div>

              {/* Common areas */}
              {commonAreas.length > 0 && (
                <div style={{ padding: "16px 28px", borderTop: "1px solid #E8E6E1" }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 1.5, color: "#8A8A8E", textTransform: "uppercase", marginBottom: 10 }}>Your access includes</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {roomName && (
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#0A0A0B", padding: "6px 12px", background: "#F7F5F0", borderRadius: 8, border: "1px solid #E8E6E1" }}>Room {roomName}</span>
                    )}
                    {commonAreas.map(z => (
                      <span key={z.id} style={{ fontSize: 12, fontWeight: 500, color: "#3A3A3D", padding: "6px 12px", background: "#F7F5F0", borderRadius: 8, border: "1px solid #E8E6E1" }}>{z.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Upcoming state */}
          {isUpcoming && (
            <div style={{ padding: "32px 28px", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F7F5F0", border: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8A8E" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div style={{ fontSize: 15, color: "#3A3A3D", marginBottom: 4 }}>Your access starts on</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: "#0A0A0B" }}>
                {checkIn.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div style={{ fontSize: 13, color: "#8A8A8E", marginTop: 4 }}>
                at {checkIn.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          )}

          {/* Ended state */}
          {isEnded && (
            <div style={{ padding: "32px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#8A8A8E", marginBottom: 12 }}>This stay has ended.</div>
              <a href={`/feedback/${token}`} style={{ display: "inline-block", padding: "12px 28px", background: "#0A0A0B", color: "#F7F5F0", borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                Leave feedback
              </a>
            </div>
          )}
        </div>

        {/* Support */}
        {(org?.support_email || org?.support_phone) && (
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#8A8A8E" }}>
            Need help?{" "}
            {org.support_email && <a href={`mailto:${org.support_email}`} style={{ color: "#3A3A3D", textDecoration: "none", fontWeight: 500 }}>Email</a>}
            {org.support_email && org.support_phone && " · "}
            {org.support_phone && <a href={`tel:${org.support_phone}`} style={{ color: "#3A3A3D", textDecoration: "none", fontWeight: 500 }}>Call {org.support_phone}</a>}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 9, color: "#8A8A8E", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Powered by Turnqey
        </div>
      </div>

      <style>{`
        @keyframes portalPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(10,110,59,0.2); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(10,110,59,0); }
        }
      `}</style>
    </div>
  );
}
