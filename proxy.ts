import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { APP_ROUTES, CALLBACK_URL_PARAM } from "@/lib/auth/routes";

/** Optimistic redirect only. Real validation happens in requireSession()/requireRole(). */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const signInUrl = new URL(APP_ROUTES.SIGN_IN, request.url);
  signInUrl.searchParams.set(CALLBACK_URL_PARAM, request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

// Next.js requires `matcher` to be a static literal, so constants can't be used here.
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};