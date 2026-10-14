import "server-only";
import { z } from "zod";

const EBAY_API_BASE_URLS = {
  sandbox: "https://api.sandbox.ebay.com",
  production: "https://api.ebay.com",
} as const;

const MINIMUM_CRON_SECRET_LENGTH = 16;
const DEFAULT_SYNC_LOOKBACK_DAYS = 30;

const ebayEnvironmentSchema = z.object({
  EBAY_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  EBAY_CLIENT_ID: z.string().min(1),
  EBAY_CLIENT_SECRET: z.string().min(1),
  EBAY_REFRESH_TOKEN: z.string().min(1),
  CRON_SECRET: z.string().min(MINIMUM_CRON_SECRET_LENGTH),
  EBAY_SYNC_LOOKBACK_DAYS: z.coerce.number().int().positive().default(DEFAULT_SYNC_LOOKBACK_DAYS),
});

export type EbayEnvironment = keyof typeof EBAY_API_BASE_URLS;

export interface EbayConfig {
  environment: EbayEnvironment;
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  cronSecret: string;
  /** How far back the very first sync reads. */
  syncLookbackDays: number;
}

let cachedConfig: EbayConfig | null = null;

/**
 * Reads and validates the eBay-related environment variables once.
 * Defaults to the sandbox so a missing EBAY_ENV can never touch real orders.
 *
 * @throws Error naming the invalid or missing variables (never their values).
 */
export function getEbayConfig(): EbayConfig {
  if (cachedConfig) return cachedConfig;

  const parsed = ebayEnvironmentSchema.safeParse(process.env);
  if (!parsed.success) {
    const invalidNames = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid or missing eBay environment variables: ${invalidNames}`);
  }

  const env = parsed.data;
  cachedConfig = {
    environment: env.EBAY_ENV,
    apiBaseUrl: EBAY_API_BASE_URLS[env.EBAY_ENV],
    clientId: env.EBAY_CLIENT_ID,
    clientSecret: env.EBAY_CLIENT_SECRET,
    refreshToken: env.EBAY_REFRESH_TOKEN,
    cronSecret: env.CRON_SECRET,
    syncLookbackDays: env.EBAY_SYNC_LOOKBACK_DAYS,
  };
  return cachedConfig;
}