"use client";

import { useState, useTransition } from "react";
import { createGuestStay } from "./actions";

export function BulkImport({ siteId }: { siteId: string }) {
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleImport() {
    const lines = csv.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) { setResult("Need a header row and at least one data row."); return; }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    const nameIdx = headers.findIndex(h => h.includes("name"));
    const emailIdx = headers.findIndex(h => h.includes("email"));
    const phoneIdx = headers.findIndex(h => h.includes("phone"));
    const checkInIdx = headers.findIndex(h => h.includes("check") && h.includes("in"));
    const checkOutIdx = headers.findIndex(h => h.includes("check") && h.includes("out"));

    if (nameIdx === -1 || checkInIdx === -1 || checkOutIdx === -1) {
      setResult("CSV must have columns: guest_name, check_in, check_out. Email and phone are optional.");
      return;
    }

    startTransition(async () => {
      let created = 0;
      let failed = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
        const name = cols[nameIdx];
        const checkIn = cols[checkInIdx];
        const checkOut = cols[checkOutIdx];

        if (!name || !checkIn || !checkOut) { failed++; continue; }

        try {
          await createGuestStay({
            site_id: siteId,
            guest_name: name,
            guest_email: emailIdx >= 0 ? cols[emailIdx] || null : null,
            guest_phone: phoneIdx >= 0 ? cols[phoneIdx] || null : null,
            room_zone_id: null,
            common_zone_ids: [],
            check_in: new Date(checkIn).toISOString(),
            check_out: new Date(checkOut).toISOString(),
            notes: "Imported via CSV",
          });
          created++;
        } catch { failed++; }
      }

      setResult(`${created} guest${created !== 1 ? "s" : ""} imported${failed > 0 ? `, ${failed} failed` : ""}.`);
      setCsv("");
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ fontSize: 12, color: "#3A3A3D", background: "none", border: "1px solid #E8E6E1", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>
        Import CSV
      </button>
    );
  }

  return (
    <div style={{ padding: 20, background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>Import guests from CSV</span>
        <button onClick={() => { setOpen(false); setResult(null); }} style={{ fontSize: 12, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
      </div>
      <div style={{ fontSize: 12, color: "#8A8A8E", marginBottom: 12, lineHeight: 1.5 }}>
        Paste CSV with columns: <code style={{ background: "#F7F5F0", padding: "1px 4px", borderRadius: 3 }}>guest_name, guest_email, check_in, check_out</code>
        <br />Dates in ISO format (e.g. 2026-07-15T14:00) or any parseable format.
      </div>
      <textarea
        value={csv}
        onChange={e => setCsv(e.target.value)}
        placeholder={`guest_name,guest_email,check_in,check_out\nSarah Chen,sarah@example.com,2026-07-15T14:00,2026-07-18T10:00\nJohn Smith,john@example.com,2026-07-16T15:00,2026-07-19T11:00`}
        style={{ width: "100%", height: 120, fontSize: 12, fontFamily: "'Courier New', monospace", padding: "12px", background: "#F7F5F0", border: "1px solid #E8E6E1", borderRadius: 8, outline: "none", resize: "vertical" }}
      />
      {result && <div style={{ fontSize: 12, color: "#0A6E3B", marginTop: 8 }}>{result}</div>}
      <button
        onClick={handleImport}
        disabled={pending || !csv.trim()}
        style={{ marginTop: 12, padding: "10px 24px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: pending ? "not-allowed" : "pointer", opacity: pending || !csv.trim() ? 0.5 : 1 }}
      >
        {pending ? "Importing..." : "Import"}
      </button>
    </div>
  );
}
