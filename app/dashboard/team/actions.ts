"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

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

  // Send invite email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && !resendKey.startsWith("your_")) {
    const resend = new Resend(resendKey);
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://access.turnqey.com.au"}/login`;
    const roleLabel = data.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

    resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Turnqey <onboarding@resend.dev>",
      to: data.email,
      subject: `You've been added to ${org.name} on Turnqey Access`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <div style="font-size:11px;letter-spacing:0.15em;color:#8A8A8E;text-transform:uppercase;margin-bottom:24px;">Turnqey Access</div>
          <h1 style="font-size:22px;font-weight:300;color:#0A0A0B;margin-bottom:12px;">You've been added to ${org.name}</h1>
          <p style="font-size:14px;color:#3A3A3D;line-height:1.6;margin-bottom:8px;">You've been invited as <strong>${roleLabel}</strong>.</p>
          <p style="font-size:14px;color:#3A3A3D;line-height:1.6;margin-bottom:24px;">Sign in with your Turnqey account to access the dashboard.</p>
          <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;background:#0A0A0B;color:#F7F5F0;border-radius:10px;font-size:14px;font-weight:500;text-decoration:none;">Sign in</a>
          <p style="font-size:12px;color:#8A8A8E;margin-top:20px;">If you don't have a Turnqey account, create one at turnqey.com.au first.</p>
        </div>
      `,
    }).catch((err) => console.error("Team invite email failed:", err));
  }

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
