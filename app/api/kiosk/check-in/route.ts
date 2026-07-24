import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`kiosk:${ip}`, 10, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.stay_id) return NextResponse.json({ error: "stay_id required" }, { status: 400 });

  const admin = createAdminClient();

  // Update stay status
  await admin.rpc("update_guest_stay_status", {
    p_stay_id: body.stay_id,
    p_status: "checked_in",
    p_checked_in_at: new Date().toISOString(),
  });

  // Get stay details for access code generation
  const { data: stayRows } = await admin.rpc("get_guest_stay_by_id", { p_stay_id: body.stay_id });
  const stay = (stayRows as { id: string; site_id: string; guest_name: string; guest_email: string | null; room_zone_id: string | null; common_zone_ids: string[]; check_in: string; check_out: string }[])?.[0];

  if (stay) {
    const accessZoneIds = [stay.room_zone_id, ...(stay.common_zone_ids || [])].filter(Boolean) as string[];

    if (accessZoneIds.length > 0) {
      const { data: zoneLocks } = await admin.rpc("get_zone_locks", { p_zone_ids: accessZoneIds });
      const lockIds = [...new Set((zoneLocks ?? []).map((zl: { lock_id: string }) => zl.lock_id))];
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
              guest_name: stay.guest_name,
              code: pin,
              code_type: "time_bound",
              starts_at: stay.check_in,
              ends_at: stay.check_out,
            }),
          });
        } catch { /* continue */ }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
