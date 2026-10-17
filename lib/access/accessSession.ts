// import "server-only";
// import { createHash, createHmac, timingSafeEqual } from "node:crypto";
// import { cookies } from "next/headers";
// import { z } from "zod";
// import { getAccessConfig } from "@/lib/config";
// import { UnauthorizedError } from "@/lib/errors/appErrors";
// import { ACCESS_COOKIE_NAME, ACCESS_SESSION_SECONDS } from "./accessConstants";
// import { ACCESS_ROLES, roleSatisfies, type AccessRole } from "./accessRoles";

// const tokenPayloadSchema = z.object({ role: z.enum(ACCESS_ROLES), expiresAt: z.number() });

// function sign(body: string): string {
//   return createHmac("sha256", getAccessConfig().sessionSecret).update(body).digest("base64url");
// }

// function digest(text: string): Buffer {
//   return createHash("sha256").update(text).digest();
// }

// /** Constant-time check of an entered code against the configured code for a role. */
// export function isValidAccessCode(role: AccessRole, enteredCode: string): boolean {
//   const { adminCode, teamCode } = getAccessConfig();
//   return timingSafeEqual(digest(enteredCode), digest(role === "admin" ? adminCode : teamCode));
// }

// /** Creates a signed token holding the role and an expiry time. */
// export function createAccessToken(role: AccessRole): string {
//   const payload = { role, expiresAt: Date.now() + ACCESS_SESSION_SECONDS * 1000 };
//   const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
//   return `${body}.${sign(body)}`;
// }

// function readAccessToken(token: string): AccessRole | null {
//   const [body, signature, extra] = token.split(".");
//   if (!body || !signature || extra !== undefined) return null;

//   const expected = Buffer.from(sign(body));
//   const actual = Buffer.from(signature);
//   if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

//   try {
//     const payload = tokenPayloadSchema.parse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
//     return payload.expiresAt > Date.now() ? payload.role : null;
//   } catch {
//     return null;
//   }
// }

// /** The signed-in role from the cookie, or null when nobody is signed in. */
// export async function getCurrentRole(): Promise<AccessRole | null> {
//   const cookieStore = await cookies();
//   const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
//   return token ? readAccessToken(token) : null;
// }

// export async function requireRole(required: AccessRole): Promise<AccessRole> {
//   const role = await getCurrentRole();
//   if (role === null || !roleSatisfies(role, required)) throw new UnauthorizedError();
//   return role;
// }





import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAccessConfig } from "@/lib/config";
import { UnauthorizedError } from "@/lib/errors/appErrors";
import { getCodeVersion } from "./accessCodeService";
import { ACCESS_COOKIE_NAME, ACCESS_SESSION_SECONDS } from "./accessConstants";
import { ACCESS_ROLES, roleSatisfies, type AccessRole } from "./accessRoles";

const tokenPayloadSchema = z.object({
  role: z.enum(ACCESS_ROLES),
  expiresAt: z.number(),
  codeVersion: z.number().int().min(0),
});

function sign(body: string): string {
  return createHmac("sha256", getAccessConfig().sessionSecret).update(body).digest("base64url");
}

/** Creates a signed token holding the role, an expiry time and the code version it was issued for. */
export async function createAccessToken(role: AccessRole): Promise<string> {
  const payload = {
    role,
    expiresAt: Date.now() + ACCESS_SESSION_SECONDS * 1000,
    codeVersion: await getCodeVersion(role),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

async function readAccessToken(token: string): Promise<AccessRole | null> {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined) return null;

  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = tokenPayloadSchema.parse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
    if (payload.expiresAt <= Date.now()) return null;
    // A changed code bumps the version, which invalidates every older login for that role.
    return payload.codeVersion === (await getCodeVersion(payload.role)) ? payload.role : null;
  } catch {
    return null;
  }
}

/** The signed-in role from the cookie, or null when nobody is signed in. */
export async function getCurrentRole(): Promise<AccessRole | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  return token ? readAccessToken(token) : null;
}

/** @throws UnauthorizedError unless the visitor has the required role (admin satisfies team). */
export async function requireRole(required: AccessRole): Promise<AccessRole> {
  const role = await getCurrentRole();
  if (role === null || !roleSatisfies(role, required)) throw new UnauthorizedError();
  return role;
}