import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GuestStay, Lock } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const { org, member } = await requireAuth();
  const admin = createAdminClient();

  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const propertyIds = (sites ?? []).map((s: { property_id: string }) => s.property_id);
  const siteIds = (sites ?? []).map((s: { id: string }) => s.id);

  const [{ data: locks }, { data: stays }, { data: zones }, { data: events }] = await Promise.all([
    propertyIds.length > 0
      ? admin.from("locks").select("id,name,unit_label,is_locked,is_online,battery_level,property_id").in("property_id", propertyIds)
      : Promise.resolve({ data: [] }),
    siteIds.length > 0
      ? admin.rpc("get_enterprise_guest_stays", { p_site_ids: siteIds, p_statuses: ["upcoming", "checked_in"] })
      : Promise.resolve({ data: [] }),
    siteIds.length > 0
      ? admin.rpc("get_enterprise_zones", { p_site_ids: siteIds })
      : Promise.resolve({ data: [] }),
    propertyIds.length > 0
      ? admin.from("access_events").select("id,event_type,actor,occurred_at,lock_id").in("property_id", propertyIds).order("occurred_at", { ascending: false }).limit(8)
      : Promise.resolve({ data: [] }),
  ]);

  const lockList = (locks ?? []) as Lock[];
  const stayList = (stays ?? []) as GuestStay[];
  const zoneList = (zones ?? []) as { id: string; name: string; zone_type: string; unit_number: string | null }[];
  const eventList = (events ?? []) as { id: string; event_type: string; actor: string | null; occurred_at: string; lock_id: string | null }[];
  const lockNameMap = new Map(lockList.map(l => [l.id, l.unit_label || l.name]));

  const totalLocks = lockList.length;
  const onlineLocks = lockList.filter(l => l.is_online !== false).length;
  const lockedCount = lockList.filter(l => l.is_locked === true).length;
  const lowBattery = lockList.filter(l => l.battery_level !== null && l.battery_level < 0.2);
  const todayCheckins = stayList.filter(s => s.status === "upcoming" && new Date(s.check_in).toDateString() === new Date().toDateString());
  const currentGuests = stayList.filter(s => s.status === "checked_in");
  const roomCount = zoneList.filter(z => z.zone_type === "room").length;

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const isEmpty = totalLocks === 0 && stayList.length === 0 && zoneList.length === 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isEmpty ? 16 : 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>{greeting}</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>{org.name} · {(sites ?? []).length} site{(sites ?? []).length !== 1 ? "s" : ""} · {roomCount} rooms · {totalLocks} locks</p>
      </div>

      {/* Onboarding checklist for empty orgs */}
      {isEmpty && (
        <div style={{ padding: 28, background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 16, marginBottom: 28 }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: "#0A0A0B", marginBottom: 4 }}>Get started</div>
          <div style={{ fontSize: 13, color: "#8A8A8E", marginBottom: 20 }}>Set up your property in a few steps.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { done: (sites ?? []).length > 0, label: "Add a site", desc: "Link a property from your Turnqey account.", href: "/dashboard/settings" },
              { done: zoneList.length > 0, label: "Create zones", desc: "Set up rooms, common areas, and floors.", href: "/dashboard/zones" },
              { done: totalLocks > 0, label: "Connect locks", desc: "Add locks via turnqey.com.au, then assign them to zones.", href: "/dashboard/locks" },
              { done: stayList.length > 0, label: "Add your first guest", desc: "Create a guest stay and generate access.", href: "/dashboard/guests" },
            ].map(step => (
              <Link key={step.label} href={step.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: step.done ? "rgba(10,110,59,0.04)" : "#F7F5F0", border: `1px solid ${step.done ? "rgba(10,110,59,0.15)" : "#E8E6E1"}`, borderRadius: 12, textDecoration: "none" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${step.done ? "#0A6E3B" : "#E8E6E1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: step.done ? "#0A6E3B" : "transparent" }}>
                  {step.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: step.done ? "#0A6E3B" : "#0A0A0B" }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: "#8A8A8E" }}>{step.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 28 }}>
        {[
          { label: "New guest stay", href: "/dashboard/guests", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg> },
          { label: "Issue visitor pass", href: "/dashboard/visitors", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h6" /></svg> },
          { label: "View all locks", href: "/dashboard/locks", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg> },
          { label: "Manage zones", href: "/dashboard/zones", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
        ].map(a => (
          <Link key={a.label} href={a.href} className="card-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12, textDecoration: "none", color: "#3A3A3D", fontSize: 13, fontWeight: 500 }}>
            <span style={{ color: "#8A8A8E" }}>{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 32 }}>
        {[
          { val: totalLocks, label: "Locks", sub: `${onlineLocks} online`, href: "/dashboard/locks" },
          { val: lockedCount, label: "Locked", sub: `${totalLocks - lockedCount} unlocked` },
          { val: lowBattery.length, label: "Low battery", warn: lowBattery.length > 0 },
          { val: todayCheckins.length, label: "Check-ins today", href: "/dashboard/guests" },
          { val: currentGuests.length, label: "In-house", href: "/dashboard/guests" },
        ].map(s => {
          const inner = (
            <div className="stat-card" style={{ padding: "18px 16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: -1, color: s.warn ? "#8A3324" : "#0A0A0B" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: 10, color: "#8A8A8E", marginTop: 1 }}>{s.sub}</div>}
            </div>
          );
          return s.href ? <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>{inner}</Link> : <div key={s.label}>{inner}</div>;
        })}
      </div>

      {/* Two-column layout: check-ins + alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="grid-cols-1 md:grid-cols-2">

        {/* Today's check-ins */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>Today&apos;s check-ins</h2>
            <Link href="/dashboard/guests" style={{ fontSize: 12, color: "#8A8A8E", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            {todayCheckins.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#8A8A8E", marginBottom: 8 }}>No check-ins today.</div>
                <Link href="/dashboard/guests" style={{ fontSize: 12, color: "#0A6E3B", textDecoration: "none", fontWeight: 500 }}>Add a guest stay</Link>
              </div>
            ) : (
              todayCheckins.map(stay => (
                <div key={stay.id} style={{ padding: "12px 16px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0B" }}>{stay.guest_name}</div>
                    <div style={{ fontSize: 11, color: "#8A8A8E" }}>{stay.guest_email || ""}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#8A8A8E", fontFamily: "'Courier New', monospace" }}>
                    {new Date(stay.check_in).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>Alerts</h2>
            <Link href="/dashboard/locks" style={{ fontSize: 12, color: "#8A8A8E", textDecoration: "none" }}>View locks</Link>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            {lowBattery.length === 0 && lockList.filter(l => l.is_online === false).length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(10,110,59,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A6E3B" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div style={{ fontSize: 13, color: "#0A6E3B", fontWeight: 500 }}>All clear</div>
                <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>No issues to report.</div>
              </div>
            ) : (
              <>
                {lowBattery.map(lock => (
                  <div key={lock.id} style={{ padding: "12px 16px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8A3324" }} />
                      <span style={{ fontSize: 13, color: "#0A0A0B" }}>{lock.unit_label || lock.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8A3324" }}>{Math.round((lock.battery_level ?? 0) * 100)}%</span>
                  </div>
                ))}
                {lockList.filter(l => l.is_online === false).map(lock => (
                  <div key={lock.id} style={{ padding: "12px 16px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8A8A8E" }} />
                      <span style={{ fontSize: 13, color: "#0A0A0B" }}>{lock.unit_label || lock.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#8A8A8E" }}>Offline</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current guests */}
      {currentGuests.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>Currently in-house ({currentGuests.length})</h2>
            <Link href="/dashboard/guests" style={{ fontSize: 12, color: "#8A8A8E", textDecoration: "none" }}>View all</Link>
          </div>
          <div className="grid-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {currentGuests.slice(0, 8).map(stay => {
              const roomZone = stay.room_zone_id ? zoneList.find(z => z.id === stay.room_zone_id) : null;
              return (
                <div key={stay.id} className="card-hover" style={{ padding: "14px 16px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0B", marginBottom: 2 }}>{stay.guest_name}</div>
                  {roomZone && <div style={{ fontSize: 11, color: "#8A8A8E" }}>Room {roomZone.unit_number || roomZone.name}</div>}
                  <div style={{ fontSize: 10, color: "#8A8A8E", marginTop: 4 }}>
                    Checkout: {new Date(stay.check_out).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Recent activity */}
      {eventList.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>Recent activity</h2>
            <Link href="/dashboard/reports" style={{ fontSize: 12, color: "#8A8A8E", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
            {eventList.map(ev => {
              const lockName = ev.lock_id ? (lockNameMap.get(ev.lock_id) as string | undefined) || "" : "";
              const time = new Date(ev.occurred_at);
              const isUnlock = ev.event_type === "unlock";
              return (
                <div key={ev.id} className="list-row" style={{ padding: "10px 16px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isUnlock ? "#0A6E3B" : "#8A3324", flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 13, color: "#0A0A0B" }}>{ev.event_type}</span>
                      {lockName && <span style={{ fontSize: 12, color: "#8A8A8E" }}> on {lockName}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#8A8A8E" }}>
                    {ev.actor && <span>{ev.actor}</span>}
                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10 }}>
                      {time.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
