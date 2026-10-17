import { NextResponse } from "next/server";
import { changeAccessCodes } from "@/lib/access/accessCodeService";
import { ACCESS_COOKIE_NAME, ACCESS_SESSION_SECONDS, buildAccessCookieOptions } from "@/lib/access/accessConstants";
import { createAccessToken, requireRole } from "@/lib/access/accessSession";
import { assertNotRateLimited, clearFailedAttempts, getClientIdentifier, recordFailedAttempt } from "@/lib/access/rateLimit";
import connectToDatabase from "@/lib/db/mongoose";
import { ValidationError } from "@/lib/errors/appErrors";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { readJsonBody } from "@/lib/http/readJsonBody";
import { changeAccessCodesSchema } from "@/lib/validation/accessCodeSchemas";

export const runtime = "nodejs";

/** Admin only: changes the admin and/or team access code. */
export const PUT = withErrorHandling(async (request: Request) => {
  await requireRole("admin");
  const input = changeAccessCodesSchema.parse(await readJsonBody(request));

  // Separate counter from the login form, so guessing here cannot be mixed with normal logins.
  const identifier = `codes:${getClientIdentifier(request)}`;
  await connectToDatabase();
  await assertNotRateLimited(identifier);

  const result = await changeAccessCodes(input);
  if (!result.ok) {
    if (result.reason === "wrong_current_code") {
      await recordFailedAttempt(identifier);
      throw new ValidationError("Your current admin code is not correct.", {
        currentAdminCode: ["Your current admin code is not correct."],
      });
    }
    throw new ValidationError("Admin and team codes must be different.", {
      newTeamCode: ["Admin and team codes must be different."],
    });
  }
  await clearFailedAttempts(identifier);

  const response = NextResponse.json({ ok: true });
  if (input.newAdminCode) {
    // The old admin cookie just became invalid; keep this admin signed in with a fresh one.
    response.cookies.set(ACCESS_COOKIE_NAME, await createAccessToken("admin"), buildAccessCookieOptions(ACCESS_SESSION_SECONDS));
  }
  return response;
});