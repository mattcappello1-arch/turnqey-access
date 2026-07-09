import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GuestPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  // Get the guest stay
  const { data: stays } = await admin.rpc("get_guest_stay_by_id", { p_stay_id: token });
  const stay = (stays as { id: string; site_id: string; guest_name: string; guest_email: string | null; room_zone_id: string | null; common_zone_ids: string[]; check_in: string; check_out: string; status: string }[])?.[0];
  if (!stay) notFound();

  // Get org branding
  const { data: orgInfo } = await admin.rpc("get_org_for_site", { p_site_id: stay.site_id });
  const org = (orgInfo as { org_name: string; site_name: string; logo_url: string | null; primary_color: string; support_email: string | null; support_phone: string | null }[])?.[0];

  // Get room info
  let roomName: string | null = null;
  if (stay.room_zone_id) {
    const { data: zones } = await admin.rpc("get_enterprise_zones", { p_site_ids: [stay.site_id] });
    const room = (zones as { id: string; name: string; unit_number: string | null }[])?.find((z: { id: string }) => z.id === stay.room_zone_id);
    roomName = room ? (room.unit_number || room.name) : null;
  }

  const brandColor = org?.primary_color || "#0A0A0B";
  const isActive = stay.status === "checked_in";
  const isUpcoming = stay.status === "upcoming";
  const checkIn = new Date(stay.check_in);
  const checkOut = new Date(stay.check_out);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {org?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logo_url} alt={org.org_name} style={{ height: 40, margin: "0 auto 12px", display: "block" }} />
          ) : (
            <div style={{ fontSize: 14, fontWeight: 400, letterSpacing: "0.15em", color: brandColor, textTransform: "uppercase", marginBottom: 12 }}>{org?.org_name || "Welcome"}</div>
          )}
          <div style={{ fontSize: 12, color: "#8A8A8E" }}>{org?.site_name}</div>
        </div>

        {/* Main card */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 20, padding: "32px 28px", boxShadow: "0 12px 40px rgba(0,0,0,0.04)" }}>
          {/* Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: isActive ? "#0A6E3B" : isUpcoming ? "#B8860B" : "#8A8A8E",
              animation: isActive ? "pulse 2s ease infinite" : "none",
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: isActive ? "#0A6E3B" : isUpcoming ? "#B8860B" : "#8A8A8E" }}>
              {isActive ? "Access active" : isUpcoming ? "Upcoming stay" : stay.status.replace("_", " ")}
            </span>
          </div>

          {/* Guest info */}
          <div style={{ fontSize: 22, fontWeight: 300, color: "#0A0A0B", letterSpacing: -0.5, marginBottom: 4 }}>
            Welcome, {stay.guest_name.split(" ")[0]}
          </div>

          {roomName && (
            <div style={{ fontSize: 15, color: "#3A3A3D", marginBottom: 16 }}>Room {roomName}</div>
          )}

          {/* Dates */}
          <div style={{ display: "flex", gap: 24, padding: "16px 0", borderTop: "1px solid #E8E6E1", borderBottom: "1px solid #E8E6E1", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 4 }}>Check-in</div>
              <div style={{ fontSize: 14, color: "#0A0A0B", fontWeight: 500 }}>{checkIn.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
              <div style={{ fontSize: 12, color: "#8A8A8E" }}>{checkIn.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 4 }}>Check-out</div>
              <div style={{ fontSize: 14, color: "#0A0A0B", fontWeight: 500 }}>{checkOut.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
              <div style={{ fontSize: 12, color: "#8A8A8E" }}>{checkOut.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>

          {/* Access methods */}
          {isActive && (
            <div style={{ padding: "20px 0" }}>
              {/* NFC tap */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: `${brandColor}12`, border: `2px solid ${brandColor}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px", cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: brandColor, textTransform: "uppercase" }}>Tap to unlock</div>
                <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 4 }}>Hold your phone near the lock</div>
              </div>

              {/* NFC badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderTop: "1px solid #E8E6E1", borderBottom: "1px solid #E8E6E1", marginBottom: 16 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 7v-1a2 2 0 012-2h16a2 2 0 012 2v1" />
                  <path d="M2 17v1a2 2 0 002 2h16a2 2 0 002-2v-1" />
                  <path d="M7 12h0" /><path d="M12 12h0" /><path d="M17 12h0" />
                  <path d="M6 8c4 0 6 2 6 4s-2 4-6 4" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 500, color: brandColor }}>NFC enabled</span>
                <span style={{ fontSize: 10, color: "#8A8A8E" }}>iPhone and Android</span>
              </div>

              {/* Alternative: PIN */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 6 }}>Or use your code on the keypad</div>
                <div style={{ fontSize: 11, color: "#8A8A8E" }}>Your access code was sent to your email</div>
              </div>
            </div>
          )}

          {isUpcoming && (
            <div style={{ textAlign: "center", padding: "20px 0", background: "#F7F5F0", borderRadius: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: "#3A3A3D" }}>Your access will be active from</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B", marginTop: 4 }}>
                {checkIn.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            </div>
          )}

          {!isActive && !isUpcoming && (
            <div style={{ textAlign: "center", padding: "20px 0", background: "#F7F5F0", borderRadius: 12 }}>
              <div style={{ fontSize: 13, color: "#8A8A8E" }}>This stay has ended.</div>
            </div>
          )}
        </div>

        {/* Support */}
        {(org?.support_email || org?.support_phone) && (
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#8A8A8E" }}>
            Need help?{" "}
            {org.support_email && <a href={`mailto:${org.support_email}`} style={{ color: "#3A3A3D" }}>Email us</a>}
            {org.support_email && org.support_phone && " or "}
            {org.support_phone && <a href={`tel:${org.support_phone}`} style={{ color: "#3A3A3D" }}>call {org.support_phone}</a>}
          </div>
        )}

        {/* Powered by */}
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 10, color: "#8A8A8E", letterSpacing: 1 }}>
          Powered by Turnqey Access
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
