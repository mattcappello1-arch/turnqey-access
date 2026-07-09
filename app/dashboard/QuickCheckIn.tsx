"use client";

import { useTransition } from "react";
import { updateGuestStayStatus } from "../dashboard/guests/actions";

export function QuickCheckIn({ stayId, guestName }: { stayId: string; guestName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => updateGuestStayStatus(stayId, "checked_in"))}
      disabled={pending}
      style={{
        fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 6,
        background: "#0A6E3B", color: "#FFFFFF", border: "none",
        cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {pending ? "..." : "Check in"}
    </button>
  );
}
