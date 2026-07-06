"use client";

import { useState, useTransition } from "react";
import { createVisitorPass, revokeVisitorPass } from "./actions";
import type { VisitorPass, Zone, Site } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  visitor: "Visitor",
  contractor: "Contractor",
  delivery: "Delivery",
  emergency: "Emergency",
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: "rgba(10,110,59,0.1)", text: "#0A6E3B" },
  expired: { bg: "#E8E6E1", text: "#8A8A8E" },
  revoked: { bg: "rgba(138,50,36,0.1)", text: "#8A3324" },
};

const inputStyle: React.CSSProperties = {
  fontSize: 14,
  padding: "8px 12px",
  border: "1px solid #E8E6E1",
  borderRadius: 8,
  outline: "none",
  background: "#FFFFFF",
  color: "#0A0A0B",
  width: "100%",
};

const btnPrimary: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 18px",
  background: "#0A0A0B",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  padding: "4px 10px",
  background: "transparent",
  color: "#8A3324",
  border: "1px solid rgba(138,50,36,0.3)",
  borderRadius: 6,
  cursor: "pointer",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" }) +
    " " + d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
}

function PassRow({
  pass,
  zoneMap,
  canManage,
  onRevoke,
  pending,
}: {
  pass: VisitorPass;
  zoneMap: Map<string, string>;
  canManage: boolean;
  onRevoke: (id: string) => void;
  pending: boolean;
}) {
  const style = STATUS_STYLES[pass.status] || STATUS_STYLES.expired;
  const zoneNames = pass.zone_ids.map((zid) => zoneMap.get(zid) || "Unknown").join(", ");

  return (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, opacity: pending ? 0.6 : 1 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{pass.visitor_name}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: "#E8E6E1", color: "#3A3A3D", textTransform: "uppercase" }}>
            {TYPE_LABELS[pass.visitor_type] || pass.visitor_type}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: style.bg, color: style.text, textTransform: "uppercase" }}>
            {pass.status}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#8A8A8E", marginTop: 2 }}>
          {zoneNames && <span>{zoneNames} · </span>}
          {formatDateTime(pass.starts_at)} &ndash; {formatDateTime(pass.expires_at)}
        </div>
        {(pass.visitor_email || pass.visitor_phone) && (
          <div style={{ fontSize: 12, color: "#8A8A8E", marginTop: 1 }}>
            {pass.visitor_email}{pass.visitor_email && pass.visitor_phone ? " · " : ""}{pass.visitor_phone}
          </div>
        )}
      </div>
      {canManage && pass.status === "active" && (
        <button onClick={() => onRevoke(pass.id)} disabled={pending} style={btnDanger}>
          Revoke
        </button>
      )}
    </div>
  );
}

export function VisitorsClient({
  activePasses,
  expiredPasses,
  revokedPasses,
  sites,
  zones,
  canManage,
}: {
  activePasses: VisitorPass[];
  expiredPasses: VisitorPass[];
  revokedPasses: VisitorPass[];
  sites: Site[];
  zones: Zone[];
  canManage: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  // Form state
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("visitor");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");

  const zoneMap = new Map(zones.map((z) => [z.id, z.unit_number || z.name]));
  const siteZones = zones.filter((z) => z.site_id === siteId);

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setType("visitor");
    setSelectedZones([]);
    setStartsAt("");
    setExpiresAt("");
    setNotes("");
    setShowForm(false);
  }

  function handleCreate() {
    if (!name.trim() || !siteId || !startsAt || !expiresAt) return;
    startTransition(async () => {
      await createVisitorPass({
        site_id: siteId,
        visitor_name: name.trim(),
        visitor_email: email.trim(),
        visitor_phone: phone.trim(),
        visitor_type: type,
        zone_ids: selectedZones,
        starts_at: new Date(startsAt).toISOString(),
        expires_at: new Date(expiresAt).toISOString(),
        notes: notes.trim(),
      });
      resetForm();
    });
  }

  function handleRevoke(passId: string) {
    if (!confirm("Revoke this visitor pass?")) return;
    startTransition(async () => {
      await revokeVisitorPass(passId);
    });
  }

  function toggleZone(zoneId: string) {
    setSelectedZones((prev) =>
      prev.includes(zoneId) ? prev.filter((z) => z !== zoneId) : [...prev, zoneId]
    );
  }

  return (
    <div>
      {/* Create button / form */}
      {canManage && (
        <div style={{ marginBottom: 16 }}>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={btnPrimary}>
              New pass
            </button>
          ) : (
            <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B", marginBottom: 14 }}>Create visitor pass</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Name */}
                <div>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Visitor name" style={inputStyle} />
                </div>
                {/* Type */}
                <div>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="visitor">Visitor</option>
                    <option value="contractor">Contractor</option>
                    <option value="delivery">Delivery</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                {/* Email */}
                <div>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="visitor@example.com" style={inputStyle} />
                </div>
                {/* Phone */}
                <div>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+61..." style={inputStyle} />
                </div>
                {/* Site */}
                <div>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Site *</label>
                  <select value={siteId} onChange={(e) => { setSiteId(e.target.value); setSelectedZones([]); }} style={{ ...inputStyle, cursor: "pointer" }}>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                {/* Notes */}
                <div>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Notes</label>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" style={inputStyle} />
                </div>
                {/* Start */}
                <div>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Starts at *</label>
                  <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={inputStyle} />
                </div>
                {/* End */}
                <div>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Expires at *</label>
                  <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Zone picker */}
              {siteZones.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 6 }}>Zones</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {siteZones.map((z) => {
                      const selected = selectedZones.includes(z.id);
                      return (
                        <button
                          key={z.id}
                          type="button"
                          onClick={() => toggleZone(z.id)}
                          style={{
                            fontSize: 12,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: selected ? "1px solid #0A0A0B" : "1px solid #E8E6E1",
                            background: selected ? "#0A0A0B" : "#FFFFFF",
                            color: selected ? "#FFFFFF" : "#3A3A3D",
                            cursor: "pointer",
                          }}
                        >
                          {z.unit_number || z.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={handleCreate} disabled={pending} style={{ ...btnPrimary, opacity: pending ? 0.6 : 1 }}>
                  {pending ? "Creating..." : "Create pass"}
                </button>
                <button onClick={resetForm} style={{ ...btnPrimary, background: "transparent", color: "#8A8A8E", border: "1px solid #E8E6E1" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active passes */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0A6E3B", marginBottom: 8 }}>Active ({activePasses.length})</h2>
        <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
          {activePasses.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#8A8A8E", fontSize: 14 }}>No active visitor passes.</div>
          ) : (
            activePasses.map((p) => (
              <PassRow key={p.id} pass={p} zoneMap={zoneMap} canManage={canManage} onRevoke={handleRevoke} pending={pending} />
            ))
          )}
        </div>
      </div>

      {/* Expired */}
      {expiredPasses.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#8A8A8E", marginBottom: 8 }}>Expired ({expiredPasses.length})</h2>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            {expiredPasses.slice(0, 20).map((p) => (
              <PassRow key={p.id} pass={p} zoneMap={zoneMap} canManage={canManage} onRevoke={handleRevoke} pending={pending} />
            ))}
          </div>
        </div>
      )}

      {/* Revoked */}
      {revokedPasses.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#8A3324", marginBottom: 8 }}>Revoked ({revokedPasses.length})</h2>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            {revokedPasses.slice(0, 20).map((p) => (
              <PassRow key={p.id} pass={p} zoneMap={zoneMap} canManage={canManage} onRevoke={handleRevoke} pending={pending} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
