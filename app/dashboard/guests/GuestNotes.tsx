"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

type Note = { id: string; author_name: string; note: string; created_at: string };

export function GuestNotes({ stayId, userName }: { stayId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    const supabase = createClient();
    supabase.rpc("get_guest_notes", { p_stay_id: stayId }).then(({ data }) => {
      setNotes((data ?? []) as Note[]);
      setLoaded(true);
    });
  }, [open, loaded, stayId]);

  function handleAdd() {
    if (!newNote.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.rpc("add_guest_note", {
        p_stay_id: stayId,
        p_author_id: "00000000-0000-0000-0000-000000000000", // placeholder, server will use actual user
        p_author_name: userName,
        p_note: newNote.trim(),
      });
      setNotes(prev => [{ id: Date.now().toString(), author_name: userName, note: newNote.trim(), created_at: new Date().toISOString() }, ...prev]);
      setNewNote("");
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ fontSize: 10, color: "var(--slate, #8A8A8E)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
        Notes{notes.length > 0 ? ` (${notes.length})` : ""}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 8, padding: 12, background: "var(--bg, #F7F5F0)", borderRadius: 10, border: "1px solid var(--hairline, #E8E6E1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink, #0A0A0B)" }}>Communication log</span>
        <button onClick={() => setOpen(false)} style={{ fontSize: 10, color: "var(--slate, #8A8A8E)", background: "none", border: "none", cursor: "pointer" }}>Close</button>
      </div>

      {/* Add note */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input
          type="text"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add a note..."
          style={{ flex: 1, fontSize: 12, padding: "6px 10px", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 6, background: "var(--surface, #FFFFFF)", color: "var(--ink, #0A0A0B)", outline: "none" }}
        />
        <button onClick={handleAdd} disabled={pending || !newNote.trim()} style={{ fontSize: 11, padding: "6px 12px", background: "var(--ink, #0A0A0B)", color: "var(--bg, #F7F5F0)", border: "none", borderRadius: 6, cursor: "pointer", opacity: pending || !newNote.trim() ? 0.4 : 1 }}>Add</button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div style={{ fontSize: 11, color: "var(--slate, #8A8A8E)", textAlign: "center", padding: 8 }}>No notes yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 150, overflow: "auto" }}>
          {notes.map(n => (
            <div key={n.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: "1px solid var(--hairline, #E8E6E1)" }}>
              <div style={{ color: "var(--ink, #0A0A0B)" }}>{n.note}</div>
              <div style={{ fontSize: 10, color: "var(--slate, #8A8A8E)", marginTop: 2 }}>
                {n.author_name} · {new Date(n.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
