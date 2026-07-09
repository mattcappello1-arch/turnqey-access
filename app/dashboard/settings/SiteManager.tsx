"use client";

import { useState, useTransition } from "react";
import { addSite, removeSite } from "./actions";

type SiteInfo = { id: string; name: string; address: string | null; site_type: string; property_id: string };
type PropertyOption = { id: string; name: string };

const SITE_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "apartment", label: "Apartment building" },
  { value: "serviced_apartment", label: "Serviced apartment" },
  { value: "student_housing", label: "Student housing" },
  { value: "coworking", label: "Co-working" },
  { value: "other", label: "Other" },
];

export function SiteManager({ orgId, sites, availableProperties }: {
  orgId: string;
  sites: SiteInfo[];
  availableProperties: PropertyOption[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(availableProperties[0]?.id || "");
  const [siteName, setSiteName] = useState("");
  const [siteType, setSiteType] = useState("hotel");
  const [address, setAddress] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    if (!selectedProperty || !siteName.trim()) return;
    startTransition(async () => {
      await addSite({
        org_id: orgId,
        property_id: selectedProperty,
        name: siteName.trim(),
        site_type: siteType,
        address: address.trim() || null,
      });
      setSiteName("");
      setAddress("");
      setShowAdd(false);
    });
  }

  const inputStyle = { width: "100%", padding: "10px 14px", fontSize: 13, color: "#0A0A0B", background: "#F7F5F0", border: "1px solid #E8E6E1", borderRadius: 10, outline: "none" };

  return (
    <div>
      {/* Existing sites */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
        {sites.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#8A8A8E", fontSize: 13 }}>No sites configured. Add one to get started.</div>
        ) : (
          sites.map((site, i) => (
            <div key={site.id} style={{ padding: "14px 18px", borderTop: i > 0 ? "1px solid #E8E6E1" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>{site.name}</div>
                <div style={{ fontSize: 12, color: "#8A8A8E" }}>
                  {SITE_TYPES.find(t => t.value === site.site_type)?.label || site.site_type}
                  {site.address && ` · ${site.address}`}
                </div>
              </div>
              <button
                onClick={() => { if (confirm(`Remove ${site.name}?`)) startTransition(() => removeSite(site.id)); }}
                disabled={pending}
                style={{ fontSize: 11, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add site */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{ padding: "10px 20px", background: "#0A0A0B", color: "#F7F5F0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          + Add site
        </button>
      ) : (
        <div style={{ padding: 20, background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>Add site</span>
            <button onClick={() => setShowAdd(false)} style={{ fontSize: 12, color: "#8A8A8E", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>

          {availableProperties.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#8A8A8E", fontSize: 13 }}>
              All your properties are already linked. Add more properties at <a href="https://turnqey.com.au/dashboard/properties" target="_blank" rel="noopener" style={{ color: "#0A6E3B" }}>turnqey.com.au</a>.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "#3A3A3D", marginBottom: 4, display: "block" }}>Property</label>
                <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)} style={inputStyle}>
                  {availableProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "#3A3A3D", marginBottom: 4, display: "block" }}>Site name</label>
                <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Grand Hotel Melbourne" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "#3A3A3D", marginBottom: 4, display: "block" }}>Type</label>
                <select value={siteType} onChange={e => setSiteType(e.target.value)} style={inputStyle}>
                  {SITE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "#3A3A3D", marginBottom: 4, display: "block" }}>Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Collins St, Melbourne" style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <button onClick={handleAdd} disabled={pending || !siteName.trim() || !selectedProperty} style={{ padding: "10px 24px", background: "#0A6E3B", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: pending ? "not-allowed" : "pointer", opacity: pending || !siteName.trim() ? 0.5 : 1 }}>
                  {pending ? "Adding..." : "Add site"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
