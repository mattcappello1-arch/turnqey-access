export default function GuestPortalLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #E8E6E1", borderTopColor: "#0A0A0B", animation: "portalSpin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 12, color: "#8A8A8E", letterSpacing: 1 }}>Loading your access...</div>
      </div>
      <style>{`@keyframes portalSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
