"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { EnterpriseMemberRole } from "@/lib/types";
import { hasPermission, type Permission } from "@/lib/permissions";
import { NotificationBell } from "./NotificationBell";

type NavItem = { href: string; label: string; desc: string; icon: React.ReactNode; permission?: Permission };

const S = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", desc: "At a glance", icon: (
    <svg {...S}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  )},
  { href: "/dashboard/locks", label: "Locks", desc: "Hardware status", permission: "locks:view", icon: (
    <svg {...S}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
  )},
  { href: "/dashboard/guests", label: "Guests", desc: "Stays and access", permission: "guests:view", icon: (
    <svg {...S}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
  )},
  { href: "/dashboard/zones", label: "Zones", desc: "Rooms and areas", permission: "zones:view", icon: (
    <svg {...S}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  )},
  { href: "/dashboard/visitors", label: "Visitors", desc: "Passes and access", permission: "visitors:view", icon: (
    <svg {...S}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
  )},
  { href: "/dashboard/team", label: "Team", desc: "People and roles", permission: "team:view", icon: (
    <svg {...S}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  )},
  { href: "/dashboard/analytics", label: "Analytics", desc: "Trends and insights", permission: "reports:view", icon: (
    <svg {...S}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  )},
  { href: "/dashboard/reports", label: "Reports", desc: "Audit and export", permission: "reports:view", icon: (
    <svg {...S}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
  )},
  { href: "/dashboard/docs", label: "API", desc: "Integrations", permission: "branding:manage", icon: (
    <svg {...S}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
  )},
  { href: "/dashboard/settings", label: "Settings", desc: "Org and branding", permission: "branding:manage", icon: (
    <svg {...S}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
  )},
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  front_desk: "Front Desk",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  security: "Security",
};

export function Sidebar({ orgName, role, userEmail, propertyIds }: { orgName: string; role: EnterpriseMemberRole; userEmail: string; propertyIds: string[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("turnqey-theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("turnqey-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("turnqey-theme", "light");
    }
  }

  const visibleItems = navItems.filter(item => !item.permission || hasPermission(role, item.permission));

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 backdrop-blur-xl border-b" style={{ background: dark ? "rgba(10,10,11,0.92)" : "rgba(247,245,240,0.92)", borderColor: "var(--hairline)" }}>
        <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.15em", color: "var(--ink)", textTransform: "uppercase" }}>Turnqey Access</div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ padding: 8, border: "1px solid var(--hairline)", borderRadius: 8, background: "none", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky md:top-0 z-30 left-0 top-14 md:top-0 md:h-screen w-full md:w-60 shrink-0 border-r ${mobileOpen ? "block" : "hidden md:block"}`}
        style={{ background: "var(--surface)", borderColor: "var(--hairline)" }}
      >
        <div className="h-full flex flex-col p-3 gap-0.5 overflow-y-auto">
          {/* Logo + org */}
          <div className="hidden md:flex items-center justify-between px-3 pt-4 pb-5 mb-1">
            <div>
              <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.18em", color: "var(--ink)", textTransform: "uppercase", marginBottom: 6 }}>Turnqey Access</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>{orgName}</div>
            </div>
            <NotificationBell propertyIds={propertyIds} />
          </div>

          {/* Divider */}
          <div className="hidden md:block" style={{ height: 1, background: "var(--hairline)", margin: "0 12px 8px" }} />

          {/* Search shortcut */}
          <button
            onClick={() => { const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }); window.dispatchEvent(ev); }}
            className="hidden md:flex nav-item items-center gap-3 px-3 py-2 rounded-xl text-sm mb-1"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate)", width: "100%", textAlign: "left" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <span style={{ flex: 1 }}>Search</span>
            <kbd style={{ fontSize: 10, padding: "1px 5px", background: "var(--bg)", border: "1px solid var(--hairline)", borderRadius: 4, color: "var(--slate)" }}>⌘K</kbd>
          </button>

          {/* Nav items */}
          <nav className="flex flex-col gap-1">
            {visibleItems.map(item => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="nav-item relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm group"
                  style={{
                    background: active ? "rgba(128,128,128,0.1)" : "transparent",
                    color: active ? "var(--ink)" : "var(--slate)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: "#0A6E3B" }} />}
                  <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Dark mode toggle */}
          <div className="mt-auto px-3 pb-1">
            <button
              onClick={toggleTheme}
              className="nav-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "8px 12px",
                background: "none",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 12,
                color: "var(--slate)",
              }}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
              <span>{dark ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>

          {/* Bottom: user info + logout */}
          <div className="pt-3 border-t" style={{ borderColor: "var(--hairline)" }}>
            <div style={{ padding: "8px 12px" }}>
              <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{userEmail}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#0A6E3B" }}>
                  {ROLE_LABELS[role] || role}
                </span>
                <button
                  onClick={async () => {
                    const { createClient } = await import("@/lib/supabase/client");
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    window.location.href = "/login";
                  }}
                  style={{ fontSize: 11, color: "var(--slate)", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
