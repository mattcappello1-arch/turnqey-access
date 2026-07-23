import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`feedback:${ip}`, 5, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.stay_id || !body?.rating) {
    return NextResponse.json({ error: "stay_id and rating required" }, { status: 400 });
  }

  const rating = Math.max(1, Math.min(5, Number(body.rating)));

  const admin = createAdminClient();
  await admin.rpc("submit_guest_feedback", {
    p_stay_id: body.stay_id,
    p_rating: rating,
    p_comment: body.comment || null,
  });

  return NextResponse.json({ ok: true });
}
