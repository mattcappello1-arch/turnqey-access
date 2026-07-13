"use client";

import { useState, useTransition } from "react";
import { createPmsConnection, deletePmsConnection } from "./pms-actions";

type SiteOption = { id: string; name: string };
type PmsConnection = {
  id: string;
  site_id: string;
  provider: string;
  webhook_secret: string;
  auto_checkin: boolean;
  auto_checkout: boolean;
  room_mapping: Record<string, string>;
  last_synced_at: string | null;
  created_at: string;
};

const PROVIDERS = [
  { value: "mews", label: "Mews" },
  { value: "cloudbeds", label: "Cloudbeds" },
  { value: "rms", label: "RMS" },
  { value: "generic", label: "Generic webhook" },
];

const WEBHOOK_URL = "https://access.turnqey.com.au/api/pms/webhook";

function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "whsec_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function PmsConnections({
  connections,
  sites,
}: {
  connections: PmsConnection[];
  sites: SiteOption[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [provider, setProvider] = useState("mews");
  const [secret, setSecret] = useState(() => generateSecret());
  const [autoCheckin, setAutoCheckin] = useState(true);
  const [autoCheckout, setAutoCheckout] = useState(true);
  const [roomMapping, setRoomMapping] = useState("{}");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function handleAdd() {
    if (!siteId) return;
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(roomMapping);
    } catch {
      setError("Invalid JSON in room mapping.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createPmsConnection({
        site_id: siteId,
        provider,
        webhook_secret: secret,
        auto_checkin: autoCheckin,
        auto_checkout: autoCheckout,
        room_mapping: parsed,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setShowAdd(false);
        setSecret(generateSecret());
        setRoomMapping("{}");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this PMS connection?")) return;
    startTransition(async () => {
      const result = await deletePmsConnection(id);
      if (result.error) setError(result.error);
    });
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 13,
    color: "var(--ink)",
    background: "var(--bg)",
    border: "1px solid var(--hairline)",
    borderRadius: 10,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--graphite)",
    marginBottom: 4,
    display: "block",
  };

  const siteName = (id: string): string => sites.find(s => s.id === id)?.name ?? "Unknown";

  return (
    <div>
      {/* Existing connections */}
      {connections.length === 0 && !showAdd && (
        <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 16 }}>
          No PMS connections configured yet.
        </p>
      )}

      {connections.map((conn) => (
        <div
          key={conn.id}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 12,
            padding: 20,
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                {PROVIDERS.find(p => p.value === conn.provider)?.label ?? conn.provider}
              </div>
              <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 2 }}>
                {siteName(conn.site_id)}
              </div>
            </div>
            <button
              onClick={() => handleDelete(conn.id)}
              disabled={pending}
              style={{
                fontSize: 12,
                color: "#8A3324",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Delete
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 12, color: "var(--graphite)" }}>
            <div>
              <span style={{ color: "var(--slate)" }}>Last synced: </span>
              {formatDate(conn.last_synced_at)}
            </div>
            <div>
              <span style={{ color: "var(--slate)" }}>Auto check-in: </span>
              {conn.auto_checkin ? "On" : "Off"}
            </div>
            <div>
              <span style={{ color: "var(--slate)" }}>Auto check-out: </span>
              {conn.auto_checkout ? "On" : "Off"}
            </div>
          </div>

          {/* Webhook secret */}
          <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <code style={{ fontSize: 11, color: "var(--graphite)", flex: 1, wordBreak: "break-all" }}>
              {conn.webhook_secret}
            </code>
            <button
              onClick={() => copyToClipboard(conn.webhook_secret, conn.id)}
              style={{
                fontSize: 11,
                padding: "4px 10px",
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                borderRadius: 6,
                cursor: "pointer",
                color: "var(--graphite)",
                whiteSpace: "nowrap",
              }}
            >
              {copied === conn.id ? "Copied" : "Copy secret"}
            </button>
          </div>

          {/* Room mapping */}
          {Object.keys(conn.room_mapping ?? {}).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--slate)", marginBottom: 6 }}>Room mapping</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 12 }}>
                {Object.entries(conn.room_mapping).map(([pms, zone]) => (
                  <div key={pms} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--slate)" }}>{pms}</span>
                    <span style={{ color: "var(--graphite)" }}>{zone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Webhook URL display */}
      {connections.length > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--slate)" }}>Webhook URL:</span>
          <code style={{ fontSize: 11, color: "var(--graphite)", flex: 1 }}>{WEBHOOK_URL}</code>
          <button
            onClick={() => copyToClipboard(WEBHOOK_URL, "url")}
            style={{
              fontSize: 11,
              padding: "4px 10px",
              background: "var(--surface)",
              border: "1px solid var(--hairline)",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--graphite)",
            }}
          >
            {copied === "url" ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {/* Add button */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 500,
            color: "#F7F5F0",
            background: "#0A0A0B",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
          className="btn-animate"
        >
          + Add PMS connection
        </button>
      )}

      {/* Add form */}
      {showAdd && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12, padding: 20, marginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 16 }}>New PMS connection</div>

          {error && (
            <div style={{ padding: "8px 12px", background: "#FDF2F0", color: "#8A3324", fontSize: 12, borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {/* Webhook URL info */}
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "var(--slate)", marginBottom: 4 }}>Webhook URL (configure in your PMS)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <code style={{ fontSize: 12, color: "var(--graphite)", flex: 1 }}>{WEBHOOK_URL}</code>
              <button
                onClick={() => copyToClipboard(WEBHOOK_URL, "add-url")}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "var(--graphite)",
                }}
              >
                {copied === "add-url" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Site</label>
              <select value={siteId} onChange={e => setSiteId(e.target.value)} style={inputStyle}>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Provider</label>
              <select value={provider} onChange={e => setProvider(e.target.value)} style={inputStyle}>
                {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Webhook secret */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Webhook secret</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={secret} readOnly style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }} />
              <button
                onClick={() => copyToClipboard(secret, "new-secret")}
                style={{
                  fontSize: 12,
                  padding: "10px 16px",
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "var(--graphite)",
                  whiteSpace: "nowrap",
                }}
              >
                {copied === "new-secret" ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => setSecret(generateSecret())}
                style={{
                  fontSize: 12,
                  padding: "10px 16px",
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "var(--graphite)",
                  whiteSpace: "nowrap",
                }}
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--graphite)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoCheckin}
                onChange={e => setAutoCheckin(e.target.checked)}
                style={{ accentColor: "#0A6E3B", width: 16, height: 16 }}
              />
              Auto check-in
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--graphite)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoCheckout}
                onChange={e => setAutoCheckout(e.target.checked)}
                style={{ accentColor: "#0A6E3B", width: 16, height: 16 }}
              />
              Auto check-out
            </label>
          </div>

          {/* Room mapping */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Room mapping (JSON)</label>
            <p style={{ fontSize: 11, color: "var(--slate)", marginBottom: 6 }}>
              Map PMS room numbers to zone names. Example: {`{"101": "Room 101", "102": "Suite A"}`}
            </p>
            <textarea
              value={roomMapping}
              onChange={e => setRoomMapping(e.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                fontFamily: "monospace",
                fontSize: 12,
                resize: "vertical",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAdd}
              disabled={pending || !siteId}
              className="btn-animate"
              style={{
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 500,
                color: "#F7F5F0",
                background: "#0A0A0B",
                border: "none",
                borderRadius: 10,
                cursor: pending ? "not-allowed" : "pointer",
                opacity: pending ? 0.6 : 1,
              }}
            >
              {pending ? "Saving..." : "Save connection"}
            </button>
            <button
              onClick={() => { setShowAdd(false); setError(null); }}
              style={{
                padding: "10px 20px",
                fontSize: 13,
                color: "var(--slate)",
                background: "none",
                border: "1px solid var(--hairline)",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
