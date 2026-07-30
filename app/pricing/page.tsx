import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    desc: "For small properties getting started with smart access.",
    price: "19",
    period: "/door /mo",
    sub: "Up to 20 doors",
    features: [
      "Remote lock and unlock",
      "PIN codes with auto-expiry",
      "Guest portal (white-label)",
      "NFC tap-to-unlock",
      "Activity log",
      "Email support",
    ],
    cta: "Start free trial",
    href: "/login",
    style: "outline" as const,
  },
  {
    name: "Professional",
    desc: "For hotels and serviced apartments with multiple zones.",
    price: "15",
    period: "/door /mo",
    sub: "Up to 100 doors",
    popular: true,
    features: [
      "Everything in Starter",
      "Multi-zone access (room + pool + gym)",
      "Team roles (6 levels)",
      "PMS integration (Mews, Cloudbeds, RMS)",
      "Kiosk mode for lobby",
      "Analytics and occupancy forecast",
      "Bulk operations",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/login",
    style: "primary" as const,
  },
  {
    name: "Enterprise",
    desc: "For property groups and chains with custom requirements.",
    price: "Custom",
    period: "",
    sub: "Unlimited doors",
    features: [
      "Everything in Professional",
      "Apple Wallet mobile keys",
      "Custom domain and branding",
      "Dedicated account manager",
      "API access and webhooks",
      "SLA guarantees",
      "On-site setup support",
      "Volume pricing",
    ],
    cta: "Contact sales",
    href: "mailto:mattcappello1@gmail.com?subject=Turnqey%20Access%20Enterprise",
    style: "outline" as const,
  },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0" }}>
      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 5%", maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.18em", color: "#0A0A0B", textTransform: "uppercase", textDecoration: "none" }}>Turnqey Access</Link>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/demo" style={{ padding: "10px 20px", fontSize: 13, color: "#3A3A3D", textDecoration: "none", border: "1px solid #E8E6E1", borderRadius: 10 }}>See demo</Link>
          <Link href="/login" style={{ padding: "10px 20px", background: "#0A0A0B", color: "#F7F5F0", borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
        </div>
      </nav>

      {/* Header */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 5% 60px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 20 }}>Pricing</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 300, letterSpacing: -2, lineHeight: 1.1, color: "#0A0A0B", marginBottom: 16 }}>
          Pay per door.<br /><span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#3A3A3D" }}>Scale as you grow.</span>
        </h1>
        <p style={{ fontSize: 16, color: "#8A8A8E", maxWidth: 480, margin: "0 auto" }}>
          30-day free trial on all plans. No setup fees. No lock-in contracts. Cancel anytime.
        </p>
      </section>

      {/* Plans */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 5% 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              position: "relative", display: "flex", flexDirection: "column",
              padding: "32px 28px", background: "#FFFFFF", borderRadius: 20,
              border: plan.popular ? "2px solid #0A0A0B" : "1px solid #E8E6E1",
            }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 600, letterSpacing: 1, padding: "4px 14px", background: "#0A0A0B", color: "#F7F5F0", borderRadius: 8, textTransform: "uppercase", whiteSpace: "nowrap" }}>Most popular</div>
              )}
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0A0A0B", marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 13, color: "#8A8A8E", lineHeight: 1.4, marginBottom: 20, minHeight: 36 }}>{plan.desc}</div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                {plan.price !== "Custom" && <span style={{ fontSize: 12, color: "#8A8A8E" }}>AUD</span>}
                <span style={{ fontSize: plan.price === "Custom" ? 32 : 44, fontWeight: 300, letterSpacing: -1, color: "#0A0A0B" }}>{plan.price}</span>
                {plan.period && <span style={{ fontSize: 13, color: "#8A8A8E" }}>{plan.period}</span>}
              </div>
              <div style={{ fontSize: 11, color: "#8A8A8E", marginBottom: 24 }}>{plan.sub}</div>

              <div style={{ borderTop: "1px solid #E8E6E1", paddingTop: 20, display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ fontSize: 13, color: "#3A3A3D", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href={plan.href} className="btn-animate" style={{
                display: "block", padding: "14px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                textDecoration: "none", textAlign: "center",
                background: plan.style === "primary" ? "#0A0A0B" : "transparent",
                color: plan.style === "primary" ? "#F7F5F0" : "#0A0A0B",
                border: plan.style === "primary" ? "none" : "1px solid #E8E6E1",
              }}>{plan.cta}</Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 600, margin: "60px auto 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 300, color: "#0A0A0B", textAlign: "center", marginBottom: 24 }}>Common questions</h2>
          {[
            { q: "What counts as a door?", a: "Any lock connected to Turnqey Access. A hotel room with one lock is one door. Common areas (pool, gym) each count as one door." },
            { q: "Can I change plans?", a: "Yes. Upgrade or downgrade at any time. Changes take effect on your next billing cycle." },
            { q: "Is there a setup fee?", a: "No. You connect your locks and configure zones yourself. On the Enterprise plan, we offer on-site setup assistance." },
            { q: "What PMS systems do you integrate with?", a: "Mews, Cloudbeds, RMS Cloud, and any PMS that supports webhooks via our generic integration." },
          ].map((faq, i) => (
            <div key={i} style={{ padding: "16px 0", borderTop: i > 0 ? "1px solid #E8E6E1" : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B", marginBottom: 4 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: "#8A8A8E", lineHeight: 1.5 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: "24px 5%", borderTop: "1px solid #E8E6E1", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#8A8A8E" }}>Turnqey Access · Built in Melbourne · <a href="https://turnqey.com.au" style={{ color: "#3A3A3D", textDecoration: "none" }}>turnqey.com.au</a></div>
      </footer>
    </div>
  );
}
