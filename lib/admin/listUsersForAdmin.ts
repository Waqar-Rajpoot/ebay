import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { ADMIN_USERS_PAGE_SIZE } from "@/lib/config";
import { toAdminUserSummary, type AdminUserSummary } from "@/lib/admin/adminUserSummary";

/** The admin plugin re-checks the caller's role itself, on top of requireRole(). */
export async function listUsersForAdmin(): Promise<AdminUserSummary[]> {
  const { users } = await auth.api.listUsers({
    query: { limit: ADMIN_USERS_PAGE_SIZE, sortBy: "createdAt", sortDirection: "desc" },
    headers: await headers(),
  });
  return users.map(toAdminUserSummary);
}