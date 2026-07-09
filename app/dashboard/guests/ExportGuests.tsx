"use client";

import { useState } from "react";

type GuestExport = {
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  status: string;
  check_in: string;
  check_out: string;
  room: string | null;
  notes: string | null;
};

export function ExportGuestsButton({ guests }: { guests: GuestExport[] }) {
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    const headers = ["Guest Name", "Email", "Phone", "Status", "Check-in", "Check-out", "Room", "Notes"];
    const rows = guests.map(g => [
      g.guest_name,
      g.guest_email || "",
      g.guest_phone || "",
      g.status,
      new Date(g.check_in).toLocaleDateString("en-AU"),
      new Date(g.check_out).toLocaleDateString("en-AU"),
      g.room || "",
      g.notes || "",
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting || guests.length === 0}
      style={{ fontSize: 12, color: "#3A3A3D", background: "none", border: "1px solid #E8E6E1", borderRadius: 8, padding: "6px 14px", cursor: "pointer", opacity: guests.length === 0 ? 0.4 : 1 }}
    >
      {exporting ? "Exporting..." : "Export CSV"}
    </button>
  );
}
