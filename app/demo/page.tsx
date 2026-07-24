"use client";

import { useState } from "react";
import Link from "next/link";

// Demo data
const DEMO_ORG = { name: "Grand Hotel Melbourne", site: "Collins Street" };
const DEMO_LOCKS = [
  { id: "1", name: "Front Door", unit_label: "Lobby", is_locked: true, is_online: true, battery_level: 0.92, supports_nfc: true },
  { id: "2", name: "Room 101", unit_label: "101", is_locked: true, is_online: true, battery_level: 0.87, supports_nfc: true },
  { id: "3", name: "Room 102", unit_label: "102", is_locked: false, is_online: true, battery_level: 0.45, supports_nfc: true },
  { id: "4", name: "Room 103", unit_label: "103", is_locked: true, is_online: true, battery_level: 0.78, supports_nfc: false },
  { id: "5", name: "Room 201", unit_label: "201", is_locked: true, is_online: true, battery_level: 0.95, supports_nfc: true },
  { id: "6", name: "Room 202", unit_label: "202", is_locked: true, is_online: false, battery_level: 0.15, supports_nfc: true },
  { id: "7", name: "Pool Gate", unit_label: "Pool", is_locked: true, is_online: true, battery_level: 0.68, supports_nfc: false },
  { id: "8", name: "Gym Door", unit_label: "Gym", is_locked: false, is_online: true, battery_level: 0.81, supports_nfc: true },
  { id: "9", name: "Parking", unit_label: "P1", is_locked: true, is_online: true, battery_level: 0.73, supports_nfc: false },
];
const DEMO_GUESTS = [
  { id: "g1", name: "Sarah Chen", email: "sarah@example.com", room: "101", check_in: "2026-07-24T14:00", check_out: "2026-07-27T10:00", status: "checked_in", pin: "847291" },
  { id: "g2", name: "James Park", email: "james@example.com", room: "102", check_in: "2026-07-24T15:00", check_out: "2026-07-26T11:00", status: "checked_in", pin: "503718" },
  { id: "g3", name: "Emma Wilson", email: "emma@example.com", room: "201", check_in: "2026-07-25T14:00", check_out: "2026-07-28T10:00", status: "upcoming", pin: null },
  { id: "g4", name: "Tom Richards", email: "tom@example.com", room: "103", check_in: "2026-07-22T14:00", check_out: "2026-07-24T10:00", status: "checked_out", pin: null },
];
const DEMO_EVENTS = [
  { type: "unlock", lock: "Room 101", actor: "Sarah Chen (PIN)", time: "2:14 pm" },
  { type: "lock", lock: "Room 101", actor: "Auto-lock", time: "2:14 pm" },
  { type: "unlock", lock: "Pool Gate", actor: "Sarah Chen (PIN)", time: "1:45 pm" },
  { type: "unlock", lock: "Gym Door", actor: "James Park (NFC)", time: "12:30 pm" },
  { type: "lock", lock: "Gym Door", actor: "Auto-lock", time: "12:30 pm" },
  { type: "unlock", lock: "Room 102", actor: "James Park (PIN)", time: "11:02 am" },
];

type Tab = "overview" | "locks" | "guests" | "portal";

