import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F5F0", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.18em", color: "#8A8A8E", textTransform: "uppercase", marginBottom: 24 }}>Turnqey Access</div>
        <div style={{ fontSize: 64, fontWeight: 200, color: "#E8E6E1", letterSpacing: -2, marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: "#0A0A0B", marginBottom: 8 }}>Page not found</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E", marginBottom: 24 }}>The page you are looking for does not exist or has been moved.</p>
        <Link href="/dashboard" style={{ display: "inline-block", padding: "12px 28px", background: "#0A0A0B", color: "#F7F5F0", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
