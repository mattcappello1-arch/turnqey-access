"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

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
  const { data: result } = await admin.rpc("create_guest_stay", {
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
  return result as string | null; // returns stay ID
}

export async function updateGuestStayStatus(stayId: string, status: string) {
  const { member, org } = await requireAuth();
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

  // On check-in: generate access codes for room + common area locks
  if (status === "checked_in") {
    const { data: stayRows } = await admin.rpc("get_guest_stay_by_id", { p_stay_id: stayId });
    const stay = (stayRows as { id: string; site_id: string; guest_name: string; guest_email: string | null; room_zone_id: string | null; common_zone_ids: string[]; check_in: string; check_out: string }[])?.[0];

    if (stay) {
      // Get all zone IDs this guest should access
      const accessZoneIds = [stay.room_zone_id, ...(stay.common_zone_ids || [])].filter(Boolean) as string[];

      if (accessZoneIds.length > 0) {
        // Get locks assigned to those zones
        const { data: zoneLocks } = await admin.rpc("get_zone_locks", { p_zone_ids: accessZoneIds });
        const lockIds = [...new Set((zoneLocks ?? []).map((zl: { lock_id: string }) => zl.lock_id))];

        // Generate a random 6-digit PIN
        const pin = String(Math.floor(100000 + Math.random() * 900000));

        // Create access codes via Turnqey for each lock
        const turnqeyUrl = process.env.TURNQEY_API_URL ?? "https://turnqey.com.au";
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const codeIds: string[] = [];
        for (const lockId of lockIds) {
          try {
            const res = await fetch(`${turnqeyUrl}/api/access-codes`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
              body: JSON.stringify({
                lock_id: lockId,
                guest_name: stay.guest_name,
                guest_email: stay.guest_email,
                code: pin,
                code_type: "time_bound",
                starts_at: stay.check_in,
                ends_at: stay.check_out,
              }),
            });
            const data = await res.json().catch(() => null);
            if (data?.id) codeIds.push(data.id);
          } catch {
            // Continue even if one lock fails
          }
        }

        // Update stay with generated code IDs
        if (codeIds.length > 0) {
          await admin.rpc("update_guest_stay_codes", { p_stay_id: stayId, p_code_ids: codeIds });
        }

        // Send guest email with portal link and PIN
        if (stay.guest_email) {
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey && !resendKey.startsWith("your_")) {
            const resend = new Resend(resendKey);
            const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://access.turnqey.com.au"}/guest-portal/${stayId}`;

            // Get org branding
            const { data: orgInfo } = await admin.rpc("get_org_for_site", { p_site_id: stay.site_id });
            const orgBrand = (orgInfo as { org_name: string; site_name: string }[])?.[0];
            const propertyName = orgBrand?.site_name || org.name;

            resend.emails.send({
              from: process.env.EMAIL_FROM ?? "Turnqey <onboarding@resend.dev>",
              to: stay.guest_email,
              subject: `Your access to ${propertyName}`,
              html: `
                <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
                  <div style="font-size:12px;letter-spacing:0.15em;color:#8A8A8E;text-transform:uppercase;margin-bottom:24px;">${propertyName}</div>
                  <h1 style="font-size:22px;font-weight:300;color:#0A0A0B;margin-bottom:8px;">Welcome, ${stay.guest_name.split(" ")[0]}</h1>
                  <p style="font-size:14px;color:#3A3A3D;line-height:1.6;margin-bottom:24px;">Your access is ready. Here are your details:</p>

                  <div style="padding:20px;background:#F7F5F0;border-radius:12px;margin-bottom:20px;">
                    <div style="font-size:11px;letter-spacing:1px;color:#8A8A8E;text-transform:uppercase;margin-bottom:8px;">Your access code</div>
                    <div style="font-size:32px;font-weight:300;letter-spacing:8px;color:#0A0A0B;text-align:center;padding:8px 0;">${pin}</div>
                  </div>

                  <div style="display:flex;gap:16px;margin-bottom:20px;">
                    <div>
                      <div style="font-size:10px;color:#8A8A8E;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Check-in</div>
                      <div style="font-size:14px;color:#0A0A0B;">${new Date(stay.check_in).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
                    </div>
                    <div>
                      <div style="font-size:10px;color:#8A8A8E;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Check-out</div>
                      <div style="font-size:14px;color:#0A0A0B;">${new Date(stay.check_out).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
                    </div>
                  </div>

                  <a href="${portalUrl}" style="display:block;padding:14px 24px;background:#0A0A0B;color:#F7F5F0;border-radius:10px;font-size:14px;font-weight:500;text-align:center;text-decoration:none;">View your access</a>

                  <p style="font-size:12px;color:#8A8A8E;margin-top:20px;line-height:1.5;">Your code expires automatically at check-out. Enter it on the keypad at the door.</p>
                </div>
              `,
            }).catch((err) => console.error("Guest email failed:", err));
          }
        }
      }
    }
  }

  // On check-out: revoke access codes
  if (status === "checked_out") {
    // Access codes auto-expire via time_bound, but we could explicitly revoke here
  }

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
}

export async function editGuestStay(data: {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  notes: string | null;
}) {
  const { member } = await requireAuth();
  if (!["admin", "manager", "front_desk"].includes(member.role)) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("update_guest_stay_from_pms", {
    p_stay_id: data.id,
    p_guest_name: data.guest_name,
    p_guest_email: data.guest_email,
    p_guest_phone: data.guest_phone,
    p_room_zone_id: null, // keep existing room
    p_check_in: data.check_in,
    p_check_out: data.check_out,
  });
  revalidatePath("/dashboard/guests");
}

export async function deleteGuestStay(stayId: string) {
  const { member } = await requireAuth();
  if (!["admin", "manager"].includes(member.role)) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("delete_guest_stay", { p_stay_id: stayId });
  revalidatePath("/dashboard/guests");
}
