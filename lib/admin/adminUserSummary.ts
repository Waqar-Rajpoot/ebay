import { USER_ROLES } from "@/lib/auth/roles";

/** Serializable user shape passed from server to client components. */
export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RawAdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  createdAt: Date | string;
}

export function toAdminUserSummary(user: RawAdminUser): AdminUserSummary {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? USER_ROLES.USER,
    createdAt: new Date(user.createdAt).toISOString(),
  };
}