import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Zone, Site } from "@/lib/types";
import { ZoneForm } from "./zone-form";
import { DeleteZoneButton } from "./delete-button";

export const dynamic = "force-dynamic";

const ZONE_ICONS: Record<string, string> = {
  room: "🛏",
  common_area: "☀",
  parking: "🚗",
  entrance: "🚪",
  service: "🔧",
  floor: "◫",
};

const ZONE_LABELS: Record<string, string> = {
  room: "Room",
  common_area: "Common area",
  parking: "Parking",
  entrance: "Entrance",
  service: "Service",
  floor: "Floor",
};

type GroupedFloor = {
  floorNumber: number | null;
  label: string;
  zones: Zone[];
};

function groupZonesByFloor(zones: Zone[]): GroupedFloor[] {
  // Separate entrance and common areas (shown at top)
  const entrance = zones.filter(z => z.zone_type === "entrance");
  const commonAreas = zones.filter(z => z.zone_type === "common_area");
  const parking = zones.filter(z => z.zone_type === "parking");
  const service = zones.filter(z => z.zone_type === "service");

  // Group rooms and floors by floor_number
  const roomish = zones.filter(z => z.zone_type === "room" || z.zone_type === "floor");
  const floorMap = new Map<number, Zone[]>();

  for (const z of roomish) {
    const fn = z.floor_number ?? 0;
    const existing = floorMap.get(fn);
    if (existing) {
      existing.push(z);
    } else {
      floorMap.set(fn, [z]);
    }
  }

  const groups: GroupedFloor[] = [];

  if (entrance.length > 0 || commonAreas.length > 0) {
    groups.push({
      floorNumber: null,
      label: "Entrance & Common Areas",
      zones: [...entrance, ...commonAreas],
    });
  }

  // Sort floors numerically
  const floorNumbers = Array.from(floorMap.keys()).sort((a, b) => a - b);
  for (const fn of floorNumbers) {
    const floorZones = floorMap.get(fn) ?? [];
    floorZones.sort((a, b) => (a.unit_number ?? a.name).localeCompare(b.unit_number ?? b.name));
    groups.push({
      floorNumber: fn,
      label: fn === 0 ? "Ground Floor" : `Floor ${fn}`,
      zones: floorZones,
    });
  }

  if (parking.length > 0) {
    groups.push({ floorNumber: null, label: "Parking", zones: parking });
  }
  if (service.length > 0) {
    groups.push({ floorNumber: null, label: "Service Areas", zones: service });
  }

  return groups;
}

export default async function ZonesPage(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const { org } = await requireAuth();
  const admin = createAdminClient();

  const { data: sites } = await admin.rpc("get_enterprise_sites", { p_org_id: org.id });
  const siteList = (sites ?? []) as Site[];
  const siteIds = siteList.map(s => s.id);

  const { data: zones } = siteIds.length > 0
    ? await admin.rpc("get_enterprise_zones", { p_site_ids: siteIds })
    : { data: [] };

  const zoneList = (zones ?? []) as Zone[];

  // Group zones by site, then by floor
  const siteMap = new Map<string, Site>();
  for (const s of siteList) siteMap.set(s.id, s);

  const zonesBySite = new Map<string, Zone[]>();
  for (const z of zoneList) {
    const existing = zonesBySite.get(z.site_id);
    if (existing) {
      existing.push(z);
    } else {
      zonesBySite.set(z.site_id, [z]);
    }
  }

  const showForm = searchParams?.add === "true";
  const totalRooms = zoneList.filter(z => z.zone_type === "room").length;
  const totalCommon = zoneList.filter(z => z.zone_type === "common_area" || z.zone_type === "entrance").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, color: "#0A0A0B", marginBottom: 4 }}>Zones</h1>
          <p style={{ fontSize: 14, color: "#8A8A8E", margin: 0 }}>
            {zoneList.length} zones across {siteList.length} site{siteList.length !== 1 ? "s" : ""} &middot; {totalRooms} rooms &middot; {totalCommon} common
          </p>
        </div>
        {!showForm && (
          <a
            href="/dashboard/zones?add=true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#0A0A0B",
              color: "#FFFFFF",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            + Add zone
          </a>
        )}
      </div>

      {/* Add zone form */}
      {showForm && (
        <div style={{
          marginBottom: 24,
          padding: 24,
          background: "#FFFFFF",
          border: "1px solid #E8E6E1",
          borderRadius: 14,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: "#0A0A0B", margin: 0 }}>Add zone</h2>
            <a href="/dashboard/zones" style={{ fontSize: 13, color: "#8A8A8E", textDecoration: "none" }}>Cancel</a>
          </div>
          <ZoneForm sites={siteList.map(s => ({ id: s.id, name: s.name }))} />
        </div>
      )}

      {/* Zone tree */}
      {siteList.length === 0 ? (
        <div style={{
          padding: 48,
          background: "#FFFFFF",
          border: "1px solid #E8E6E1",
          borderRadius: 14,
          textAlign: "center",
          color: "#8A8A8E",
          fontSize: 14,
        }}>
          No sites configured yet. Add a site in Settings first.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {siteList.map(site => {
            const siteZones = zonesBySite.get(site.id) ?? [];
            const floorGroups = groupZonesByFloor(siteZones);

            return (
              <div key={site.id} style={{
                background: "#FFFFFF",
                border: "1px solid #E8E6E1",
                borderRadius: 14,
                overflow: "hidden",
              }}>
                {/* Site header */}
                <div style={{
                  padding: "14px 20px",
                  background: "#F7F5F0",
                  borderBottom: "1px solid #E8E6E1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#0A0A0B" }}>{site.name}</div>
                    <div style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>
                      {siteZones.length} zone{siteZones.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {siteZones.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "#8A8A8E", fontSize: 13 }}>
                    No zones defined for this site yet.
                  </div>
                ) : (
                  <div>
                    {floorGroups.map((group, gi) => (
                      <div key={group.label}>
                        {/* Floor group header */}
                        <div style={{
                          padding: "10px 20px",
                          background: gi > 0 ? "#FAFAF8" : "transparent",
                          borderTop: gi > 0 ? "1px solid #E8E6E1" : "none",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#8A8A8E",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}>
                          {group.label}
                        </div>

                        {/* Zones in this group */}
                        {group.zones.map((zone, zi) => (
                          <div
                            key={zone.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 20px 12px 32px",
                              borderTop: zi > 0 ? "1px solid #F0EEEA" : "none",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>
                                {ZONE_ICONS[zone.zone_type] ?? "▪"}
                              </span>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0B" }}>
                                  {zone.name}
                                </div>
                                <div style={{ fontSize: 11, color: "#8A8A8E", display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                                  <span>{ZONE_LABELS[zone.zone_type] ?? zone.zone_type}</span>
                                  {zone.unit_number && <span style={{ color: "#3A3A3D" }}>#{zone.unit_number}</span>}
                                  {zone.capacity !== null && <span>Cap: {zone.capacity}</span>}
                                </div>
                              </div>
                            </div>

                            <DeleteZoneButton zoneId={zone.id} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
