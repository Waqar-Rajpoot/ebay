import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, ACCESS_SESSION_SECONDS, buildAccessCookieOptions } from "@/lib/access/accessConstants";
import { createAccessToken, isValidAccessCode } from "@/lib/access/accessSession";
import { assertNotRateLimited, clearFailedAttempts, getClientIdentifier, recordFailedAttempt } from "@/lib/access/rateLimit";
import connectToDatabase from "@/lib/db/mongoose";
import { UnauthorizedError } from "@/lib/errors/appErrors";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { readJsonBody } from "@/lib/http/readJsonBody";
import { accessRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

/** Checks an access code and, if correct, sets the signed login cookie. */
export const POST = withErrorHandling(async (request: Request) => {
  const { role, code } = accessRequestSchema.parse(await readJsonBody(request));
  const identifier = getClientIdentifier(request);

  await connectToDatabase();
  await assertNotRateLimited(identifier);

  if (!isValidAccessCode(role, code)) {
    await recordFailedAttempt(identifier);
    throw new UnauthorizedError("That access code is not correct.");
  }
  await clearFailedAttempts(identifier);

  const response = NextResponse.json({ role });
  response.cookies.set(ACCESS_COOKIE_NAME, createAccessToken(role), buildAccessCookieOptions(ACCESS_SESSION_SECONDS));
  return response;
});

/** Signs out by clearing the cookie. */
export const DELETE = withErrorHandling(async () => {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE_NAME, "", buildAccessCookieOptions(0));
  return response;
});