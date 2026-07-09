"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

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
  const { member, org } = await requireAuth();
  if (!hasPermission(member.role, "visitors:manage")) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("create_visitor_pass", {
    p_site_id: data.site_id,
    p_issued_by: member.user_id,
    p_visitor_name: data.visitor_name,
    p_visitor_email: data.visitor_email || "",
    p_visitor_phone: data.visitor_phone || "",
    p_visitor_type: data.visitor_type,
    p_zone_ids: data.zone_ids,
    p_starts_at: data.starts_at,
    p_expires_at: data.expires_at,
    p_notes: data.notes || null,
  });

  // Generate access codes for the visitor's zones
  if (data.zone_ids.length > 0) {
    const { data: zoneLocks } = await admin.rpc("get_zone_locks", { p_zone_ids: data.zone_ids });
    const lockIds = [...new Set((zoneLocks ?? []).map((zl: { lock_id: string }) => zl.lock_id))];

    if (lockIds.length > 0) {
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      const turnqeyUrl = process.env.TURNQEY_API_URL ?? "https://turnqey.com.au";
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      for (const lockId of lockIds) {
        try {
          await fetch(`${turnqeyUrl}/api/access-codes`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
            body: JSON.stringify({
              lock_id: lockId,
              guest_name: data.visitor_name,
              code: pin,
              code_type: "time_bound",
              starts_at: data.starts_at,
              ends_at: data.expires_at,
            }),
          });
        } catch { /* continue */ }
      }

      // Email the visitor their code
      if (data.visitor_email) {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey && !resendKey.startsWith("your_")) {
          const resend = new Resend(resendKey);
          const typeLabel = data.visitor_type.charAt(0).toUpperCase() + data.visitor_type.slice(1);

          resend.emails.send({
            from: process.env.EMAIL_FROM ?? "Turnqey <onboarding@resend.dev>",
            to: data.visitor_email,
            subject: `Your ${typeLabel.toLowerCase()} access to ${org.name}`,
            html: `
              <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
                <div style="font-size:12px;letter-spacing:0.15em;color:#8A8A8E;text-transform:uppercase;margin-bottom:24px;">${org.name}</div>
                <h1 style="font-size:22px;font-weight:300;color:#0A0A0B;margin-bottom:12px;">${typeLabel} access</h1>
                <p style="font-size:14px;color:#3A3A3D;line-height:1.6;margin-bottom:24px;">Hi ${data.visitor_name.split(" ")[0]}, you have been granted access.</p>
                <div style="padding:20px;background:#F7F5F0;border-radius:12px;margin-bottom:20px;text-align:center;">
                  <div style="font-size:11px;letter-spacing:1px;color:#8A8A8E;text-transform:uppercase;margin-bottom:8px;">Your access code</div>
                  <div style="font-size:32px;font-weight:300;letter-spacing:8px;color:#0A0A0B;font-family:'Courier New',monospace;">${pin}</div>
                </div>
                <div style="font-size:13px;color:#3A3A3D;line-height:1.6;">
                  <p>Valid from: ${new Date(data.starts_at).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  <p>Valid until: ${new Date(data.expires_at).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <p style="font-size:12px;color:#8A8A8E;margin-top:16px;">Enter this code on the keypad at the door. Your code will expire automatically.</p>
              </div>
            `,
          }).catch((err) => console.error("Visitor email failed:", err));
        }
      }
    }
  }

  revalidatePath("/dashboard/visitors");
}

export async function revokeVisitorPass(passId: string) {
  const { member } = await requireAuth();
  if (!hasPermission(member.role, "visitors:manage")) throw new Error("Not authorised");

  const admin = createAdminClient();
  await admin.rpc("revoke_visitor_pass", { p_pass_id: passId });
  revalidatePath("/dashboard/visitors");
}
