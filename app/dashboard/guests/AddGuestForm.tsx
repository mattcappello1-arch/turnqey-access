"use client";

import { useState, useTransition } from "react";
import { createGuestStay } from "./actions";

type SiteOption = { id: string; name: string };
type ZoneOption = { id: string; name: string; unit_number: string | null; site_id: string; zone_type: string };

export function AddGuestForm({ sites, zones }: { sites: SiteOption[]; zones: ZoneOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [siteId, setSiteId] = useState(sites[0]?.id || "");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [roomZoneId, setRoomZoneId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");

  const siteZones = zones.filter(z => z.site_id === siteId);
  const rooms = siteZones.filter(z => z.zone_type === "room");
  const commonAreas = siteZones.filter(z => ["common_area", "parking", "entrance"].includes(z.zone_type));

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ padding: "10px 20px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
        + New guest stay
      </button>
    );
  }

  function handleSubmit() {
    if (!guestName.trim() || !checkIn || !checkOut || !siteId) return;
    startTransition(async () => {
      await createGuestStay({
        site_id: siteId,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim() || null,
        guest_phone: guestPhone.trim() || null,
        room_zone_id: roomZoneId || null,
        common_zone_ids: commonAreas.map(z => z.id),
        check_in: new Date(checkIn).toISOString(),
        check_out: new Date(checkOut).toISOString(),
        notes: notes.trim() || null,
      });
      setGuestName(""); setGuestEmail(""); setGuestPhone("");
      setRoomZoneId(""); setCheckIn(""); setCheckOut(""); setNotes("");
      setOpen(false);
    });
  }

  const inputStyle = { width: "100%", padding: "10px 14px", fontSize: 13, color: "#0A0A0B", background: "#F7F5F0", border: "1px solid #E8E6E1", borderRadius: 10, outline: "none" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 500 as const, color: "#3A3A3D", marginBottom: 4 };

  return (
    <div style={{ padding: 20, background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>New guest stay</span>
        <button onClick={() => setOpen(false)} style={{ fontSize: 12, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Guest name *</label>
          <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Sarah Chen" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="guest@example.com" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="04xx xxx xxx" style={inputStyle} />
        </div>
        {sites.length > 1 && (
          <div>
            <label style={labelStyle}>Site</label>
            <select value={siteId} onChange={e => setSiteId(e.target.value)} style={inputStyle}>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label style={labelStyle}>Room</label>
          <select value={roomZoneId} onChange={e => setRoomZoneId(e.target.value)} style={inputStyle}>
            <option value="">No room assigned</option>
            {rooms.map(z => <option key={z.id} value={z.id}>{z.unit_number || z.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Check-in *</label>
          <input type="datetime-local" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Check-out *</label>
          <input type="datetime-local" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {commonAreas.length > 0 && (
        <div style={{ fontSize: 12, color: "#8A8A8E", marginBottom: 12 }}>
          Common areas included: {commonAreas.map(z => z.name).join(", ")}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Notes</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Late arrival, needs parking..." style={inputStyle} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={pending || !guestName.trim() || !checkIn || !checkOut}
        style={{ padding: "10px 24px", background: "#0A6E3B", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: pending ? "not-allowed" : "pointer", opacity: pending || !guestName.trim() ? 0.5 : 1 }}
      >
        {pending ? "Creating..." : "Create stay"}
      </button>
    </div>
  );
}
