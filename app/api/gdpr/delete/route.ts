import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GDPR data deletion endpoint
// Allows a user to request deletion of all their data
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (body?.confirm !== "DELETE_MY_DATA") {
    return NextResponse.json({ error: "Must include { confirm: 'DELETE_MY_DATA' } to proceed" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Remove org membership
  const { data: memberRows } = await admin.rpc("get_org_member", { p_user_id: user.id });
  const member = (memberRows as { id: string; org_id: string; role: string }[])?.[0];

  if (member) {
    // If they're the only admin, prevent deletion (org would be orphaned)
    if (member.role === "admin") {
      const { data: allMembers } = await admin.rpc("get_org_members", { p_org_id: member.org_id });
      const admins = (allMembers ?? []).filter((m: { role: string }) => m.role === "admin");
      if (admins.length <= 1) {
        return NextResponse.json({
          error: "You are the only admin. Transfer admin role to another member before deleting your account.",
        }, { status: 400 });
      }
    }

    // Remove their org membership
    await admin.rpc("delete_org_member", { p_member_id: member.id });
  }

  // Delete their Supabase auth account
  // Note: this requires the service role key
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: "Failed to delete account. Contact support." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Your account and all associated data have been deleted. You will be signed out.",
  });
}
