const SECONDS_PER_DAY = 24 * 60 * 60;
const SECONDS_PER_MINUTE = 60;

export const ACCESS_COOKIE_NAME = "order_portal_access";
export const ACCESS_SESSION_SECONDS = 7 * SECONDS_PER_DAY;
export const MAX_FAILED_ACCESS_ATTEMPTS = 5;
export const ACCESS_ATTEMPT_WINDOW_SECONDS = 15 * SECONDS_PER_MINUTE;
export const MAX_CODE_LENGTH = 200;

/** Cookie options used when setting or clearing the login cookie. */
export function buildAccessCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}