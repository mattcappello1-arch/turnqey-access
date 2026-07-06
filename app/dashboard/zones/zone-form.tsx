"use client";

import { useActionState } from "react";
import { createZone } from "./actions";

type SiteOption = { id: string; name: string };

const ZONE_TYPES = [
  { value: "room", label: "Room" },
  { value: "common_area", label: "Common Area" },
  { value: "entrance", label: "Entrance" },
  { value: "parking", label: "Parking" },
  { value: "service", label: "Service" },
  { value: "floor", label: "Floor" },
] as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #E8E6E1",
  borderRadius: 8,
  fontSize: 14,
  color: "#0A0A0B",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#3A3A3D",
  marginBottom: 4,
};

async function handleCreate(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const result = await createZone(formData);
  return result;
}

export function ZoneForm({ sites }: { sites: SiteOption[] }) {
  const [state, action, pending] = useActionState(handleCreate, {});

  return (
    <form action={action}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Site */}
        <div>
          <label style={labelStyle}>Site</label>
          <select name="site_id" required style={inputStyle}>
            <option value="">Select site</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Zone type */}
        <div>
          <label style={labelStyle}>Zone type</label>
          <select name="zone_type" required style={inputStyle}>
            <option value="">Select type</option>
            {ZONE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Name</label>
          <input name="name" required placeholder="e.g. Room 101" style={inputStyle} />
        </div>

        {/* Floor number */}
        <div>
          <label style={labelStyle}>Floor number</label>
          <input name="floor_number" type="number" placeholder="e.g. 1" style={inputStyle} />
        </div>

        {/* Unit number */}
        <div>
          <label style={labelStyle}>Unit number</label>
          <input name="unit_number" placeholder="e.g. 101" style={inputStyle} />
        </div>

        {/* Capacity */}
        <div>
          <label style={labelStyle}>Capacity</label>
          <input name="capacity" type="number" min="0" placeholder="e.g. 2" style={inputStyle} />
        </div>
      </div>

      {state.error && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(138,50,36,0.08)", borderRadius: 8, color: "#8A3324", fontSize: 13 }}>
          {state.error}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <a
          href="/dashboard/zones"
          style={{
            padding: "8px 16px",
            fontSize: 13,
            color: "#8A8A8E",
            textDecoration: "none",
            borderRadius: 8,
            border: "1px solid #E8E6E1",
          }}
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "8px 20px",
            background: pending ? "#3A3A3D" : "#0A0A0B",
            color: "#FFFFFF",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Creating..." : "Create zone"}
        </button>
      </div>
    </form>
  );
}
