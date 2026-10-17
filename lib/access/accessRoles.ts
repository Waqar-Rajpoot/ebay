export const ACCESS_ROLES = ["admin", "team"] as const;
export type AccessRole = (typeof ACCESS_ROLES)[number];

/** Admin can do everything the team can; the team cannot do admin tasks. */
export function roleSatisfies(actual: AccessRole | null, required: AccessRole): boolean {
  if (actual === null) return false;
  return actual === "admin" || actual === required;
}