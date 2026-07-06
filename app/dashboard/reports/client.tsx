"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type AccessEvent = {
  id: string;
  property_id: string;
  lock_id: string | null;
  lock_name: string | null;
  zone_name: string | null;
  event_type: string;
  actor_name: string | null;
  actor_email: string | null;
  actor_type: string | null;
  method: string | null;
  status: string;
  occurred_at: string;
  metadata: Record<string, unknown>;
};

type Props = {
  events: AccessEvent[];
  stats: { totalToday: number; uniqueUsers: number; mostActiveZone: string };
  zones: string[];
  eventTypes: string[];
  siteMap: Record<string, string>;
  filters: { from: string; to: string; zone: string; eventType: string };
};

const EVENT_BADGES: Record<string, { bg: string; color: string }> = {
  lock: { bg: "rgba(10,110,59,0.1)", color: "#0A6E3B" },
  unlock: { bg: "#E8E6E1", color: "#3A3A3D" },
  denied: { bg: "rgba(138,50,36,0.1)", color: "#8A3324" },
  alarm: { bg: "rgba(138,50,36,0.15)", color: "#8A3324" },
};

function exportCsv(events: AccessEvent[], siteMap: Record<string, string>) {
  const headers = ["Time", "Site", "Zone", "Event", "Actor", "Email", "Type", "Method", "Status"];
  const rows = events.map((e) => [
    e.occurred_at,
    siteMap[e.property_id] ?? "",
    e.zone_name ?? "",
    e.event_type,
    e.actor_name ?? "",
    e.actor_email ?? "",
    e.actor_type ?? "",
    e.method ?? "",
    e.status,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `access-events-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsClient({ events, stats, zones, eventTypes, siteMap, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/dashboard/reports?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Reports</h1>
          <p style={{ fontSize: 14, color: "#8A8A8E" }}>Access audit log</p>
        </div>
        <button
          onClick={() => exportCsv(events, siteMap)}
          style={{
            padding: "10px 20px",
            background: "#0A0A0B",
            color: "#F7F5F0",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { val: stats.totalToday, label: "Events today" },
          { val: stats.uniqueUsers, label: "Unique users today" },
          { val: stats.mostActiveZone, label: "Most active zone" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "20px 18px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: -1, color: "#0A0A0B" }}>
              {typeof s.val === "number" ? s.val : s.val}
            </div>
            <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => updateFilter("from", e.target.value)}
          style={filterInput}
          aria-label="From date"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => updateFilter("to", e.target.value)}
          style={filterInput}
          aria-label="To date"
        />
        <select
          value={filters.zone}
          onChange={(e) => updateFilter("zone", e.target.value)}
          style={filterInput}
          aria-label="Zone filter"
        >
          <option value="">All zones</option>
          {zones.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
        <select
          value={filters.eventType}
          onChange={(e) => updateFilter("type", e.target.value)}
          style={filterInput}
          aria-label="Event type filter"
        >
          <option value="">All events</option>
          {eventTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {(filters.from || filters.to || filters.zone || filters.eventType) && (
          <button
            onClick={() => router.push("/dashboard/reports")}
            style={{ ...filterInput, cursor: "pointer", color: "#8A3324", fontWeight: 500, background: "#FFFFFF" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Event log */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 120px 140px 90px", padding: "10px 18px", borderBottom: "1px solid #E8E6E1", fontSize: 11, fontWeight: 600, color: "#8A8A8E", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <span>Time</span>
          <span>Actor</span>
          <span>Zone</span>
          <span>Event</span>
          <span>Status</span>
        </div>

        {events.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#8A8A8E", fontSize: 14 }}>
            No access events found.
          </div>
        ) : (
          events.map((event) => {
            const badge = EVENT_BADGES[event.event_type] ?? { bg: "#E8E6E1", color: "#3A3A3D" };
            return (
              <div
                key={event.id}
                style={{ display: "grid", gridTemplateColumns: "160px 1fr 120px 140px 90px", padding: "12px 18px", borderBottom: "1px solid #E8E6E1", alignItems: "center", fontSize: 13 }}
              >
                <span style={{ color: "#8A8A8E", fontSize: 12 }}>
                  {new Date(event.occurred_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "#0A0A0B", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {event.actor_name ?? "Unknown"}
                  </div>
                  {event.actor_email && (
                    <div style={{ fontSize: 11, color: "#8A8A8E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.actor_email}</div>
                  )}
                </div>
                <span style={{ color: "#3A3A3D", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {event.zone_name ?? "—"}
                </span>
                <span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: badge.bg, color: badge.color, textTransform: "uppercase" }}>
                    {event.event_type}
                  </span>
                  {event.method && (
                    <span style={{ fontSize: 10, color: "#8A8A8E", marginLeft: 6 }}>{event.method}</span>
                  )}
                </span>
                <span style={{ fontSize: 12, color: event.status === "success" ? "#0A6E3B" : "#8A3324" }}>
                  {event.status}
                </span>
              </div>
            );
          })
        )}
      </div>

      {events.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#8A8A8E", textAlign: "right" }}>
          Showing {events.length} event{events.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

const filterInput: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 13,
  color: "#0A0A0B",
  background: "#FFFFFF",
  border: "1px solid #E8E6E1",
  borderRadius: 10,
  outline: "none",
  minWidth: 120,
};
