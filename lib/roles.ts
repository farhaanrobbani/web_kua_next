export const ROLES = ["staff", "operator", "kepala", "superadmin"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  staff: "Staf",
  operator: "Operator",
  kepala: "Kepala KUA",
  superadmin: "Super Admin",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

export function canManageContent(role: Role): boolean {
  return role === "operator" || role === "superadmin";
}

export function canApproveLetters(role: Role): boolean {
  return role === "kepala" || role === "operator" || role === "superadmin";
}

export function canManageUsers(role: Role): boolean {
  return role === "superadmin";
}
