"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleMaintenance(lockId: string, enabled: boolean): Promise<{ success: boolean }> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("set_lock_maintenance", {
    p_lock_id: lockId,
    p_enabled: enabled,
  });
  if (error) {
    console.error("Failed to toggle maintenance mode:", error.message);
    return { success: false };
  }
  return { success: true };
}
