"use client";

import { useState } from "react";

export function GuestUnlockButton({ lockIds, brandColor }: { lockIds: string[]; brandColor: string }) {
  const [state, setState] = useState<"idle" | "unlocking" | "unlocked" | "error">("idle");

  async function handleUnlock() {
    if (lockIds.length === 0) return;
    setState("unlocking");

    let success = false;
    for (const lockId of lockIds) {
      try {
        const res = await fetch(`/api/locks/${lockId}/unlock`, { method: "POST" });
        if (res.ok) success = true;
      } catch { /* continue */ }
    }

    setState(success ? "unlocked" : "error");
    if (success) {
      setTimeout(() => setState("idle"), 5000);
    } else {
      setTimeout(() => setState("idle"), 3000);
    }
  }

  if (lockIds.length === 0) {
    return (
      <div style={{ color: "#8A8A8E", fontSize: 13 }}>No locks assigned to your zones.</div>
    );
  }

  const isUnlocked = state === "unlocked";
  const isUnlocking = state === "unlocking";

  return (
    <div>
      <button
        onClick={handleUnlock}
        disabled={isUnlocking}
        style={{
          width: 120, height: 120, borderRadius: "50%",
          background: isUnlocked ? `${brandColor}15` : `${brandColor}08`,
          border: `2px solid ${isUnlocked ? brandColor : `${brandColor}30`}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px", cursor: isUnlocking ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          transform: isUnlocked ? "scale(1.05)" : "scale(1)",
          animation: isUnlocking ? "unlockSpin 1s linear infinite" : "none",
        }}
      >
        {isUnlocked ? (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
        )}
      </button>

      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: isUnlocked ? "#0A6E3B" : brandColor, textTransform: "uppercase" }}>
        {isUnlocking ? "Unlocking..." : isUnlocked ? "Unlocked" : state === "error" ? "Try again" : "Tap to unlock"}
      </div>
      {!isUnlocked && !isUnlocking && (
        <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 4 }}>Hold your phone near the lock, or tap here</div>
      )}
      {isUnlocked && (
        <div style={{ fontSize: 11, color: "#0A6E3B", marginTop: 4 }}>Door is open. Auto-locks in a few seconds.</div>
      )}

      <style>{`
        @keyframes unlockSpin {
          from { transform: scale(1); }
          50% { transform: scale(1.03); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
