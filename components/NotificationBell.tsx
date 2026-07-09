"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Alert = {
  type: "low_battery" | "offline" | "check_in";
  message: string;
  time: string;
};

export function NotificationBell({ propertyIds }: { propertyIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    async function loadAlerts() {
      if (propertyIds.length === 0) return;
      const supabase = createClient();

      const { data: locks } = await supabase
        .from("locks")
        .select("id,name,unit_label,battery_level,is_online")
        .in("property_id", propertyIds);

      const newAlerts: Alert[] = [];
      for (const lock of locks ?? []) {
        const name = lock.unit_label || lock.name;
        if (lock.battery_level !== null && lock.battery_level < 0.2) {
          newAlerts.push({ type: "low_battery", message: `${name}: ${Math.round(lock.battery_level * 100)}% battery`, time: "Now" });
        }
        if (lock.is_online === false) {
          newAlerts.push({ type: "offline", message: `${name}: offline`, time: "Now" });
        }
      }
      setAlerts(newAlerts);
    }
    loadAlerts();
    const interval = setInterval(loadAlerts, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [propertyIds]);

  const count = alerts.length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ position: "relative", padding: 6, background: "none", border: "none", cursor: "pointer", borderRadius: 8 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={count > 0 ? "#8A3324" : "#8A8A8E"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {count > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            width: 14, height: 14, borderRadius: "50%",
            background: "#8A3324", color: "#FFFFFF",
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300, zIndex: 50,
            background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.08)", overflow: "hidden",
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #E8E6E1", fontSize: 13, fontWeight: 500, color: "#0A0A0B" }}>
              Alerts {count > 0 && <span style={{ fontSize: 11, color: "#8A8A8E", fontWeight: 400 }}>({count})</span>}
            </div>
            {alerts.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#0A6E3B", fontWeight: 500 }}>All clear</div>
                <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>No alerts right now.</div>
              </div>
            ) : (
              <div style={{ maxHeight: 300, overflow: "auto" }}>
                {alerts.map((alert, i) => (
                  <div key={i} style={{ padding: "10px 16px", borderTop: i > 0 ? "1px solid #E8E6E1" : "none", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: alert.type === "low_battery" ? "#8A3324" : alert.type === "offline" ? "#8A8A8E" : "#0A6E3B",
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#0A0A0B" }}>{alert.message}</div>
                    </div>
                    <span style={{ fontSize: 10, color: "#8A8A8E" }}>{alert.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
