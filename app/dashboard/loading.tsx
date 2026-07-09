export default function DashboardLoading() {
  return (
    <div style={{ padding: "0" }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 300, height: 16 }} />
      </div>

      {/* Quick actions skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ height: 48, borderRadius: 12 }} />
        ))}
      </div>

      {/* Stats skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 32 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
        ))}
      </div>

      {/* Content skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
      </div>
    </div>
  );
}
