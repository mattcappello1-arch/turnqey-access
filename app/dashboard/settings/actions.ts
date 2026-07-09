"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateOrganization(data: {
  name: string;
  support_email: string | null;
  support_phone: string | null;
  timezone: string;
  primary_color: string;
  logo_url: string | null;
}): Promise<{ error: string | null }> {
  const { member, org } = await requireAuth();
  if (member.role !== "admin") return { error: "Only admins can update settings." };

  const admin = createAdminClient();
  const { error } = await admin.rpc("update_organization", {
    p_org_id: org.id,
    p_name: data.name,
    p_support_email: data.support_email,
    p_support_phone: data.support_phone,
    p_timezone: data.timezone,
    p_primary_color: data.primary_color,
    p_logo_url: data.logo_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function addSite(data: {
  org_id: string;
  property_id: string;
  name: string;
  site_type: string;
  address: string | null;
}) {
  const { member } = await requireAuth();
  if (member.role !== "admin") throw new Error("Not authorised");
  const admin = createAdminClient();
  await admin.rpc("create_enterprise_site", {
    p_org_id: data.org_id,
    p_property_id: data.property_id,
    p_name: data.name,
    p_site_type: data.site_type,
    p_address: data.address,
  });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function removeSite(siteId: string) {
  const { member } = await requireAuth();
  if (member.role !== "admin") throw new Error("Not authorised");
  const admin = createAdminClient();
  await admin.rpc("delete_enterprise_site", { p_site_id: siteId });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
