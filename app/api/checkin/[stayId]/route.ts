import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// QR code check-in endpoint
// Guest scans a QR code that links to /api/checkin/[stayId]
// Checks them in and redirects to their guest portal
export async function GET(req: NextRequest, { params }: { params: Promise<{ stayId: string }> }) {
  const { stayId } = await params;
  const admin = createAdminClient();

  // Get the stay
  const { data: stays } = await admin.rpc("get_guest_stay_by_id", { p_stay_id: stayId });
  const stay = (stays as { id: string; status: string; site_id: string; guest_name: string; room_zone_id: string | null; common_zone_ids: string[]; check_in: string; check_out: string }[])?.[0];

  if (!stay) {
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

  // Only check in if status is upcoming
  if (stay.status === "upcoming") {
    await admin.rpc("update_guest_stay_status", {
      p_stay_id: stayId,
      p_status: "checked_in",
      p_checked_in_at: new Date().toISOString(),
    });

    // Generate access codes for the guest's zones
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
              lock_id: lockId, guest_name: stay.guest_name, code: pin,
              code_type: "time_bound", starts_at: stay.check_in, ends_at: stay.check_out,
            }),
          });
        } catch { /* continue */ }
      }
    }
  }

  // Redirect to guest portal
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://access.turnqey.com.au";
  return NextResponse.redirect(`${baseUrl}/guest-portal/${stayId}`);
}
