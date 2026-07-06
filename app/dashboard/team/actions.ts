"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function inviteMember(data: {
  email: string;
  role: string;
}) {
  const { org, member } = await requireAuth();
  if (!hasPermission(member.role, "team:manage")) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("create_org_member", {
    p_org_id: org.id,
    p_email: data.email,
    p_role: data.role,
  });
  revalidatePath("/dashboard/team");
}

export async function updateMemberRole(memberId: string, role: string) {
  const { member } = await requireAuth();
  if (!hasPermission(member.role, "team:manage")) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("update_org_member_role", {
    p_member_id: memberId,
    p_role: role,
  });
  revalidatePath("/dashboard/team");
}

export async function removeMember(memberId: string) {
  const { member } = await requireAuth();
  if (!hasPermission(member.role, "team:manage")) throw new Error("Not authorised");
  if (memberId === member.id) throw new Error("Cannot remove yourself");

  const admin = createAdminClient();
  await admin.rpc("delete_org_member", { p_member_id: memberId });
  revalidatePath("/dashboard/team");
}
