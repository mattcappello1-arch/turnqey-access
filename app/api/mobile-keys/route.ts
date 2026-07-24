import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Proxy mobile key operations to the Turnqey API
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: memberRows } = await admin.rpc("get_org_member", { p_user_id: user.id });
  if (!memberRows?.[0]) return NextResponse.json({ error: "Not an org member" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.lock_id || !body?.guest_name || !body?.guest_email) {
    return NextResponse.json({ error: "lock_id, guest_name, and guest_email required" }, { status: 400 });
  }

  const turnqeyUrl = process.env.TURNQEY_API_URL ?? "https://turnqey.com.au";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(`${turnqeyUrl}/api/mobile-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lockId = searchParams.get("lock_id");

  const turnqeyUrl = process.env.TURNQEY_API_URL ?? "https://turnqey.com.au";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(`${turnqeyUrl}/api/mobile-keys?lock_id=${lockId}`, {
    headers: { "Authorization": `Bearer ${serviceKey}` },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data);
}
