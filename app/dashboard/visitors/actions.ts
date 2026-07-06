"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function createVisitorPass(data: {
  site_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_type: string;
  zone_ids: string[];
  starts_at: string;
  expires_at: string;
  notes: string;
}) {
  const { member } = await requireAuth();
  if (!hasPermission(member.role, "visitors:manage")) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("create_visitor_pass", {
    p_site_id: data.site_id,
    p_issued_by: member.id,
    p_visitor_name: data.visitor_name,
    p_visitor_email: data.visitor_email || "",
    p_visitor_phone: data.visitor_phone || "",
    p_visitor_type: data.visitor_type,
    p_zone_ids: data.zone_ids,
    p_starts_at: data.starts_at,
    p_expires_at: data.expires_at,
    p_notes: data.notes || null,
  });
  revalidatePath("/dashboard/visitors");
}

export async function revokeVisitorPass(passId: string) {
  const { member } = await requireAuth();
  if (!hasPermission(member.role, "visitors:manage")) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("revoke_visitor_pass", { p_pass_id: passId });
  revalidatePath("/dashboard/visitors");
}
