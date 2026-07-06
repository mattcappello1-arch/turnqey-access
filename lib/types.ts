// Enterprise types

export type Organization = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url: string | null;
  primary_color: string;
  support_email: string | null;
  support_phone: string | null;
  timezone: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Site = {
  id: string;
  org_id: string;
  property_id: string;
  name: string;
  address: string | null;
  site_type: "hotel" | "apartment" | "serviced_apartment" | "student_housing" | "coworking" | "other";
  floor_count: number;
  unit_count: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type OrgMember = {
  id: string;
  org_id: string;
  user_id: string;
  role: "admin" | "manager" | "front_desk" | "housekeeping" | "maintenance" | "security";
  site_ids: string[];
  active: boolean;
  invited_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

export type Zone = {
  id: string;
  site_id: string;
  name: string;
  zone_type: "room" | "floor" | "common_area" | "parking" | "service" | "entrance";
  parent_zone_id: string | null;
  floor_number: number | null;
  unit_number: string | null;
  capacity: number | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ZoneAccessRule = {
  id: string;
  zone_id: string;
  name: string;
  access_type: "guest" | "resident" | "staff" | "contractor" | "visitor" | "all";
  days_of_week: number[];
  start_time: string;
  end_time: string;
  active: boolean;
  created_at: string;
};

export type GuestStay = {
  id: string;
  site_id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  room_zone_id: string | null;
  common_zone_ids: string[];
  check_in: string;
  check_out: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  status: "upcoming" | "checked_in" | "checked_out" | "cancelled" | "no_show";
  pms_reservation_id: string | null;
  pms_provider: string | null;
  access_code_ids: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type VisitorPass = {
  id: string;
  site_id: string;
  issued_by: string;
  visitor_name: string;
  visitor_email: string | null;
  visitor_phone: string | null;
  visitor_type: "visitor" | "contractor" | "delivery" | "emergency";
  zone_ids: string[];
  starts_at: string;
  expires_at: string;
  access_code_ids: string[];
  status: "active" | "expired" | "revoked";
  notes: string | null;
  created_at: string;
};

export type Lock = {
  id: string;
  property_id: string;
  owner_id: string;
  name: string;
  unit_label?: string | null;
  model: string | null;
  manufacturer: string | null;
  battery_level: number | null;
  is_locked: boolean | null;
  is_online: boolean | null;
  last_synced_at: string | null;
};

export type EnterpriseMemberRole = OrgMember["role"];
