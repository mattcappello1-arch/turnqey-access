"use client";

import { useState } from "react";

export function LockControl({ lockId, isLocked, isOnline }: { lockId: string; isLocked: boolean | null; isOnline: boolean | null }) {
  const [acting, setActing] = useState(false);
  const [state, setState] = useState(isLocked);

  if (isOnline === false) return null;

  async function handleToggle() {
    setActing(true);
    try {
      const action = state ? "unlock" : "lock";
      const res = await fetch(`/api/locks/${lockId}/${action}`, { method: "POST" });
      if (res.ok) {
        setState(!state);
      }
    } catch {
      // silently fail
    } finally {
      setActing(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={acting}
      style={{
        padding: "6px 12px",
        fontSize: 11,
        fontWeight: 600,
        border: "none",
        borderRadius: 8,
        cursor: acting ? "not-allowed" : "pointer",
        opacity: acting ? 0.5 : 1,
        transition: "all 0.2s",
        background: state ? "rgba(10,110,59,0.1)" : "rgba(138,50,36,0.1)",
        color: state ? "#0A6E3B" : "#8A3324",
      }}
    >
      {acting ? "..." : state ? "Unlock" : "Lock"}
    </button>
  );
}
