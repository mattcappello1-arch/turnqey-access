"use client";

import { useState } from "react";

export function BulkLockActions({ lockIds }: { lockIds: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState<"lock" | "unlock" | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(lockIds));
  }

  function clearSelection() {
    setSelected(new Set());
    setSelectMode(false);
  }

  async function handleBulk(action: "lock" | "unlock") {
    if (selected.size === 0) return;
    setActing(action);
    setResult(null);
    let success = 0;
    let failed = 0;

    for (const lockId of selected) {
      try {
        const res = await fetch(`/api/locks/${lockId}/${action}`, { method: "POST" });
        if (res.ok) success++;
        else failed++;
      } catch { failed++; }
    }

    setResult(`${success} ${action}ed${failed > 0 ? `, ${failed} failed` : ""}`);
    setActing(null);
    setTimeout(() => setResult(null), 4000);
  }

  if (!selectMode) {
    return (
      <button
        onClick={() => setSelectMode(true)}
        style={{ fontSize: 12, color: "var(--graphite, #3A3A3D)", background: "none", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}
      >
        Select locks
      </button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink, #0A0A0B)" }}>{selected.size} selected</span>
      <button onClick={selectAll} style={{ fontSize: 11, color: "var(--slate, #8A8A8E)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>All</button>
      <button
        onClick={() => handleBulk("lock")}
        disabled={acting !== null || selected.size === 0}
        style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: "rgba(138,50,36,0.08)", color: "#8A3324", border: "none", borderRadius: 6, cursor: "pointer", opacity: acting || selected.size === 0 ? 0.5 : 1 }}
      >
        {acting === "lock" ? "Locking..." : "Lock selected"}
      </button>
      <button
        onClick={() => handleBulk("unlock")}
        disabled={acting !== null || selected.size === 0}
        style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", background: "rgba(10,110,59,0.08)", color: "#0A6E3B", border: "none", borderRadius: 6, cursor: "pointer", opacity: acting || selected.size === 0 ? 0.5 : 1 }}
      >
        {acting === "unlock" ? "Unlocking..." : "Unlock selected"}
      </button>
      <button onClick={clearSelection} style={{ fontSize: 11, color: "var(--slate, #8A8A8E)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
      {result && <span style={{ fontSize: 11, color: "#0A6E3B", fontWeight: 500 }}>{result}</span>}
    </div>
  );
}

// Export toggle function for individual lock cards
export function useBulkSelect() {
  // This is a placeholder - the actual selection state is managed in BulkLockActions
  return { selectMode: false, toggleSelect: (_id: string) => {}, isSelected: (_id: string) => false };
}
