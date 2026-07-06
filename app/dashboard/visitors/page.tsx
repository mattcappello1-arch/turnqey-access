import { requireAuth } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireAuth();
  const title = "Visitors";
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 8 }}>{title}</h1>
      <div style={{ padding: 48, background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, textAlign: "center", color: "#8A8A8E", fontSize: 14 }}>
        Coming soon.
      </div>
    </div>
  );
}
