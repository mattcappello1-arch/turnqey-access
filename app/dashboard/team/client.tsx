"use client";

import { useState, useTransition } from "react";
import { inviteMember, updateMemberRole, removeMember } from "./actions";

type MemberRow = {
  id: string;
  org_id: string;
  user_id: string | null;
  role: string;
  site_ids: string[];
  active: boolean;
  invited_at: string | null;
  accepted_at: string | null;
  created_at: string;
  email: string;
  full_name: string;
};

const ROLES = ["admin", "manager", "front_desk", "security", "housekeeping", "maintenance"] as const;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  front_desk: "Front Desk",
  security: "Security",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
};

const inputStyle: React.CSSProperties = {
  fontSize: 14,
  padding: "8px 12px",
  border: "1px solid #E8E6E1",
  borderRadius: 8,
  outline: "none",
  background: "#FFFFFF",
  color: "#0A0A0B",
  width: "100%",
};

const btnPrimary: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 18px",
  background: "#0A0A0B",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  padding: "4px 10px",
  background: "transparent",
  color: "#8A3324",
  border: "1px solid rgba(138,50,36,0.3)",
  borderRadius: 6,
  cursor: "pointer",
};

export function TeamClient({
  members,
  currentMemberId,
  canManage,
}: {
  members: MemberRow[];
  currentMemberId: string;
  canManage: boolean;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("front_desk");
  const [pending, startTransition] = useTransition();

  function handleInvite() {
    if (!email.trim()) return;
    startTransition(async () => {
      await inviteMember({ email: email.trim(), role });
      setEmail("");
      setRole("front_desk");
      setShowInvite(false);
    });
  }

  function handleRoleChange(memberId: string, newRole: string) {
    startTransition(async () => {
      await updateMemberRole(memberId, newRole);
    });
  }

  function handleRemove(memberId: string) {
    if (!confirm("Remove this team member?")) return;
    startTransition(async () => {
      await removeMember(memberId);
    });
  }

  return (
    <div>
      {/* Invite button */}
      {canManage && (
        <div style={{ marginBottom: 16 }}>
          {!showInvite ? (
            <button onClick={() => setShowInvite(true)} style={btnPrimary}>
              Invite member
            </button>
          ) : (
            <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B", marginBottom: 14 }}>Invite new member</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Email</label>
                  <input
                    type="email"
                    placeholder="team@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ minWidth: 160 }}>
                  <label style={{ fontSize: 12, color: "#8A8A8E", display: "block", marginBottom: 4 }}>Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleInvite} disabled={pending} style={{ ...btnPrimary, opacity: pending ? 0.6 : 1 }}>
                    {pending ? "Sending..." : "Send invite"}
                  </button>
                  <button
                    onClick={() => { setShowInvite(false); setEmail(""); }}
                    style={{ ...btnPrimary, background: "transparent", color: "#8A8A8E", border: "1px solid #E8E6E1" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Members table */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: canManage ? "1fr 1fr 140px 100px 80px" : "1fr 1fr 140px 100px", padding: "10px 18px", borderBottom: "1px solid #E8E6E1", background: "#F7F5F0" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#8A8A8E", textTransform: "uppercase" }}>Name</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#8A8A8E", textTransform: "uppercase" }}>Email</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#8A8A8E", textTransform: "uppercase" }}>Role</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#8A8A8E", textTransform: "uppercase" }}>Status</span>
          {canManage && <span style={{ fontSize: 11, fontWeight: 600, color: "#8A8A8E", textTransform: "uppercase" }}></span>}
        </div>

        {members.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#8A8A8E", fontSize: 14 }}>No team members yet.</div>
        ) : (
          members.map((m) => {
            const isSelf = m.id === currentMemberId;
            const status = m.accepted_at ? "Active" : "Invited";
            const statusColor = m.accepted_at ? "#0A6E3B" : "#8A8A8E";
            const statusBg = m.accepted_at ? "rgba(10,110,59,0.1)" : "#E8E6E1";

            return (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: canManage ? "1fr 1fr 140px 100px 80px" : "1fr 1fr 140px 100px",
                  padding: "14px 18px",
                  borderBottom: "1px solid #E8E6E1",
                  alignItems: "center",
                  opacity: pending ? 0.6 : 1,
                }}
              >
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>
                    {m.full_name || m.email}
                  </span>
                  {isSelf && (
                    <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 6, padding: "1px 6px", borderRadius: 6, background: "#E8E6E1", color: "#3A3A3D" }}>
                      You
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: "#8A8A8E" }}>{m.email}</span>
                <div>
                  {canManage && !isSelf ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      disabled={pending}
                      style={{
                        fontSize: 12,
                        padding: "3px 8px",
                        border: "1px solid #E8E6E1",
                        borderRadius: 6,
                        background: "#FFFFFF",
                        color: "#0A0A0B",
                        cursor: "pointer",
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: 12, color: "#3A3A3D" }}>{ROLE_LABELS[m.role] || m.role}</span>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: statusBg, color: statusColor, textTransform: "uppercase", display: "inline-block", width: "fit-content" }}>
                  {status}
                </span>
                {canManage && (
                  <div>
                    {!isSelf && (
                      <button onClick={() => handleRemove(m.id)} disabled={pending} style={btnDanger}>
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
