"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function GuestSearch() {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value) params.set("q", value);
      else params.delete("q");
      router.push(`/dashboard/guests?${params.toString()}`);
    }, 400);
  }

  return (
    <div style={{ position: "relative", maxWidth: 280 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A8E" strokeWidth="2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        placeholder="Search guests..."
        style={{ width: "100%", fontSize: 12, padding: "8px 12px 8px 30px", border: "1px solid #E8E6E1", borderRadius: 8, background: "#FFFFFF", color: "#0A0A0B", outline: "none" }}
      />
    </div>
  );
}
