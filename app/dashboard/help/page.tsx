import { requireAuth } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FAQS = [
  {
    q: "How do I add a new lock?",
    a: "Locks are connected through the Turnqey dashboard at turnqey.com.au/dashboard/locks. Once connected there, they appear automatically in Turnqey Access. You can then assign them to zones.",
  },
  {
    q: "How does guest check-in work?",
    a: "Create a guest stay on the Guests page with their name, room, and dates. When you click 'Check in', a 6-digit PIN is generated for all locks in their room and common areas. The guest receives an email with their PIN and a link to the guest portal.",
  },
  {
    q: "What happens when a guest checks out?",
    a: "Access codes are time-bound and expire at the check-out date automatically. You can also manually check out a guest, which immediately revokes their access.",
  },
  {
    q: "How do I connect my PMS?",
    a: "Go to Settings, scroll to PMS Connections, and click Add. Select your PMS provider, copy the webhook secret, and configure it in your PMS settings. Reservations will sync automatically.",
  },
  {
    q: "What lock brands are supported?",
    a: "Turnqey supports 40+ brands including TTLock, Nuki, Yale, August, Schlage, Kwikset, Igloohome, Level, SALTO, and Lockly via the Seam platform.",
  },
  {
    q: "How does NFC unlock work?",
    a: "NFC-enabled locks allow guests to tap their phone on the lock to unlock. The guest portal page acts as the NFC credential. No app download is required.",
  },
  {
    q: "What do the different team roles do?",
    a: "Admin: full access. Manager: everything except billing and branding. Front Desk: manage guests, locks, visitors. Housekeeping: view rooms and locks. Maintenance: view and control locks. Security: view all, manage visitors.",
  },
  {
    q: "How do I set up kiosk mode?",
    a: "Open /kiosk/[your-site-id] on a tablet in the lobby. The site ID is shown on the API docs page. No login is required. Guests can search their name and check in directly.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. Go to Settings and click 'Export all data'. This downloads a JSON file with all your sites, zones, guest stays, team members, visitor passes, and locks.",
  },
  {
    q: "How do battery alerts work?",
    a: "The system checks lock battery levels every 4 hours. Locks below 20% appear in the notification bell and on the overview page. Admin users receive a daily email digest of low battery and offline locks.",
  },
];

const SHORTCUTS = [
  { keys: "⌘K", desc: "Command palette" },
  { keys: "?", desc: "Keyboard shortcuts" },
  { keys: "G then O", desc: "Go to Overview" },
  { keys: "G then L", desc: "Go to Locks" },
  { keys: "G then G", desc: "Go to Guests" },
];

export default async function HelpPage() {
  await requireAuth();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "var(--ink, #0A0A0B)", marginBottom: 4 }}>Help</h1>
        <p style={{ fontSize: 14, color: "var(--slate, #8A8A8E)" }}>Frequently asked questions and quick reference</p>
      </div>

      {/* Quick links */}
      <div className="grid-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 28 }}>
        {[
          { label: "API docs", href: "/dashboard/docs", icon: "📄" },
          { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
          { label: "Turnqey dashboard", href: "https://turnqey.com.au/dashboard", icon: "🔗", external: true },
          { label: "Contact support", href: "mailto:mattcappello1@gmail.com", icon: "📧", external: true },
        ].map(link => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener" : undefined}
            className="card-hover"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "var(--surface, #FFFFFF)", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 12, textDecoration: "none", color: "var(--graphite, #3A3A3D)", fontSize: 13, fontWeight: 500 }}
          >
            <span>{link.icon}</span>
            {link.label}
            {link.external && <span style={{ fontSize: 10, color: "var(--slate, #8A8A8E)", marginLeft: "auto" }}>↗</span>}
          </a>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div style={{ background: "var(--surface, #FFFFFF)", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, color: "var(--ink, #0A0A0B)", marginBottom: 12 }}>Keyboard shortcuts</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {SHORTCUTS.map(s => (
            <div key={s.keys} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 13 }}>
              <span style={{ color: "var(--graphite, #3A3A3D)" }}>{s.desc}</span>
              <kbd style={{ padding: "2px 8px", background: "var(--bg, #F7F5F0)", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 4, fontSize: 11, fontFamily: "'Courier New', monospace", color: "var(--graphite, #3A3A3D)" }}>{s.keys}</kbd>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: "var(--surface, #FFFFFF)", border: "1px solid var(--hairline, #E8E6E1)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline, #E8E6E1)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: "var(--ink, #0A0A0B)" }}>Frequently asked questions</h2>
        </div>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ padding: "16px 20px", borderTop: i > 0 ? "1px solid var(--hairline, #E8E6E1)" : "none" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink, #0A0A0B)", marginBottom: 6 }}>{faq.q}</div>
            <div style={{ fontSize: 13, color: "var(--slate, #8A8A8E)", lineHeight: 1.6 }}>{faq.a}</div>
          </div>
        ))}
      </div>

      {/* Version */}
      <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "var(--slate, #8A8A8E)" }}>
        Turnqey Access v1.0 · Built in Melbourne
      </div>
    </div>
  );
}
