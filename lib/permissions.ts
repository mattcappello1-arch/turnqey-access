import type { EnterpriseMemberRole } from "./types";

const ROLE_HIERARCHY: Record<EnterpriseMemberRole, number> = {
  admin: 100,
  manager: 80,
  front_desk: 60,
  housekeeping: 40,
  maintenance: 30,
  security: 50,
};

type Permission =
  | "locks:view" | "locks:control"
  | "guests:view" | "guests:manage" | "guests:checkin"
  | "zones:view" | "zones:manage"
  | "team:view" | "team:manage"
  | "visitors:view" | "visitors:manage"
  | "reports:view" | "reports:export"
  | "pms:manage"
  | "branding:manage"
  | "billing:manage";

const ROLE_PERMISSIONS: Record<EnterpriseMemberRole, Permission[]> = {
  admin: [
    "locks:view", "locks:control",
    "guests:view", "guests:manage", "guests:checkin",
    "zones:view", "zones:manage",
    "team:view", "team:manage",
    "visitors:view", "visitors:manage",
    "reports:view", "reports:export",
    "pms:manage", "branding:manage", "billing:manage",
  ],
  manager: [
    "locks:view", "locks:control",
    "guests:view", "guests:manage", "guests:checkin",
    "zones:view", "zones:manage",
    "team:view", "team:manage",
    "visitors:view", "visitors:manage",
    "reports:view", "reports:export",
    "pms:manage",
  ],
  front_desk: [
    "locks:view", "locks:control",
    "guests:view", "guests:manage", "guests:checkin",
    "zones:view",
    "visitors:view", "visitors:manage",
    "reports:view",
  ],
  security: [
    "locks:view", "locks:control",
    "guests:view",
    "zones:view",
    "visitors:view", "visitors:manage",
    "reports:view",
  ],
  housekeeping: [
    "locks:view", "locks:control",
    "guests:view",
    "zones:view",
  ],
  maintenance: [
    "locks:view", "locks:control",
    "zones:view",
  ],
};

export function hasPermission(role: EnterpriseMemberRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasMinRole(role: EnterpriseMemberRole, minRole: EnterpriseMemberRole): boolean {
  return (ROLE_HIERARCHY[role] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

export { type Permission };
