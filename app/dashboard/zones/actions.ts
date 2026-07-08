"use server";

import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

export async function createZone(formData: FormData): Promise<ActionResult> {
  const { org } = await requireAuth();
  const admin = createAdminClient();

  const siteId = formData.get("site_id") as string | null;
  const name = (formData.get("name") as string | null)?.trim();
  const zoneType = formData.get("zone_type") as string | null;
  const floorRaw = formData.get("floor_number") as string | null;
  const unitNumber = (formData.get("unit_number") as string | null)?.trim() || null;
  const capacityRaw = formData.get("capacity") as string | null;

  if (!siteId || !name || !zoneType) {
    return { error: "Site, name, and zone type are required." };
  }

  // Verify site belongs to this org
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const siteIds = (sites ?? []).map((s: { id: string }) => s.id);
  if (!siteIds.includes(siteId)) {
    return { error: "Invalid site." };
  }

  const floorNumber = floorRaw ? parseInt(floorRaw, 10) : null;
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null;

  const { error } = await admin.rpc("create_enterprise_zone", {
    p_site_id: siteId,
    p_name: name,
    p_zone_type: zoneType,
    p_floor_number: floorNumber,
    p_unit_number: unitNumber,
    p_capacity: capacity,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/zones");
  return {};
}

export async function deleteZone(formData: FormData): Promise<ActionResult> {
  const { org } = await requireAuth();
  const admin = createAdminClient();

  const zoneId = formData.get("zone_id") as string | null;
  if (!zoneId) return { error: "Zone ID is required." };

  // Verify zone belongs to this org's sites
  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const siteIds = (sites ?? []).map((s: { id: string }) => s.id);

  if (siteIds.length === 0) return { error: "No sites found." };

  const { data: zones } = await admin.rpc("get_enterprise_zones", { p_site_ids: siteIds });
  const zoneIds = (zones ?? []).map((z: { id: string }) => z.id);
  if (!zoneIds.includes(zoneId)) {
    return { error: "Zone not found or access denied." };
  }

  const { error } = await admin.rpc("delete_enterprise_zone", { p_zone_id: zoneId });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/zones");
  return {};
}

export async function assignLockToZone(zoneId: string, lockId: string) {
  await requireAuth();
  const admin = createAdminClient();
  await admin.rpc("assign_lock_to_zone", { p_zone_id: zoneId, p_lock_id: lockId });
  revalidatePath("/dashboard/zones");
}

export async function unassignLockFromZone(zoneId: string, lockId: string) {
  await requireAuth();
  const admin = createAdminClient();
  await admin.rpc("unassign_lock_from_zone", { p_zone_id: zoneId, p_lock_id: lockId });
  revalidatePath("/dashboard/zones");
}
