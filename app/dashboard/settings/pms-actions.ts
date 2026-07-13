"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPmsConnection(data: {
  site_id: string;
  provider: string;
  webhook_secret: string;
  auto_checkin: boolean;
  auto_checkout: boolean;
  room_mapping: Record<string, string>;
}): Promise<{ error: string | null }> {
  const { member } = await requireAuth();
  if (member.role !== "admin") return { error: "Only admins can manage PMS connections." };

  const admin = createAdminClient();
  const { error } = await admin.rpc("create_pms_connection", {
    p_site_id: data.site_id,
    p_provider: data.provider,
    p_webhook_secret: data.webhook_secret,
    p_auto_checkin: data.auto_checkin,
    p_auto_checkout: data.auto_checkout,
    p_room_mapping: data.room_mapping,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function deletePmsConnection(id: string): Promise<{ error: string | null }> {
  const { member } = await requireAuth();
  if (member.role !== "admin") return { error: "Only admins can manage PMS connections." };

  const admin = createAdminClient();
  const { error } = await admin.rpc("delete_pms_connection", { p_connection_id: id });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { error: null };
}
