"use client";

import { useState, useTransition } from "react";

type LockOption = { id: string; name: string; unit_label: string | null };

export function LockAssignment({ zoneId, zoneName, assignedLockIds, allLocks, assignAction, unassignAction }: {
  zoneId: string;
  zoneName: string;
  assignedLockIds: string[];
  allLocks: LockOption[];
  assignAction: (zoneId: string, lockId: string) => Promise<void>;
  unassignAction: (zoneId: string, lockId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const assigned = allLocks.filter(l => assignedLockIds.includes(l.id));
  const available = allLocks.filter(l => !assignedLockIds.includes(l.id));

  if (!open) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {assigned.length === 0 ? (
          <span style={{ fontSize: 11, color: "#8A8A8E" }}>No locks</span>
        ) : (
          assigned.map(l => (
            <span key={l.id} style={{ fontSize: 10, padding: "2px 8px", background: "rgba(10,110,59,0.08)", color: "#0A6E3B", borderRadius: 6, fontWeight: 500 }}>
              {l.unit_label || l.name}
            </span>
          ))
        )}
        <button onClick={() => setOpen(true)} style={{ fontSize: 10, color: "#8A8A8E", background: "none", border: "1px solid #E8E6E1", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>
          Edit
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, background: "#F7F5F0", borderRadius: 10, marginTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#0A0A0B" }}>Locks for {zoneName}</span>
        <button onClick={() => setOpen(false)} style={{ fontSize: 10, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}>Done</button>
      </div>

      {/* Assigned */}
      {assigned.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9, color: "#8A8A8E", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Assigned</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {assigned.map(l => (
              <button
                key={l.id}
                onClick={() => startTransition(() => unassignAction(zoneId, l.id))}
                disabled={pending}
                style={{ fontSize: 11, padding: "4px 10px", background: "rgba(10,110,59,0.08)", color: "#0A6E3B", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                {l.unit_label || l.name}
                <span style={{ fontSize: 13, color: "#8A3324" }}>x</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available */}
      {available.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: "#8A8A8E", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Available</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {available.map(l => (
              <button
                key={l.id}
                onClick={() => startTransition(() => assignAction(zoneId, l.id))}
                disabled={pending}
                style={{ fontSize: 11, padding: "4px 10px", background: "#FFFFFF", color: "#3A3A3D", border: "1px solid #E8E6E1", borderRadius: 6, cursor: "pointer" }}
              >
                + {l.unit_label || l.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {available.length === 0 && assigned.length === 0 && (
        <div style={{ fontSize: 11, color: "#8A8A8E" }}>No locks available. Add locks via the Turnqey dashboard first.</div>
      )}
    </div>
  );
}
