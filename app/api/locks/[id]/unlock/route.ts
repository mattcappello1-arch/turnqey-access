import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user is an enterprise org member
  const admin = createAdminClient();
  const { data: memberRows } = await admin.rpc("get_org_member", { p_user_id: user.id });
  if (!memberRows?.[0]) return NextResponse.json({ error: "Not an org member" }, { status: 403 });

  // Proxy to Turnqey API
  const turnqeyUrl = process.env.TURNQEY_API_URL ?? "https://turnqey.com.au";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(`${turnqeyUrl}/api/locks/${id}/unlock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
