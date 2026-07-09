"use client";

import { useState } from "react";

type Lock = {
  id: string;
  name: string;
  unit_label?: string | null;
  is_locked: boolean | null;
  is_online: boolean | null;
  battery_level: number | null;
  property_id: string;
  manufacturer: string | null;
  model: string | null;
  last_synced_at: string | null;
  supports_nfc?: boolean;
};

export function LockFilters({ locks, siteMap, children }: {
  locks: Lock[];
  siteMap: Record<string, string>;
  children: (filteredLocks: Lock[]) => React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = locks.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      const haystack = [l.name, l.unit_label, siteMap[l.property_id], l.manufacturer, l.model].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (statusFilter === "online" && l.is_online === false) return false;
    if (statusFilter === "offline" && l.is_online !== false) return false;
    if (statusFilter === "locked" && l.is_locked !== true) return false;
    if (statusFilter === "unlocked" && l.is_locked === true) return false;
    if (statusFilter === "low-battery" && (l.battery_level === null || l.battery_level >= 0.2)) return false;
    return true;
  });

  const selectStyle = { fontSize: 12, padding: "6px 12px", border: "1px solid #E8E6E1", borderRadius: 8, background: "#FFFFFF", color: "#3A3A3D", outline: "none", cursor: "pointer" };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 300 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A8E" strokeWidth="2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search locks..."
            style={{ width: "100%", fontSize: 12, padding: "8px 12px 8px 30px", border: "1px solid #E8E6E1", borderRadius: 8, background: "#FFFFFF", color: "#0A0A0B", outline: "none" }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All locks</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="locked">Locked</option>
          <option value="unlocked">Unlocked</option>
          <option value="low-battery">Low battery</option>
        </select>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); }} style={{ fontSize: 11, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
        )}
        <span style={{ fontSize: 11, color: "#8A8A8E", marginLeft: "auto" }}>
          {filtered.length} of {locks.length} locks
        </span>
      </div>
      {children(filtered)}
    </>
  );
}
