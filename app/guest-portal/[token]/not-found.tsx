export default function GuestPortalNotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.18em", color: "#8A8A8E", textTransform: "uppercase", marginBottom: 24 }}>Turnqey Access</div>
        <div style={{ fontSize: 48, fontWeight: 200, color: "#E8E6E1", marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: 18, fontWeight: 400, color: "#0A0A0B", marginBottom: 8 }}>Access not found</h1>
        <p style={{ fontSize: 13, color: "#8A8A8E", lineHeight: 1.5 }}>This access link is invalid or has expired. Contact your host if you need help.</p>
      </div>
    </div>
  );
}
