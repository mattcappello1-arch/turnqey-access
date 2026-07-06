"use client";

import { deleteZone } from "./actions";

async function handleDelete(formData: FormData): Promise<void> {
  await deleteZone(formData);
}

export function DeleteZoneButton({ zoneId }: { zoneId: string }) {
  return (
    <form action={handleDelete}>
      <input type="hidden" name="zone_id" value={zoneId} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("Delete this zone?")) {
            e.preventDefault();
          }
        }}
        style={{
          background: "none",
          border: "1px solid transparent",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 12,
          color: "#8A8A8E",
          cursor: "pointer",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = "#8A3324";
          e.currentTarget.style.borderColor = "#8A332430";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = "#8A8A8E";
          e.currentTarget.style.borderColor = "transparent";
        }}
      >
        Delete
      </button>
    </form>
  );
}
