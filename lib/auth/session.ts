import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { APP_ROUTES } from "@/lib/auth/routes";
import { hasAnyRole, type UserRole } from "@/lib/auth/roles";

/** Validated session (hits the DB), deduplicated per request. Returns null when signed out. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/** Use in server components/actions: redirects to sign-in when there is no valid session. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect(APP_ROUTES.SIGN_IN);
  return session;
}

/** Like requireSession, but also redirects signed-in users who lack an allowed role. */
export async function requireRole(allowedRoles: readonly UserRole[]) {
  const session = await requireSession();
  if (!hasAnyRole(session.user.role, allowedRoles)) redirect(APP_ROUTES.DASHBOARD);
  return session;
}