"use client";

import { useState, useTransition } from "react";
import { toggleMaintenance } from "./actions";

export function MaintenanceToggle({ lockId, initialEnabled }: { lockId: string; initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState<boolean>(initialEnabled);
  const [isPending, startTransition] = useTransition();

  function handleToggle(): void {
    const next: boolean = !enabled;
    startTransition(async () => {
      const result: { success: boolean } = await toggleMaintenance(lockId, next);
      if (result.success) {
        setEnabled(next);
      }
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {enabled && (
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 6,
          background: "rgba(184,134,11,0.1)",
          color: "#B8860B",
        }}>
          Under maintenance
        </span>
      )}
      <button
        onClick={handleToggle}
        disabled={isPending}
        style={{
          padding: "6px 12px",
          fontSize: 11,
          fontWeight: 600,
          border: "none",
          borderRadius: 8,
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.5 : 1,
          transition: "all 0.2s",
          background: enabled ? "rgba(184,134,11,0.1)" : "rgba(138,138,142,0.1)",
          color: enabled ? "#B8860B" : "#8A8A8E",
        }}
      >
        {isPending ? "..." : enabled ? "Exit maintenance" : "Enter maintenance"}
      </button>
    </div>
  );
}
