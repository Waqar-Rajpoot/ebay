export const USER_ROLES = { USER: "user", ADMIN: "admin" } as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Better Auth stores multiple roles in one comma-separated string.
const ROLE_SEPARATOR = ",";

/** Type guard for values coming from the UI (e.g. a <select>). */
export function isUserRole(value: string): value is UserRole {
  return Object.values<string>(USER_ROLES).includes(value);
}

/** Splits Better Auth's stored role string into individual roles. */
export function parseRoles(roleField: string | null | undefined): string[] {
  if (!roleField) return [];
  return roleField
    .split(ROLE_SEPARATOR)
    .map((role) => role.trim())
    .filter(Boolean);
}

/** True when the user holds at least one of the allowed roles. */
export function hasAnyRole(
  roleField: string | null | undefined,
  allowedRoles: readonly UserRole[],
): boolean {
  const assignedRoles = parseRoles(roleField);
  return allowedRoles.some((role) => assignedRoles.includes(role));
}

/** Parses a comma-separated email list into a normalized, lowercase array. */
export function parseAdminEmails(rawValue: string | undefined): string[] {
  return (rawValue ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Decides the role for a brand-new user.
 * Requires a verified email so an unverified address can never self-promote.
 */
export function resolveInitialRole(
  user: { email: string; emailVerified?: boolean | null },
  adminEmails: readonly string[],
): UserRole {
  const isAllowlistedAdmin =
    user.emailVerified === true && adminEmails.includes(user.email.toLowerCase());
  return isAllowlistedAdmin ? USER_ROLES.ADMIN : USER_ROLES.USER;
}