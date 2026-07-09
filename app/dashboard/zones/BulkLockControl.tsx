"use client";

import { useState } from "react";

export function BulkLockControl({ zoneId, zoneName, lockIds }: { zoneId: string; zoneName: string; lockIds: string[] }) {
  const [acting, setActing] = useState<"lock" | "unlock" | null>(null);
  const [result, setResult] = useState<string | null>(null);

  if (lockIds.length === 0) return null;

  async function handleBulk(action: "lock" | "unlock") {
    setActing(action);
    setResult(null);
    let success = 0;
    let failed = 0;

    for (const lockId of lockIds) {
      try {
        const res = await fetch(`/api/locks/${lockId}/${action}`, { method: "POST" });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setResult(`${success} ${action}ed${failed > 0 ? `, ${failed} failed` : ""}`);
    setActing(null);
    setTimeout(() => setResult(null), 3000);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={() => handleBulk("lock")}
        disabled={acting !== null}
        style={{
          fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
          background: "rgba(138,50,36,0.08)", color: "#8A3324", border: "none",
          cursor: acting ? "not-allowed" : "pointer", opacity: acting ? 0.5 : 1,
        }}
      >
        {acting === "lock" ? "Locking..." : `Lock all (${lockIds.length})`}
      </button>
      <button
        onClick={() => handleBulk("unlock")}
        disabled={acting !== null}
        style={{
          fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
          background: "rgba(10,110,59,0.08)", color: "#0A6E3B", border: "none",
          cursor: acting ? "not-allowed" : "pointer", opacity: acting ? 0.5 : 1,
        }}
      >
        {acting === "unlock" ? "Unlocking..." : `Unlock all (${lockIds.length})`}
      </button>
      {result && <span style={{ fontSize: 10, color: "#0A6E3B" }}>{result}</span>}
    </div>
  );
}
