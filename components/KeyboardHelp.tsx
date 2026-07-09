"use client";

import { useState, useEffect } from "react";

const SHORTCUTS = [
  { keys: "⌘ K", desc: "Open command palette" },
  { keys: "?", desc: "Show keyboard shortcuts" },
  { keys: "G O", desc: "Go to Overview" },
  { keys: "G L", desc: "Go to Locks" },
  { keys: "G G", desc: "Go to Guests" },
  { keys: "G Z", desc: "Go to Zones" },
  { keys: "G V", desc: "Go to Visitors" },
  { keys: "G T", desc: "Go to Team" },
  { keys: "G R", desc: "Go to Reports" },
  { keys: "G S", desc: "Go to Settings" },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let gPressed = false;
    let gTimeout: ReturnType<typeof setTimeout>;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(o => !o);
      }

      if (e.key === "Escape") setOpen(false);

      // G + key navigation
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        gPressed = true;
        clearTimeout(gTimeout);
        gTimeout = setTimeout(() => { gPressed = false; }, 500);
        return;
      }

      if (gPressed) {
        gPressed = false;
        const routes: Record<string, string> = {
          o: "/dashboard",
          l: "/dashboard/locks",
          g: "/dashboard/guests",
          z: "/dashboard/zones",
          v: "/dashboard/visitors",
          t: "/dashboard/team",
          r: "/dashboard/reports",
          s: "/dashboard/settings",
        };
        if (routes[e.key]) {
          e.preventDefault();
          window.location.href = routes[e.key];
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); clearTimeout(gTimeout); };
  }, []);

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div className="cmd-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8E6E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0B" }}>Keyboard shortcuts</span>
          <button onClick={() => setOpen(false)} style={{ fontSize: 12, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}>Close</button>
        </div>
        <div style={{ padding: "8px 0" }}>
          {SHORTCUTS.map(s => (
            <div key={s.keys} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px" }}>
              <span style={{ fontSize: 13, color: "#3A3A3D" }}>{s.desc}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {s.keys.split(" ").map(k => (
                  <kbd key={k} style={{ padding: "2px 8px", background: "#F7F5F0", border: "1px solid #E8E6E1", borderRadius: 4, fontSize: 11, fontFamily: "'Courier New', monospace", color: "#3A3A3D" }}>{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #E8E6E1", fontSize: 11, color: "#8A8A8E" }}>
          Press <kbd style={{ padding: "1px 4px", background: "#F7F5F0", borderRadius: 3, fontSize: 10 }}>G</kbd> then a letter to navigate. Press <kbd style={{ padding: "1px 4px", background: "#F7F5F0", borderRadius: 3, fontSize: 10 }}>?</kbd> to toggle this help.
        </div>
      </div>
    </div>
  );
}
