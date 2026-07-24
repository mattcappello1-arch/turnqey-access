"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F5F0", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.18em", color: "#0A0A0B", textTransform: "uppercase", marginBottom: 32 }}>Turnqey Access</div>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(10,110,59,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A6E3B" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 300, color: "#0A0A0B", marginBottom: 8 }}>Check your email</h1>
          <p style={{ fontSize: 14, color: "#8A8A8E", lineHeight: 1.5 }}>If an account exists for {email}, you will receive a password reset link.</p>
          <Link href="/login" style={{ display: "inline-block", marginTop: 20, fontSize: 13, color: "#3A3A3D", textDecoration: "none" }}>Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F5F0", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.18em", color: "#0A0A0B", textTransform: "uppercase", marginBottom: 32, textAlign: "center" }}>Turnqey Access</div>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0A0A0B", marginBottom: 4 }}>Reset password</h1>
        <p style={{ fontSize: 13, color: "#8A8A8E", marginBottom: 24 }}>Enter your email and we will send you a reset link.</p>
        <form onSubmit={handleReset}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3A3A3D", marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="you@company.com"
            style={{ width: "100%", padding: "12px 16px", fontSize: 14, color: "#0A0A0B", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 10, outline: "none", marginBottom: 16 }} />
          {error && <div style={{ fontSize: 13, color: "#8A3324", marginBottom: 12, padding: "10px 14px", background: "rgba(138,50,36,0.06)", borderRadius: 8 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link href="/login" style={{ fontSize: 13, color: "#8A8A8E", textDecoration: "none" }}>Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
