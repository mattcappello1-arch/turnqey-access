"use client";

import { useState, useTransition } from "react";
import { editGuestStay } from "./actions";

type StayData = {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  notes: string | null;
};

export function EditStayButton({ stay }: { stay: StayData }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(stay.guest_name);
  const [email, setEmail] = useState(stay.guest_email || "");
  const [phone, setPhone] = useState(stay.guest_phone || "");
  const [checkIn, setCheckIn] = useState(stay.check_in.slice(0, 16));
  const [checkOut, setCheckOut] = useState(stay.check_out.slice(0, 16));
  const [notes, setNotes] = useState(stay.notes || "");

  function handleSave() {
    startTransition(async () => {
      await editGuestStay({
        id: stay.id,
        guest_name: name.trim(),
        guest_email: email.trim() || null,
        guest_phone: phone.trim() || null,
        check_in: new Date(checkIn).toISOString(),
        check_out: new Date(checkOut).toISOString(),
        notes: notes.trim() || null,
      });
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ fontSize: 11, color: "var(--slate, #8A8A8E)", background: "none", border: "none", cursor: "pointer" }}>
        Edit
      </button>
    );
  }

  const inputStyle = { width: "100%", padding: "8px 12px", fontSize: 13, color: "var(--ink, #0A0A0B)", background: "var(--bg, #F7F5F0)", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 8, outline: "none" };

  return (
    <>
      <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,10,11,0.4)", zIndex: 9998 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 420, background: "var(--surface, #FFFFFF)", borderRadius: 16, padding: 24,
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)", zIndex: 9999,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: "var(--ink, #0A0A0B)" }}>Edit stay</span>
          <button onClick={() => setOpen(false)} style={{ fontSize: 12, color: "var(--slate, #8A8A8E)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--graphite, #3A3A3D)", marginBottom: 4, display: "block" }}>Guest name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--graphite, #3A3A3D)", marginBottom: 4, display: "block" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--graphite, #3A3A3D)", marginBottom: 4, display: "block" }}>Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--graphite, #3A3A3D)", marginBottom: 4, display: "block" }}>Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--graphite, #3A3A3D)", marginBottom: 4, display: "block" }}>Check-in</label>
            <input type="datetime-local" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--graphite, #3A3A3D)", marginBottom: 4, display: "block" }}>Check-out</label>
            <input type="datetime-local" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={pending || !name.trim()}
          style={{ padding: "10px 24px", background: "var(--ink, #0A0A0B)", color: "var(--bg, #F7F5F0)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1 }}
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </>
  );
}
