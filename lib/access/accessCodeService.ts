// import "server-only";
// import { createHash, timingSafeEqual } from "node:crypto";
// import { getAccessConfig } from "@/lib/config";
// import connectToDatabase from "@/lib/db/mongoose";
// import type { ChangeAccessCodesInput } from "@/lib/validation/accessCodeSchemas";
// import { hashAccessCode, verifyAccessCode } from "./accessCodeHash";
// import { AccessCodeModel, type AccessCodeRole } from "./accessCodeModel";

// function safeEqual(a: string, b: string): boolean {
//   const digest = (value: string) => createHash("sha256").update(value).digest();
//   return timingSafeEqual(digest(a), digest(b));
// }

// export async function verifyRoleCode(role: AccessCodeRole, code: string): Promise<boolean> {
//   await connectToDatabase();
//   const stored = await AccessCodeModel.findOne({ role }).lean();
//   if (stored) return verifyAccessCode(code, stored.codeHash);

//   const { adminCode, teamCode } = getAccessConfig();
//   return safeEqual(code, role === "admin" ? adminCode : teamCode);
// }

// export async function getCodeVersion(role: AccessCodeRole): Promise<number> {
//   await connectToDatabase();
//   const stored = await AccessCodeModel.findOne({ role }).lean();
//   return stored?.version ?? 0;
// }

// async function storeCode(role: AccessCodeRole, code: string): Promise<void> {
//   await AccessCodeModel.updateOne(
//     { role },
//     { $set: { codeHash: await hashAccessCode(code) }, $inc: { version: 1 } },
//     { upsert: true },
//   );
// }

// export type ChangeCodesResult =
//   | { ok: true }
//   | { ok: false; reason: "wrong_current_code" | "codes_must_differ" };

// export async function changeAccessCodes(input: ChangeAccessCodesInput): Promise<ChangeCodesResult> {
//   if (!(await verifyRoleCode("admin", input.currentAdminCode))) {
//     return { ok: false, reason: "wrong_current_code" };
//   }

//   const finalAdminCode = input.newAdminCode ?? input.currentAdminCode;
//   if (!input.newTeamCode && (await verifyRoleCode("team", finalAdminCode))) {
//     return { ok: false, reason: "codes_must_differ" };
//   }
//   if (input.newAdminCode && !input.newTeamCode && (await verifyRoleCode("team", input.newAdminCode))) {
//     return { ok: false, reason: "codes_must_differ" };
//   }
//   if (input.newTeamCode && (await verifyRoleCode("admin", input.newTeamCode))) {
//     return { ok: false, reason: "codes_must_differ" };
//   }

//   if (input.newAdminCode) await storeCode("admin", input.newAdminCode);
//   if (input.newTeamCode) await storeCode("team", input.newTeamCode);
//   return { ok: true };
// }




import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { getAccessConfig } from "@/lib/config";
import connectToDatabase from "@/lib/db/mongoose";
import type { ChangeAccessCodesInput } from "@/lib/validation/accessCodeSchemas";
import { hashAccessCode, verifyAccessCode } from "./accessCodeHash";
import { AccessCodeModel } from "./accessCodeModel";
import { ACCESS_ROLES, type AccessRole } from "./accessRoles";

/** Constant-time compare; hashing first gives both sides the same length. */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

function getBootstrapCode(role: AccessRole): string | undefined {
  const { bootstrapAdminCode, bootstrapTeamCode } = getAccessConfig();
  return role === "admin" ? bootstrapAdminCode : bootstrapTeamCode;
}

/**
 * Checks a submitted code for a role. Uses the database hash once one exists;
 * until then it falls back to the .env code so the very first login works.
 */
export async function verifyRoleCode(role: AccessRole, code: string): Promise<boolean> {
  await connectToDatabase();
  const stored = await AccessCodeModel.findOne({ role }).lean();
  if (stored) return verifyAccessCode(code, stored.codeHash);

  const bootstrapCode = getBootstrapCode(role);
  return bootstrapCode !== undefined && safeEqual(code, bootstrapCode);
}

/** Current version of a role's code (0 = never changed). Stored in the cookie. */
export async function getCodeVersion(role: AccessRole): Promise<number> {
  await connectToDatabase();
  const stored = await AccessCodeModel.findOne({ role }).lean();
  return stored?.version ?? 0;
}

/**
 * Copies a still-unchanged .env code into the database (version 0, so nobody is logged out).
 * This lets the admin delete the .env codes after the first change without locking anyone out.
 */
async function seedFromBootstrap(role: AccessRole): Promise<void> {
  const bootstrapCode = getBootstrapCode(role);
  if (!bootstrapCode) return;
  await AccessCodeModel.updateOne(
    { role },
    { $setOnInsert: { codeHash: await hashAccessCode(bootstrapCode), version: 0 } },
    { upsert: true },
  );
}

async function storeCode(role: AccessRole, code: string): Promise<void> {
  await AccessCodeModel.updateOne(
    { role },
    { $set: { codeHash: await hashAccessCode(code) }, $inc: { version: 1 } },
    { upsert: true },
  );
}

export type ChangeCodesResult =
  | { ok: true }
  | { ok: false; reason: "wrong_current_code" | "codes_must_differ" };

/**
 * Changes the admin and/or team code after re-checking the current admin code.
 * Returns a reason instead of throwing so the route chooses the HTTP error.
 * The route must rate-limit this call because it is a code-guessing target.
 */
export async function changeAccessCodes(input: ChangeAccessCodesInput): Promise<ChangeCodesResult> {
  if (!(await verifyRoleCode("admin", input.currentAdminCode))) {
    return { ok: false, reason: "wrong_current_code" };
  }

  const finalAdminCode = input.newAdminCode ?? input.currentAdminCode;
  if (input.newTeamCode) {
    if (safeEqual(input.newTeamCode, finalAdminCode)) return { ok: false, reason: "codes_must_differ" };
  } else if (input.newAdminCode && (await verifyRoleCode("team", input.newAdminCode))) {
    return { ok: false, reason: "codes_must_differ" };
  }

  for (const role of ACCESS_ROLES) await seedFromBootstrap(role);
  if (input.newAdminCode) await storeCode("admin", input.newAdminCode);
  if (input.newTeamCode) await storeCode("team", input.newTeamCode);
  return { ok: true };
}