import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  // If logged in, go to dashboard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  // Otherwise show landing page
  return (
    <div style={{ background: "#F7F5F0", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 5%", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.18em", color: "#0A0A0B", textTransform: "uppercase" }}>Turnqey Access</div>
        <Link href="/login" style={{ padding: "10px 24px", background: "#0A0A0B", color: "#F7F5F0", borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "100px 5% 80px", textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 20 }}>Enterprise access management</div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 300, letterSpacing: -2, lineHeight: 1.05, color: "#0A0A0B", marginBottom: 20 }}>
          Every door.<br /><span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#3A3A3D" }}>One platform.</span>
        </h1>
        <p style={{ fontSize: 17, color: "#8A8A8E", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 40px" }}>
          Manage access across hotels, apartments, and accommodation properties. NFC unlock, auto-expiring codes, multi-zone access, real-time monitoring.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link href="/login" style={{ padding: "14px 32px", background: "#0A0A0B", color: "#F7F5F0", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>Get started</Link>
          <a href="https://turnqey.com.au" style={{ padding: "14px 32px", background: "transparent", color: "#3A3A3D", borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: "none", border: "1px solid #E8E6E1" }}>Learn more</a>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 5% 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {[
            { title: "NFC tap-to-unlock", desc: "Guests unlock with their phone. No app download needed. Works on iPhone and Android.", icon: "📱" },
            { title: "Auto-expiring codes", desc: "PIN codes generate at check-in and expire at check-out. No manual revocation.", icon: "🔑" },
            { title: "Multi-zone access", desc: "Room, pool, gym, parking. One guest stay, multiple access points. Managed centrally.", icon: "🏢" },
            { title: "Real-time monitoring", desc: "Battery levels, online status, access events. Alerts when something needs attention.", icon: "📊" },
            { title: "White-label guest portal", desc: "Guests see your brand, not ours. Custom colours, logo, and messaging.", icon: "🎨" },
            { title: "Team roles", desc: "Front desk, housekeeping, maintenance, security. Each role sees what they need.", icon: "👥" },
          ].map(f => (
            <div key={f.title} style={{ padding: "28px 24px", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#0A0A0B", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#8A8A8E", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Built for */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "0 5% 80px", textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 20 }}>Built for</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {["Hotels", "Serviced apartments", "Apartment buildings", "Student housing", "Co-working spaces"].map(t => (
            <span key={t} style={{ fontSize: 13, fontWeight: 500, color: "#3A3A3D", padding: "8px 18px", background: "#FFFFFF", borderRadius: 10, border: "1px solid #E8E6E1" }}>{t}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "0 5% 100px", textAlign: "center" }}>
        <div style={{ padding: "48px 40px", background: "#0A0A0B", borderRadius: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 300, color: "#F7F5F0", letterSpacing: -0.5, marginBottom: 12 }}>Ready to manage access at scale?</h2>
          <p style={{ fontSize: 14, color: "#8A8A8E", marginBottom: 24 }}>Set up your first property in minutes.</p>
          <Link href="/login" style={{ display: "inline-block", padding: "14px 36px", background: "#F7F5F0", color: "#0A0A0B", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>Get started</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 5%", borderTop: "1px solid #E8E6E1", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#8A8A8E" }}>Turnqey Access · Built in Melbourne · <a href="https://turnqey.com.au" style={{ color: "#3A3A3D" }}>turnqey.com.au</a></div>
      </footer>
    </div>
  );
}
