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

export function GuestStatusButton({ stayId, currentStatus }: { stayId: string; currentStatus: string }) {
  const [pending, startTransition] = useTransition();

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
      <button
        onClick={() => startTransition(() => updateGuestStayStatus(stayId, "checked_out"))}
        disabled={pending}
        style={{ padding: "6px 14px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1 }}
      >
        {pending ? "..." : "Check out"}
      </button>
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
