"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F7F5F0" }}>
      {/* Left: branding panel */}
      <div className="hidden md:flex" style={{ width: 420, background: "#0A0A0B", padding: "60px 48px", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.18em", color: "#F7F5F0", textTransform: "uppercase", marginBottom: 48 }}>Turnqey Access</div>
          <h1 style={{ fontSize: 32, fontWeight: 300, color: "#F7F5F0", letterSpacing: -1, lineHeight: 1.2, marginBottom: 16 }}>Enterprise access management</h1>
          <p style={{ fontSize: 14, color: "#8A8A8E", lineHeight: 1.6, marginBottom: 24 }}>Manage locks, guests, zones, and teams across all your properties from one dashboard.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["NFC tap-to-unlock for guests", "PIN codes that expire at check-out", "Multi-zone access (room + pool + gym)", "Real-time lock monitoring"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8A8A8E" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A6E3B" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#3A3A3D" }}>Powered by Turnqey</div>
      </div>

      {/* Right: login form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="md:hidden" style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.18em", color: "#0A0A0B", textTransform: "uppercase", marginBottom: 8 }}>Turnqey Access</div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 300, color: "#0A0A0B", letterSpacing: -0.5, marginBottom: 4 }}>Sign in</h2>
          <p style={{ fontSize: 13, color: "#8A8A8E", marginBottom: 32 }}>Use your Turnqey account credentials.</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3A3A3D", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@company.com"
                style={{ width: "100%", padding: "12px 16px", fontSize: 14, color: "#0A0A0B", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 10, outline: "none", transition: "border-color 0.15s" }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3A3A3D", marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "12px 16px", fontSize: 14, color: "#0A0A0B", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 10, outline: "none", transition: "border-color 0.15s" }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 13, color: "#8A3324", marginBottom: 16, padding: "10px 14px", background: "rgba(138,50,36,0.06)", borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "13px 24px", marginTop: 16, background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, transition: "opacity 0.15s" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ fontSize: 12, color: "#8A8A8E", textAlign: "center", marginTop: 24 }}>
            Need an account? Contact your organisation admin.
          </p>
        </div>
      </div>
    </div>
  );
}
