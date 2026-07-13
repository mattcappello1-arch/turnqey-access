"use client";

import { useState } from "react";

type CalendarStay = {
  id: string;
  guest_name: string;
  room: string | null;
  check_in: string;
  check_out: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "#E8E6E1",
  checked_in: "#0A6E3B",
  checked_out: "#8A8A8E",
  cancelled: "#8A3324",
  no_show: "#8A3324",
};

export function GuestCalendar({ stays }: { stays: CalendarStay[] }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }

  const endDate = new Date(days[days.length - 1]);
  endDate.setHours(23, 59, 59);

  // Filter stays that overlap with this 2-week window
  const visible = stays.filter(s => {
    const ci = new Date(s.check_in);
    const co = new Date(s.check_out);
    return ci <= endDate && co >= startOfWeek;
  });

  // Get unique rooms
  const rooms = [...new Set(visible.map(s => s.room || "Unassigned"))].sort();

  const weekLabel = `${startOfWeek.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} — ${days[13].toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div style={{ background: "var(--surface, #FFFFFF)", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--hairline, #E8E6E1)" }}>
        <button onClick={() => setWeekOffset(w => w - 1)} style={{ padding: "6px 12px", background: "none", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--graphite, #3A3A3D)" }}>Previous</button>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink, #0A0A0B)" }}>{weekLabel}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setWeekOffset(0)} style={{ padding: "6px 12px", background: "none", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--slate, #8A8A8E)" }}>Today</button>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ padding: "6px 12px", background: "none", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--graphite, #3A3A3D)" }}>Next</button>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `80px repeat(14, 1fr)`, minWidth: 900 }}>
          {/* Day headers */}
          <div style={{ padding: "8px", borderBottom: "1px solid var(--hairline, #E8E6E1)", borderRight: "1px solid var(--hairline, #E8E6E1)" }} />
          {days.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i} style={{
                padding: "8px 4px", textAlign: "center", borderBottom: "1px solid var(--hairline, #E8E6E1)",
                borderRight: i < 13 ? "1px solid var(--hairline, #E8E6E1)" : "none",
                background: isToday ? "rgba(10,110,59,0.04)" : "transparent",
              }}>
                <div style={{ fontSize: 9, color: "var(--slate, #8A8A8E)", textTransform: "uppercase" }}>{d.toLocaleDateString("en-AU", { weekday: "short" })}</div>
                <div style={{ fontSize: 14, fontWeight: isToday ? 600 : 400, color: isToday ? "#0A6E3B" : "var(--ink, #0A0A0B)" }}>{d.getDate()}</div>
              </div>
            );
          })}

          {/* Room rows */}
          {rooms.map(room => (
            <>
              <div key={`label-${room}`} style={{ padding: "10px 8px", fontSize: 11, fontWeight: 500, color: "var(--graphite, #3A3A3D)", borderRight: "1px solid var(--hairline, #E8E6E1)", borderBottom: "1px solid var(--hairline, #E8E6E1)", display: "flex", alignItems: "center" }}>
                {room}
              </div>
              {days.map((d, dayIdx) => {
                const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59);

                const staysOnDay = visible.filter(s => {
                  const sr = s.room || "Unassigned";
                  if (sr !== room) return false;
                  const ci = new Date(s.check_in);
                  const co = new Date(s.check_out);
                  return ci <= dayEnd && co >= dayStart;
                });

                return (
                  <div key={`${room}-${dayIdx}`} style={{
                    padding: "4px 2px", borderRight: dayIdx < 13 ? "1px solid var(--hairline, #E8E6E1)" : "none",
                    borderBottom: "1px solid var(--hairline, #E8E6E1)", minHeight: 36,
                    background: d.toDateString() === today.toDateString() ? "rgba(10,110,59,0.02)" : "transparent",
                  }}>
                    {staysOnDay.map(s => (
                      <div key={s.id} title={`${s.guest_name} (${s.status})`} style={{
                        padding: "2px 6px", fontSize: 10, fontWeight: 500, borderRadius: 4, marginBottom: 2,
                        background: `${STATUS_COLORS[s.status] || "#E8E6E1"}20`,
                        color: STATUS_COLORS[s.status] || "#3A3A3D",
                        borderLeft: `3px solid ${STATUS_COLORS[s.status] || "#E8E6E1"}`,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {s.guest_name.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}

          {rooms.length === 0 && (
            <>
              <div style={{ gridColumn: "1 / -1", padding: 32, textAlign: "center", color: "var(--slate, #8A8A8E)", fontSize: 13 }}>
                No stays in this period.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
