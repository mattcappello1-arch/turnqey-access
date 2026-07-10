"use client";

import { useState } from "react";

type KioskStay = {
  id: string;
  guest_name: string;
  guest_email: string | null;
  room: string | null;
  check_in: string;
};

export function KioskClient({ orgName, siteName, logoUrl, primaryColor, todayStays, inHouseCount }: {
  orgName: string;
  siteName: string;
  logoUrl: string | null;
  primaryColor: string;
  todayStays: KioskStay[];
  inHouseCount: number;
}) {
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set());

  const filtered = search
    ? todayStays.filter(s => s.guest_name.toLowerCase().includes(search.toLowerCase()))
    : todayStays;

  const time = new Date();
  const greeting = time.getHours() < 12 ? "Good morning" : time.getHours() < 18 ? "Good afternoon" : "Good evening";

  async function handleCheckIn(stayId: string) {
    setCheckingIn(stayId);
    try {
      const res = await fetch("/api/kiosk/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stay_id: stayId }),
      });
      if (res.ok) {
        setCheckedIn(prev => new Set(prev).add(stayId));
      }
    } catch { /* ignore */ }
    setCheckingIn(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF" }}>
        <div>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={orgName} style={{ height: 32 }} />
          ) : (
            <div style={{ fontSize: 14, fontWeight: 400, letterSpacing: "0.15em", color: primaryColor, textTransform: "uppercase" }}>{orgName}</div>
          )}
          <div style={{ fontSize: 12, color: "#8A8A8E", marginTop: 2 }}>{siteName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 300, color: "#0A0A0B", letterSpacing: -1 }}>
            {time.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div style={{ fontSize: 12, color: "#8A8A8E" }}>{time.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "40px 32px", maxWidth: 700, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, color: "#0A0A0B", letterSpacing: -1, marginBottom: 4 }}>{greeting}</h1>
        <p style={{ fontSize: 15, color: "#8A8A8E", marginBottom: 32 }}>
          {todayStays.length} arrival{todayStays.length !== 1 ? "s" : ""} today · {inHouseCount} guest{inHouseCount !== 1 ? "s" : ""} in-house
        </p>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A8E" strokeWidth="2" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by guest name..."
            style={{ width: "100%", fontSize: 16, padding: "16px 20px 16px 44px", border: "1px solid #E8E6E1", borderRadius: 14, background: "#FFFFFF", color: "#0A0A0B", outline: "none" }}
          />
        </div>

        {/* Guest list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, textAlign: "center" }}>
              <div style={{ fontSize: 15, color: "#8A8A8E" }}>{search ? "No matching guests." : "No arrivals today."}</div>
            </div>
          ) : (
            filtered.map(stay => {
              const isDone = checkedIn.has(stay.id);
              return (
                <div key={stay.id} style={{
                  padding: "20px 24px", background: "#FFFFFF", border: `1px solid ${isDone ? "rgba(10,110,59,0.3)" : "#E8E6E1"}`,
                  borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center",
                  opacity: isDone ? 0.7 : 1, transition: "all 0.3s",
                }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#0A0A0B", marginBottom: 2 }}>{stay.guest_name}</div>
                    <div style={{ fontSize: 13, color: "#8A8A8E" }}>
                      {stay.room && <span>Room {stay.room} · </span>}
                      {new Date(stay.check_in).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {isDone ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A6E3B" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0A6E3B" }}>Checked in</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(stay.id)}
                      disabled={checkingIn === stay.id}
                      style={{
                        padding: "14px 32px", background: primaryColor, color: "#FFFFFF", border: "none",
                        borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer",
                        opacity: checkingIn === stay.id ? 0.5 : 1, transition: "opacity 0.2s",
                      }}
                    >
                      {checkingIn === stay.id ? "Checking in..." : "Check in"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 32px", borderTop: "1px solid #E8E6E1", textAlign: "center", fontSize: 10, color: "#8A8A8E", letterSpacing: 1 }}>
        TURNQEY ACCESS · KIOSK MODE
      </div>
    </div>
  );
}
