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

  // Find org membership
  const { data: member } = await admin
    .schema("enterprise")
    .from("org_members")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!member) redirect("/login?error=no_org");

  const { data: org } = await admin
    .schema("enterprise")
    .from("organizations")
    .select("*")
    .eq("id", member.org_id)
    .single();

  if (!org) redirect("/login?error=no_org");

  return {
    userId: user.id,
    email: user.email ?? "",
    org: org as Organization,
    member: member as OrgMember,
  };
}
