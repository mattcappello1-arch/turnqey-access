import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { QRCode } from "@/components/QRCode";

export const dynamic = "force-dynamic";

export default async function GuestCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: stays } = await admin.rpc("get_guest_stay_by_id", { p_stay_id: token });
  const stay = (stays as { id: string; site_id: string; guest_name: string; guest_email: string | null; room_zone_id: string | null; check_in: string; check_out: string; status: string; access_code_ids: string[] }[])?.[0];
  if (!stay) notFound();

  const { data: orgInfo } = await admin.rpc("get_org_for_site", { p_site_id: stay.site_id });
  const org = (orgInfo as { org_name: string; site_name: string; logo_url: string | null; primary_color: string; support_email: string | null; support_phone: string | null }[])?.[0];

  // Get room name
  let roomName: string | null = null;
  if (stay.room_zone_id) {
    const { data: zones } = await admin.rpc("get_enterprise_zones", { p_site_ids: [stay.site_id] });
    const room = (zones as { id: string; name: string; unit_number: string | null }[])?.find((z: { id: string }) => z.id === stay.room_zone_id);
    roomName = room ? (room.unit_number || room.name) : null;
  }

  // Get the access code PIN
  let pin: string | null = null;
  if (stay.access_code_ids?.length > 0) {
    const { data: codes } = await admin.from("access_codes").select("code").in("id", stay.access_code_ids).limit(1);
    pin = (codes as { code: string }[])?.[0]?.code || null;
  }

  const brandColor = org?.primary_color || "#0A0A0B";
  const checkIn = new Date(stay.check_in);
  const checkOut = new Date(stay.check_out);
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://access.turnqey.com.au"}/guest-portal/${token}`;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div id="guest-card" style={{ width: 380, background: "#FFFFFF", borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.06)", border: "1px solid #E8E6E1" }}>

        {/* Header */}
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid #E8E6E1" }}>
          <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.15em", color: brandColor, textTransform: "uppercase", marginBottom: 8 }}>{org?.org_name || "Welcome"}</div>
          <div style={{ fontSize: 22, fontWeight: 300, color: "#0A0A0B", letterSpacing: -0.5, marginBottom: 2 }}>Welcome, {stay.guest_name.split(" ")[0]}</div>
          <div style={{ fontSize: 13, color: "#8A8A8E" }}>{org?.site_name}</div>
        </div>

        {/* Room */}
        {roomName && (
          <div style={{ padding: "16px 28px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "#8A8A8E" }}>Room</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "#0A0A0B" }}>{roomName}</div>
          </div>
        )}

        {/* Dates */}
        <div style={{ padding: "16px 28px", borderBottom: "1px solid #E8E6E1", display: "flex", gap: 32 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 4 }}>Check-in</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{checkIn.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
            <div style={{ fontSize: 12, color: "#8A8A8E" }}>{checkIn.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 4 }}>Check-out</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{checkOut.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
            <div style={{ fontSize: 12, color: "#8A8A8E" }}>{checkOut.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>

        {/* Access code */}
        {pin && (
          <div style={{ padding: "24px 28px", borderBottom: "1px solid #E8E6E1", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 10 }}>Your access code</div>
            <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: 10, color: "#0A0A0B", fontFamily: "'Courier New', monospace" }}>{pin}</div>
            <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 8 }}>Enter this code on the door keypad</div>
          </div>
        )}

        {/* QR Code for self check-in */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #E8E6E1", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 10 }}>Scan to check in</div>
          <QRCode url={`${portalUrl.replace("/guest-portal/", "/api/checkin/")}`} size={140} />
          <div style={{ fontSize: 10, color: "#8A8A8E", marginTop: 8 }}>Scan this QR code at the lobby kiosk or with your phone</div>
        </div>

        {/* NFC */}
        <div style={{ padding: "16px 28px", borderBottom: "1px solid #E8E6E1", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 8c4 0 6 2 6 4s-2 4-6 4" />
            <path d="M2 7v-1a2 2 0 012-2h16a2 2 0 012 2v1" />
            <path d="M2 17v1a2 2 0 002 2h16a2 2 0 002-2v-1" />
          </svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#0A0A0B" }}>NFC unlock available</div>
            <div style={{ fontSize: 11, color: "#8A8A8E" }}>Hold your phone near the lock to enter</div>
          </div>
        </div>

        {/* Portal link */}
        <div style={{ padding: "16px 28px", borderBottom: "1px solid #E8E6E1", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 6 }}>Digital access</div>
          <div style={{ fontSize: 12, color: brandColor, wordBreak: "break-all" }}>{portalUrl}</div>
        </div>

        {/* Support */}
        <div style={{ padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "#8A8A8E" }}>
            {org?.support_email && <span>{org.support_email}</span>}
            {org?.support_email && org?.support_phone && <span> · </span>}
            {org?.support_phone && <span>{org.support_phone}</span>}
          </div>
          <div style={{ fontSize: 9, color: "#8A8A8E", letterSpacing: 1 }}>TURNQEY ACCESS</div>
        </div>
      </div>

      {/* Print button */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", gap: 8 }}>
        <button
          onClick={() => { if (typeof window !== "undefined") window.print(); }}
          style={{ padding: "12px 24px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          Print card
        </button>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          button, [style*="position: fixed"] { display: none !important; }
          #guest-card { box-shadow: none !important; border: 1px solid #E8E6E1 !important; }
        }
      `}</style>
    </div>
  );
}
