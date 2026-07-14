import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

// Daily battery alert digest
// Call via Vercel Cron or external scheduler
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get all enterprise orgs via RPC
  // For now, use the org of the first member we find
  // In production, iterate all orgs
  const { data: allMembers } = await admin.from("profiles").select("id").eq("role", "admin").limit(10);
  const orgSet = new Map<string, { id: string; name: string; owner_id: string; support_email: string | null }>();

  for (const profile of (allMembers ?? []) as { id: string }[]) {
    const { data: memberRows } = await admin.rpc("get_org_member", { p_user_id: profile.id });
    const m = (memberRows as { org_id: string }[])?.[0];
    if (m && !orgSet.has(m.org_id)) {
      const { data: orgRows } = await admin.rpc("get_organization", { p_org_id: m.org_id });
      const o = (orgRows as { id: string; name: string; owner_id: string; support_email: string | null }[])?.[0];
      if (o) orgSet.set(o.id, o);
    }
  }

  const orgs = Array.from(orgSet.values());
  if (orgs.length === 0) {
    return NextResponse.json({ ok: true, message: "No orgs found" });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey.startsWith("your_")) {
    return NextResponse.json({ ok: true, message: "No email configured" });
  }

  const resend = new Resend(resendKey);
  let alertsSent = 0;

  for (const org of orgs as { id: string; name: string; owner_id: string; support_email: string | null }[]) {
    // Get sites for this org
    const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
    const propertyIds = (sites ?? []).map((s: { property_id: string }) => s.property_id);

    if (propertyIds.length === 0) continue;

    // Get locks with low battery or offline
    const { data: locks } = await admin.from("locks").select("id,name,unit_label,battery_level,is_online,property_id").in("property_id", propertyIds);
    const lockList = (locks ?? []) as { id: string; name: string; unit_label: string | null; battery_level: number | null; is_online: boolean | null }[];

    const lowBattery = lockList.filter(l => l.battery_level !== null && l.battery_level < 0.2);
    const offline = lockList.filter(l => l.is_online === false);

    if (lowBattery.length === 0 && offline.length === 0) continue;

    // Get admin email
    const { data: members } = await admin.rpc("get_org_members", { p_org_id: org.id });
    const admins = (members ?? []).filter((m: { role: string; email: string }) => m.role === "admin" && m.email);
    const adminEmails = admins.map((m: { email: string }) => m.email);

    if (adminEmails.length === 0) continue;

    const lockRows = [
      ...lowBattery.map(l => `<tr><td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;">${l.unit_label || l.name}</td><td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;color:#8A3324;font-weight:600;">${Math.round((l.battery_level ?? 0) * 100)}% battery</td></tr>`),
      ...offline.map(l => `<tr><td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;">${l.unit_label || l.name}</td><td style="padding:8px 12px;border-bottom:1px solid #E8E6E1;color:#8A8A8E;">Offline</td></tr>`),
    ].join("");

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Turnqey <onboarding@resend.dev>",
      to: adminEmails,
      subject: `${org.name}: ${lowBattery.length + offline.length} lock alert${lowBattery.length + offline.length !== 1 ? "s" : ""}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;">
          <div style="font-size:11px;letter-spacing:0.15em;color:#8A8A8E;text-transform:uppercase;margin-bottom:24px;">TURNQEY ACCESS · DAILY ALERT</div>
          <h1 style="font-size:20px;font-weight:300;color:#0A0A0B;margin-bottom:16px;">${org.name} lock alerts</h1>
          <p style="font-size:14px;color:#3A3A3D;margin-bottom:20px;">
            ${lowBattery.length} lock${lowBattery.length !== 1 ? "s" : ""} with low battery, ${offline.length} offline.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#0A0A0B;">
            <thead><tr><th style="text-align:left;padding:8px 12px;border-bottom:2px solid #E8E6E1;color:#8A8A8E;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Lock</th><th style="text-align:left;padding:8px 12px;border-bottom:2px solid #E8E6E1;color:#8A8A8E;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Status</th></tr></thead>
            <tbody>${lockRows}</tbody>
          </table>
          <a href="https://access.turnqey.com.au/dashboard/locks" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0A0A0B;color:#F7F5F0;border-radius:10px;font-size:13px;font-weight:500;text-decoration:none;">View locks</a>
        </div>
      `,
    }).catch(err => console.error("Battery alert email failed:", err));

    alertsSent++;
  }

  return NextResponse.json({ ok: true, alerts_sent: alertsSent });
}
