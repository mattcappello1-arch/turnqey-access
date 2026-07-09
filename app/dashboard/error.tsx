"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 48, textAlign: "center" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(138,50,36,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A3324" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 400, color: "#0A0A0B", marginBottom: 8 }}>Something went wrong</h2>
      <p style={{ fontSize: 13, color: "#8A8A8E", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>{error.message || "An unexpected error occurred. Please try again."}</p>
      <button
        onClick={reset}
        style={{ padding: "10px 24px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
