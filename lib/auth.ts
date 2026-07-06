import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { redirect } from "next/navigation";
import type { OrgMember, Organization } from "./types";

export type AuthContext = {
  userId: string;
  email: string;
  org: Organization;
  member: OrgMember;
};

export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: memberRows } = await admin.rpc("get_org_member", { p_user_id: user.id });
  const member = memberRows?.[0] as OrgMember | undefined;
  if (!member) redirect("/login?error=no_org");

  const { data: orgRows } = await admin.rpc("get_organization", { p_org_id: member.org_id });
  const org = orgRows?.[0] as Organization | undefined;
  if (!org) redirect("/login?error=no_org");

  return {
    userId: user.id,
    email: user.email ?? "",
    org,
    member,
  };
}
