"use client";

import { useState, useTransition } from "react";
import { updateGuestStayStatus, deleteGuestStay } from "./actions";

export function CopyGuestLink({ stayId }: { stayId: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/guest-portal/${stayId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      style={{ fontSize: 11, color: copied ? "#0A6E3B" : "#8A8A8E", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

export function GuestStatusButton({ stayId, currentStatus, guestName, checkIn, checkOut }: {
  stayId: string; currentStatus: string; guestName?: string; checkIn?: string; checkOut?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [showSummary, setShowSummary] = useState(false);

  if (currentStatus === "upcoming") {
    return (
      <button
        onClick={() => startTransition(() => updateGuestStayStatus(stayId, "checked_in"))}
        disabled={pending}
        style={{ padding: "6px 14px", background: "#0A6E3B", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1 }}
      >
        {pending ? "..." : "Check in"}
      </button>
    );
  }

  if (currentStatus === "checked_in") {
    return (
      <>
        <button
          onClick={() => setShowSummary(true)}
          disabled={pending}
          style={{ padding: "6px 14px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1 }}
        >
          {pending ? "..." : "Check out"}
        </button>

        {showSummary && (
          <>
            <div onClick={() => setShowSummary(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,10,11,0.4)", zIndex: 9998 }} />
            <div style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 360, background: "#FFFFFF", borderRadius: 16, padding: 28,
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)", zIndex: 9999,
            }}>
              <div style={{ fontSize: 18, fontWeight: 300, color: "#0A0A0B", marginBottom: 4 }}>Check out {guestName || "guest"}?</div>
              <div style={{ fontSize: 13, color: "#8A8A8E", marginBottom: 20 }}>
                Access codes will expire and the stay will be marked as complete.
              </div>

              {checkIn && checkOut && (
                <div style={{ padding: "12px 16px", background: "#F7F5F0", borderRadius: 10, marginBottom: 20, fontSize: 12, color: "#3A3A3D" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#8A8A8E" }}>Checked in</span>
                    <span>{new Date(checkIn).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#8A8A8E" }}>Checking out</span>
                    <span>Now</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E8E6E1", paddingTop: 4, marginTop: 4 }}>
                    <span style={{ color: "#8A8A8E" }}>Duration</span>
                    <span style={{ fontWeight: 500 }}>
                      {(() => {
                        const hours = Math.round((Date.now() - new Date(checkIn).getTime()) / 3600000);
                        return hours < 24 ? `${hours} hours` : `${Math.round(hours / 24)} days`;
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { startTransition(() => updateGuestStayStatus(stayId, "checked_out")); setShowSummary(false); }}
                  disabled={pending}
                  style={{ flex: 1, padding: "12px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Confirm check-out
                </button>
                <button
                  onClick={() => setShowSummary(false)}
                  style={{ padding: "12px 20px", background: "none", color: "#8A8A8E", border: "1px solid #E8E6E1", borderRadius: 10, fontSize: 13, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return null;
}

export function DeleteStayButton({ stayId }: { stayId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} style={{ fontSize: 11, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}>
        Remove
      </button>
    );
  }

  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={() => startTransition(() => deleteGuestStay(stayId))}
        disabled={pending}
        style={{ fontSize: 11, color: "#8A3324", background: "none", border: "none", cursor: "pointer" }}
      >
        {pending ? "..." : "Confirm"}
      </button>
      <button onClick={() => setConfirm(false)} style={{ fontSize: 11, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
    </span>
  );
}
