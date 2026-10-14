export const APP_ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
} as const;

export const CALLBACK_URL_PARAM = "callbackUrl";

/**
 * Only allows same-site relative paths, which prevents open-redirect attacks
 * through the `callbackUrl` query parameter.
 */
export function sanitizeCallbackUrl(
  candidate: string | null | undefined,
  fallback: string = APP_ROUTES.DASHBOARD,
): string {
  if (!candidate) return fallback;
  const isRelativePath =
    candidate.startsWith("/") && !candidate.startsWith("//") && !candidate.startsWith("/\\");
  return isRelativePath ? candidate : fallback;
}