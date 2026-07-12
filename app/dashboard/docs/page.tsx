import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const { org, member } = await requireAuth();
  const admin = createAdminClient();

  // Get PMS connections for webhook URL display
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://access.turnqey.com.au";

  const sections = [
    {
      title: "PMS Webhook",
      desc: "Receive reservation events from your PMS to auto-create guest stays.",
      endpoint: `POST ${baseUrl}/api/pms/webhook`,
      auth: "x-webhook-secret: <your webhook secret>",
      body: `{
  "event_type": "reservation.created",
  "reservation_id": "RES-12345",
  "guest_name": "Sarah Chen",
  "guest_email": "sarah@example.com",
  "room_number": "301",
  "check_in": "2026-07-15T14:00:00Z",
  "check_out": "2026-07-18T10:00:00Z"
}`,
      events: [
        { type: "reservation.created", desc: "New booking received" },
        { type: "reservation.updated", desc: "Booking modified (dates, room, guest)" },
        { type: "reservation.checked_in", desc: "Guest checked in (auto-generates access codes if enabled)" },
        { type: "reservation.checked_out", desc: "Guest checked out (access codes expire)" },
        { type: "reservation.cancelled", desc: "Booking cancelled" },
      ],
      providers: ["Mews", "Cloudbeds", "RMS Cloud", "Generic JSON"],
    },
    {
      title: "Kiosk Mode",
      desc: "Full-screen check-in view for lobby tablets.",
      endpoint: `GET ${baseUrl}/kiosk/<site-id>`,
      auth: "No authentication required",
      body: null,
      events: null,
      providers: null,
    },
    {
      title: "Guest Portal",
      desc: "White-labelled guest access page with NFC unlock and PIN display.",
      endpoint: `GET ${baseUrl}/guest-portal/<stay-id>`,
      auth: "No authentication required (stay ID acts as token)",
      body: null,
      events: null,
      providers: null,
    },
    {
      title: "Guest Access Card",
      desc: "Printable access card with PIN, room, and dates.",
      endpoint: `GET ${baseUrl}/guest-portal/<stay-id>/card`,
      auth: "No authentication required",
      body: null,
      events: null,
      providers: null,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>API and Integrations</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>Endpoints, webhooks, and integration guides for {org.name}</p>
      </div>

      {/* Site IDs reference */}
      {(sites ?? []).length > 0 && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B", marginBottom: 12 }}>Your site IDs</h2>
          {(sites ?? []).map((s: { id: string; name: string }) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E8E6E1", fontSize: 13 }}>
              <span style={{ color: "#3A3A3D" }}>{s.name}</span>
              <code style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#0A0A0B", background: "#F7F5F0", padding: "2px 8px", borderRadius: 4 }}>{s.id}</code>
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sections.map(section => (
          <div key={section.title} style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid #E8E6E1" }}>
              <h2 style={{ fontSize: 17, fontWeight: 500, color: "#0A0A0B", marginBottom: 4 }}>{section.title}</h2>
              <p style={{ fontSize: 13, color: "#8A8A8E" }}>{section.desc}</p>
            </div>

            <div style={{ padding: 20 }}>
              {/* Endpoint */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#8A8A8E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Endpoint</div>
                <code style={{ display: "block", fontFamily: "'Courier New', monospace", fontSize: 13, color: "#0A0A0B", background: "#F7F5F0", padding: "12px 16px", borderRadius: 8, border: "1px solid #E8E6E1", wordBreak: "break-all" }}>{section.endpoint}</code>
              </div>

              {/* Auth */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#8A8A8E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Authentication</div>
                <code style={{ display: "block", fontFamily: "'Courier New', monospace", fontSize: 12, color: "#3A3A3D", background: "#F7F5F0", padding: "10px 16px", borderRadius: 8, border: "1px solid #E8E6E1" }}>{section.auth}</code>
              </div>

              {/* Request body */}
              {section.body && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#8A8A8E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Request body (JSON)</div>
                  <pre style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#0A0A0B", background: "#0A0A0B", padding: "16px", borderRadius: 8, overflow: "auto", lineHeight: 1.6 }}>
                    <code style={{ color: "#F7F5F0" }}>{section.body}</code>
                  </pre>
                </div>
              )}

              {/* Events */}
              {section.events && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#8A8A8E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Event types</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {section.events.map(e => (
                      <div key={e.type} style={{ display: "flex", gap: 12, fontSize: 13, padding: "6px 0" }}>
                        <code style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#0A0A0B", background: "#F7F5F0", padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>{e.type}</code>
                        <span style={{ color: "#8A8A8E" }}>{e.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supported providers */}
              {section.providers && (
                <div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#8A8A8E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Supported providers</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {section.providers.map(p => (
                      <span key={p} style={{ fontSize: 12, fontWeight: 500, color: "#3A3A3D", padding: "6px 14px", background: "#F7F5F0", borderRadius: 8, border: "1px solid #E8E6E1" }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
