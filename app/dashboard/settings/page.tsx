import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { org, member } = await requireAuth();

  if (member.role !== "admin") redirect("/dashboard");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E" }}>Organisation details and branding</p>
      </div>

      <SettingsForm
        org={{
          name: org.name,
          support_email: org.support_email,
          support_phone: org.support_phone,
          timezone: org.timezone,
          primary_color: org.primary_color,
          logo_url: org.logo_url,
        }}
      />
    </div>
  );
}
