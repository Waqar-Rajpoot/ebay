import "server-only";
import { z } from "zod";

export const BYTES_PER_MEGABYTE = 1024 * 1024;
const DEFAULT_MAX_UPLOAD_MEGABYTES = 4;
const DEFAULT_MAX_UPLOAD_ROWS = 10_000;
const MINIMUM_ACCESS_CODE_LENGTH = 8;
const MINIMUM_SESSION_SECRET_LENGTH = 32;

/**
 * Validates environment variables against a schema.
 * On failure it names the bad variables but never prints their values.
 */
function readEnvironment<Schema extends z.ZodType>(schema: Schema): z.output<Schema> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const variableNames = new Set(result.error.issues.map((issue) => issue.path.map(String).join(".")));
    throw new Error(`Invalid or missing environment variables: ${[...variableNames].join(", ")}`);
  }
  return result.data;
}

const uploadLimitsSchema = z.object({
  MAX_UPLOAD_MEGABYTES: z.coerce.number().positive().default(DEFAULT_MAX_UPLOAD_MEGABYTES),
  MAX_UPLOAD_ROWS: z.coerce.number().int().positive().default(DEFAULT_MAX_UPLOAD_ROWS),
});

export interface UploadLimits {
  maxFileBytes: number;
  maxRows: number;
}

let cachedUploadLimits: UploadLimits | null = null;

/** Limits for uploaded sheets. Optional in .env; falls back to safe defaults. */
export function getUploadLimits(): UploadLimits {
  if (!cachedUploadLimits) {
    const env = readEnvironment(uploadLimitsSchema);
    cachedUploadLimits = {
      maxFileBytes: env.MAX_UPLOAD_MEGABYTES * BYTES_PER_MEGABYTE,
      maxRows: env.MAX_UPLOAD_ROWS,
    };
  }
  return cachedUploadLimits;
}

const accessConfigSchema = z
  .object({
    ADMIN_ACCESS_CODE: z.string().min(MINIMUM_ACCESS_CODE_LENGTH),
    TEAM_ACCESS_CODE: z.string().min(MINIMUM_ACCESS_CODE_LENGTH),
    SESSION_SECRET: z.string().min(MINIMUM_SESSION_SECRET_LENGTH),
  })
  .refine((env) => env.ADMIN_ACCESS_CODE !== env.TEAM_ACCESS_CODE, {
    path: ["TEAM_ACCESS_CODE"],
    message: "must differ from ADMIN_ACCESS_CODE",
  });

export interface AccessConfig {
  adminCode: string;
  teamCode: string;
  sessionSecret: string;
}

let cachedAccessConfig: AccessConfig | null = null;

/** The two shared access codes and the secret that signs the login cookie. */
export function getAccessConfig(): AccessConfig {
  if (!cachedAccessConfig) {
    const env = readEnvironment(accessConfigSchema);
    cachedAccessConfig = {
      adminCode: env.ADMIN_ACCESS_CODE,
      teamCode: env.TEAM_ACCESS_CODE,
      sessionSecret: env.SESSION_SECRET,
    };
  }
  return cachedAccessConfig;
}