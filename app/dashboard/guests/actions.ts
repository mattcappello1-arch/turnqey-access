"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createGuestStay(data: {
  site_id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  room_zone_id: string | null;
  common_zone_ids: string[];
  check_in: string;
  check_out: string;
  notes: string | null;
}) {
  const { member } = await requireAuth();
  if (!["admin", "manager", "front_desk"].includes(member.role)) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("create_guest_stay", {
    p_site_id: data.site_id,
    p_guest_name: data.guest_name,
    p_guest_email: data.guest_email,
    p_guest_phone: data.guest_phone,
    p_room_zone_id: data.room_zone_id,
    p_common_zone_ids: data.common_zone_ids,
    p_check_in: data.check_in,
    p_check_out: data.check_out,
    p_notes: data.notes,
  });
  revalidatePath("/dashboard/guests");
}

export async function updateGuestStayStatus(stayId: string, status: string) {
  const { member } = await requireAuth();
  if (!["admin", "manager", "front_desk"].includes(member.role)) throw new Error("Not authorised");

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const extra: Record<string, string> = {};
  if (status === "checked_in") extra.p_checked_in_at = now;
  if (status === "checked_out") extra.p_checked_out_at = now;

  await admin.rpc("update_guest_stay_status", {
    p_stay_id: stayId,
    p_status: status,
    ...extra,
  });
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
}

export async function deleteGuestStay(stayId: string) {
  const { member } = await requireAuth();
  if (!["admin", "manager"].includes(member.role)) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("delete_guest_stay", { p_stay_id: stayId });
  revalidatePath("/dashboard/guests");
}
