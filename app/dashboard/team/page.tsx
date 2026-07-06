import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPermission } from "@/lib/permissions";
import { TeamClient } from "./client";

export const dynamic = "force-dynamic";

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

export default async function TeamPage() {
  const { org, member } = await requireAuth();
  const admin = createAdminClient();

  const { data: rawMembers } = await admin.rpc("get_org_members", { p_org_id: org.id });
  const members = (rawMembers ?? []) as MemberRow[];
  const canManage = hasPermission(member.role, "team:manage");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Team</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>{members.length} member{members.length !== 1 ? "s" : ""}</p>
      </div>

      <TeamClient
        members={members}
        currentMemberId={member.id}
        canManage={canManage}
      />
    </div>
  );
}