export default function DemoPage() {
  const [tab, setTab] = useState<Tab>("overview");

  const locked = DEMO_LOCKS.filter(l => l.is_locked).length;
  const online = DEMO_LOCKS.filter(l => l.is_online).length;
  const lowBat = DEMO_LOCKS.filter(l => l.battery_level < 0.2).length;
  const inHouse = DEMO_GUESTS.filter(g => g.status === "checked_in").length;
  const upcoming = DEMO_GUESTS.filter(g => g.status === "upcoming").length;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0" }}>
      {/* Demo banner */}
      <div style={{ background: "#0A0A0B", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.15em", color: "#F7F5F0", textTransform: "uppercase" }}>Turnqey Access</span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(247,245,240,0.15)", color: "#F7F5F0", borderRadius: 4, fontWeight: 600 }}>DEMO</span>
        </div>
        <Link href="/login" style={{ fontSize: 12, color: "#F7F5F0", textDecoration: "none", padding: "6px 16px", border: "1px solid rgba(247,245,240,0.3)", borderRadius: 8 }}>Sign in</Link>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#8A8A8E", marginBottom: 4 }}>{DEMO_ORG.name} · {DEMO_ORG.site}</div>
          <h1 style={{ fontSize: 28, fontWeight: 300, color: "#0A0A0B", letterSpacing: -0.5 }}>Good afternoon</h1>
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #E8E6E1", paddingBottom: 0 }}>
          {([
            { key: "overview", label: "Overview" },
            { key: "locks", label: "Locks" },
            { key: "guests", label: "Guests" },
            { key: "portal", label: "Guest Portal" },
          ] as { key: Tab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "10px 20px", fontSize: 13, fontWeight: tab === t.key ? 500 : 400,
              color: tab === t.key ? "#0A0A0B" : "#8A8A8E", background: "none", border: "none",
              borderBottom: tab === t.key ? "2px solid #0A0A0B" : "2px solid transparent",
              cursor: "pointer", marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
              {[
                { val: DEMO_LOCKS.length, label: "Locks", sub: `${online} online` },
                { val: locked, label: "Locked" },
                { val: lowBat, label: "Low battery", warn: lowBat > 0 },
                { val: inHouse, label: "In-house" },
                { val: upcoming, label: "Upcoming" },
              ].map(s => (
                <div key={s.label} style={{ padding: "16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 300, color: s.warn ? "#8A3324" : "#0A0A0B" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>{s.label}</div>
                  {s.sub && <div style={{ fontSize: 10, color: "#8A8A8E" }}>{s.sub}</div>}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B", marginBottom: 10 }}>Recent activity</h2>
                <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
                  {DEMO_EVENTS.map((ev, i) => (
                    <div key={i} style={{ padding: "10px 14px", borderTop: i > 0 ? "1px solid #E8E6E1" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ev.type === "unlock" ? "#0A6E3B" : "#8A3324" }} />
                        <div>
                          <span style={{ fontSize: 12, color: "#0A0A0B" }}>{ev.type}</span>
                          <span style={{ fontSize: 11, color: "#8A8A8E" }}> on {ev.lock}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: "#8A8A8E", fontFamily: "'Courier New', monospace" }}>{ev.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B", marginBottom: 10 }}>Alerts</h2>
                <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8A3324" }} />
                      <span style={{ fontSize: 12, color: "#0A0A0B" }}>Room 202: 15% battery</span>
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", borderTop: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8A8A8E" }} />
                      <span style={{ fontSize: 12, color: "#0A0A0B" }}>Room 202: Offline</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locks */}
        {tab === "locks" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {DEMO_LOCKS.map(lock => {
              const batPct = Math.round(lock.battery_level * 100);
              return (
                <div key={lock.id} style={{
                  padding: "14px 12px", background: "#FFFFFF", border: `1px solid ${!lock.is_online ? "#8A332430" : "#E8E6E1"}`,
                  borderRadius: 12, opacity: !lock.is_online ? 0.6 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B" }}>{lock.unit_label}</span>
                    {lock.supports_nfc && <span style={{ fontSize: 8, padding: "1px 4px", background: "rgba(10,110,59,0.08)", color: "#0A6E3B", borderRadius: 3, fontWeight: 600 }}>NFC</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#8A8A8E", marginBottom: 8 }}>{lock.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: !lock.is_online ? "#8A8A8E" : lock.is_locked ? "#8A3324" : "#0A6E3B" }} />
                    <span style={{ fontSize: 10, fontWeight: 500, color: !lock.is_online ? "#8A8A8E" : lock.is_locked ? "#8A3324" : "#0A6E3B" }}>
                      {!lock.is_online ? "Offline" : lock.is_locked ? "Locked" : "Unlocked"}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: batPct < 20 ? "#8A3324" : "#8A8A8E", fontWeight: batPct < 20 ? 600 : 400 }}>{batPct}% battery</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Guests */}
        {tab === "guests" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12, overflow: "hidden" }}>
            {DEMO_GUESTS.map((g, i) => (
              <div key={g.id} style={{ padding: "14px 18px", borderTop: i > 0 ? "1px solid #E8E6E1" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{g.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, textTransform: "uppercase",
                      background: g.status === "checked_in" ? "rgba(10,110,59,0.08)" : g.status === "upcoming" ? "#E8E6E1" : "rgba(138,50,36,0.08)",
                      color: g.status === "checked_in" ? "#0A6E3B" : g.status === "upcoming" ? "#3A3A3D" : "#8A8A8E",
                    }}>{g.status.replace("_", " ")}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#8A8A8E", marginTop: 2 }}>
                    Room {g.room} · {new Date(g.check_in).toLocaleDateString("en-AU", { day: "numeric", month: "short" })} to {new Date(g.check_out).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </div>
                  {g.pin && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, padding: "2px 8px", background: "rgba(10,110,59,0.06)", borderRadius: 4 }}>
                      <span style={{ fontSize: 9, color: "#0A6E3B", fontWeight: 600 }}>PIN</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#0A0A0B", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>{g.pin}</span>
                    </div>
                  )}
                </div>
                {g.status === "upcoming" && (
                  <button style={{ padding: "6px 14px", background: "#0A6E3B", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Check in</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Guest Portal Preview */}
        {tab === "portal" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 380, background: "#FFFFFF", borderRadius: 24, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.06)", border: "1px solid #E8E6E1" }}>
              <div style={{ padding: "28px 28px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0A6E3B", animation: "demoPulse 2s ease infinite" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#0A6E3B" }}>Access active</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 300, color: "#0A0A0B", marginBottom: 2 }}>Welcome, Sarah</div>
                <div style={{ fontSize: 15, color: "#3A3A3D" }}>Room 101</div>
              </div>
              <div style={{ display: "flex", padding: "16px 28px", margin: "16px 0 0", borderTop: "1px solid #E8E6E1", background: "#FAFAF8" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#8A8A8E", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>In</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>Thu 24 Jul</div>
                </div>
                <div style={{ width: 1, background: "#E8E6E1", margin: "0 20px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#8A8A8E", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Out</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>Sun 27 Jul</div>
                </div>
              </div>
              <div style={{ padding: "28px", textAlign: "center" }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(10,10,11,0.04)", border: "2px solid rgba(10,10,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "#0A0A0B", textTransform: "uppercase" }}>Tap to unlock</div>
              </div>
              <div style={{ padding: "20px 28px", borderTop: "1px solid #E8E6E1", background: "#FAFAF8", textAlign: "center" }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#8A8A8E", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Keypad code</div>
                <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: 8, color: "#0A0A0B", fontFamily: "'Courier New', monospace" }}>847291</div>
              </div>
              <div style={{ padding: "14px 28px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Room 101", "Pool", "Gym"].map(z => (
                  <span key={z} style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", background: "#F7F5F0", borderRadius: 6, border: "1px solid #E8E6E1", color: "#3A3A3D" }}>{z}</span>
                ))}
              </div>
              <div style={{ padding: "12px 28px", textAlign: "center", fontSize: 9, color: "#8A8A8E", letterSpacing: 1.5, textTransform: "uppercase" }}>Powered by Turnqey</div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 48, textAlign: "center", padding: "40px", background: "#0A0A0B", borderRadius: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 300, color: "#F7F5F0", marginBottom: 8 }}>Ready to manage access at scale?</h2>
          <p style={{ fontSize: 13, color: "#8A8A8E", marginBottom: 20 }}>Set up your first property in minutes.</p>
          <Link href="/login" style={{ display: "inline-block", padding: "12px 32px", background: "#F7F5F0", color: "#0A0A0B", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Get started</Link>
        </div>
      </div>

      <style>{`@keyframes demoPulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>
    </div>
  );
}
