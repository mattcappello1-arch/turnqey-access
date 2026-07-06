"use client";

import { useState } from "react";
import { updateOrganization } from "./actions";

type OrgFields = {
  name: string;
  support_email: string | null;
  support_phone: string | null;
  timezone: string;
  primary_color: string;
  logo_url: string | null;
};

const TIMEZONES = [
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Perth",
  "Australia/Adelaide",
  "Australia/Hobart",
  "Pacific/Auckland",
  "Asia/Singapore",
  "Asia/Tokyo",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "UTC",
];

export function SettingsForm({ org }: { org: OrgFields }) {
  const [name, setName] = useState(org.name);
  const [supportEmail, setSupportEmail] = useState(org.support_email ?? "");
  const [supportPhone, setSupportPhone] = useState(org.support_phone ?? "");
  const [timezone, setTimezone] = useState(org.timezone);
  const [primaryColor, setPrimaryColor] = useState(org.primary_color);
  const [logoUrl, setLogoUrl] = useState(org.logo_url ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await updateOrganization({
      name: name.trim(),
      support_email: supportEmail.trim() || null,
      support_phone: supportPhone.trim() || null,
      timezone,
      primary_color: primaryColor,
      logo_url: logoUrl.trim() || null,
    });

    setSaving(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Settings saved." });
    }
  }

  return (
    <form onSubmit={handleSave}>
      {/* Organisation details */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#0A0A0B", marginBottom: 20 }}>Organisation details</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Organisation name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Support email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Support phone</label>
            <input
              type="tel"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="+61 400 000 000"
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={inputStyle}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#0A0A0B", marginBottom: 20 }}>Branding</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Primary colour (guest portal)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ width: 44, height: 44, border: "1px solid #E8E6E1", borderRadius: 10, cursor: "pointer", padding: 2 }}
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                maxLength={7}
                pattern="^#[0-9a-fA-F]{6}$"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              style={inputStyle}
            />
            {logoUrl && (
              <div style={{ marginTop: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  style={{ maxHeight: 40, maxWidth: 120, objectFit: "contain", borderRadius: 6, border: "1px solid #E8E6E1", padding: 4 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px 28px",
            background: "#0A0A0B",
            color: "#F7F5F0",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        {message && (
          <span style={{ fontSize: 13, color: message.type === "error" ? "#8A3324" : "#0A6E3B" }}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#3A3A3D",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: 14,
  color: "#0A0A0B",
  background: "#FFFFFF",
  border: "1px solid #E8E6E1",
  borderRadius: 10,
  outline: "none",
};
