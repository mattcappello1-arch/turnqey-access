"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const COMMANDS = [
  { label: "Overview", href: "/dashboard", icon: "🏠", section: "Navigate" },
  { label: "Locks", href: "/dashboard/locks", icon: "🔒", section: "Navigate" },
  { label: "Guests", href: "/dashboard/guests", icon: "👤", section: "Navigate" },
  { label: "Zones", href: "/dashboard/zones", icon: "📋", section: "Navigate" },
  { label: "Visitors", href: "/dashboard/visitors", icon: "🎫", section: "Navigate" },
  { label: "Team", href: "/dashboard/team", icon: "👥", section: "Navigate" },
  { label: "Reports", href: "/dashboard/reports", icon: "📊", section: "Navigate" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙", section: "Navigate" },
  { label: "New guest stay", href: "/dashboard/guests", icon: "➕", section: "Actions" },
  { label: "Issue visitor pass", href: "/dashboard/visitors", icon: "🎫", section: "Actions" },
  { label: "Connect lock", href: "https://turnqey.com.au/dashboard/locks", icon: "🔗", section: "Actions", external: true },
  { label: "Add zone", href: "/dashboard/zones?add=true", icon: "📐", section: "Actions" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const router = useRouter();

  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(o => !o);
      setQuery("");
      setSelectedIdx(0);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleSelect(cmd: typeof COMMANDS[0]) {
    setOpen(false);
    if (cmd.external) {
      window.open(cmd.href, "_blank");
    } else {
      router.push(cmd.href);
    }
  }

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div className="cmd-panel" onClick={e => e.stopPropagation()}>
        <input
          className="cmd-input"
          placeholder="Search or jump to..."
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
          onKeyDown={e => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
            if (e.key === "Enter" && filtered[selectedIdx]) handleSelect(filtered[selectedIdx]);
          }}
          autoFocus
        />
        <div style={{ maxHeight: 300, overflow: "auto", padding: "4px 0" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "16px 20px", textAlign: "center", color: "#8A8A8E", fontSize: 13 }}>No results</div>
          ) : (
            <>
              {["Navigate", "Actions"].map(section => {
                const items = filtered.filter(c => c.section === section);
                if (items.length === 0) return null;
                return (
                  <div key={section}>
                    <div style={{ padding: "8px 20px 4px", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8A8A8E" }}>{section}</div>
                    {items.map(cmd => {
                      const globalIdx = filtered.indexOf(cmd);
                      return (
                        <div
                          key={cmd.label}
                          className={`cmd-item ${globalIdx === selectedIdx ? "active" : ""}`}
                          onClick={() => handleSelect(cmd)}
                        >
                          <span style={{ fontSize: 14 }}>{cmd.icon}</span>
                          <span>{cmd.label}</span>
                          {cmd.external && <span style={{ fontSize: 10, color: "#8A8A8E" }}>↗</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>
        <div style={{ padding: "8px 20px", borderTop: "1px solid #E8E6E1", display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#8A8A8E" }}>
          <span><kbd style={{ padding: "1px 4px", background: "#F7F5F0", borderRadius: 4, fontSize: 10 }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ padding: "1px 4px", background: "#F7F5F0", borderRadius: 4, fontSize: 10 }}>↵</kbd> select</span>
          <span><kbd style={{ padding: "1px 4px", background: "#F7F5F0", borderRadius: 4, fontSize: 10 }}>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
