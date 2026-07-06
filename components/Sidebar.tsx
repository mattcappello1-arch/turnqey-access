"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { EnterpriseMemberRole } from "@/lib/types";
import { hasPermission, type Permission } from "@/lib/permissions";

type NavItem = { href: string; label: string; icon: React.ReactNode; permission?: Permission };

const S = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: (
    <svg {...S}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  )},
  { href: "/dashboard/locks", label: "Locks", permission: "locks:view", icon: (
    <svg {...S}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
  )},
  { href: "/dashboard/guests", label: "Guests", permission: "guests:view", icon: (
    <svg {...S}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
  )},
  { href: "/dashboard/zones", label: "Zones", permission: "zones:view", icon: (
    <svg {...S}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  )},
  { href: "/dashboard/visitors", label: "Visitors", permission: "visitors:view", icon: (
    <svg {...S}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
  )},
  { href: "/dashboard/team", label: "Team", permission: "team:view", icon: (
    <svg {...S}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  )},
  { href: "/dashboard/reports", label: "Reports", permission: "reports:view", icon: (
    <svg {...S}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
  )},
  { href: "/dashboard/settings", label: "Settings", permission: "branding:manage", icon: (
    <svg {...S}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
  )},
];

export function Sidebar({ orgName, role }: { orgName: string; role: EnterpriseMemberRole }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter(item => !item.permission || hasPermission(role, item.permission));

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 backdrop-blur-xl border-b" style={{ background: "rgba(247,245,240,0.85)", borderColor: "#E8E6E1" }}>
        <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.15em", color: "#0A0A0B", textTransform: "uppercase" }}>Turnqey Access</div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ padding: 8, border: "1px solid #E8E6E1", borderRadius: 8, background: "none", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky md:top-0 z-30 left-0 top-14 md:top-0 md:h-screen w-full md:w-56 shrink-0 border-r ${mobileOpen ? "block" : "hidden md:block"}`}
        style={{ background: "#F7F5F0", borderColor: "#E8E6E1" }}
      >
        <div className="h-full flex flex-col p-4 gap-1">
          {/* Logo */}
          <div className="hidden md:block px-2 py-3 mb-2">
            <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.15em", color: "#0A0A0B", textTransform: "uppercase", marginBottom: 4 }}>Turnqey Access</div>
            <div style={{ fontSize: 11, color: "#8A8A8E", lineHeight: 1.3 }}>{orgName}</div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5">
            {visibleItems.map(item => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all duration-200"
                  style={{
                    background: active ? "rgba(10,10,11,0.05)" : "transparent",
                    color: active ? "#0A0A0B" : "#8A8A8E",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: "#0A6E3B" }} />}
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Role badge */}
          <div className="mt-auto pt-4 border-t" style={{ borderColor: "#E8E6E1" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A8A8E", padding: "0 12px" }}>
              {role}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
