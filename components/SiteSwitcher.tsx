"use client";

import { useState } from "react";

type SiteOption = { id: string; name: string; site_type: string };

export function SiteSwitcher({ sites, currentSite, onSwitch }: {
  sites: SiteOption[];
  currentSite: string | null;
  onSwitch: (siteId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  if (sites.length <= 1) return null;

  const current = currentSite ? sites.find(s => s.id === currentSite) : null;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px", background: "none", border: "1px solid #E8E6E1",
          borderRadius: 10, cursor: "pointer", fontSize: 13, color: "#0A0A0B",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
        </svg>
        {current ? current.name : "All sites"}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A8A8E" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, width: 220, zIndex: 50,
            background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden",
          }}>
            <div
              onClick={() => { onSwitch(null); setOpen(false); }}
              style={{
                padding: "10px 16px", cursor: "pointer", fontSize: 13,
                background: !currentSite ? "#F7F5F0" : "transparent",
                color: "#0A0A0B", fontWeight: !currentSite ? 500 : 400,
                borderBottom: "1px solid #E8E6E1",
              }}
            >
              All sites
            </div>
            {sites.map(s => (
              <div
                key={s.id}
                onClick={() => { onSwitch(s.id); setOpen(false); }}
                style={{
                  padding: "10px 16px", cursor: "pointer", fontSize: 13,
                  background: currentSite === s.id ? "#F7F5F0" : "transparent",
                  color: "#0A0A0B", fontWeight: currentSite === s.id ? 500 : 400,
                }}
              >
                {s.name}
                <div style={{ fontSize: 10, color: "#8A8A8E", marginTop: 1 }}>
                  {s.site_type.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
