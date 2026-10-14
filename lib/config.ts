import "server-only";
import { parseAdminEmails } from "@/lib/auth/roles";

/** Number of users shown on the admin screen. */
export const ADMIN_USERS_PAGE_SIZE = 50;

export interface ServerConfig {
  betterAuthSecret: string;
  betterAuthUrl: string;
  googleClientId: string;
  googleClientSecret: string;
  mongodbUri: string;
  mongodbDbName: string;
  mongodbTransactionsEnabled: boolean;
  adminEmails: readonly string[];
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example.`);
  }
  return value;
}

let cachedConfig: ServerConfig | undefined;

/**
 * Reads and validates all server environment variables once.
 * Fails fast with a clear message when something is missing.
 */
export function getServerConfig(): ServerConfig {
  cachedConfig ??= {
    betterAuthSecret: readRequiredEnv("BETTER_AUTH_SECRET"),
    betterAuthUrl: readRequiredEnv("BETTER_AUTH_URL"),
    googleClientId: readRequiredEnv("GOOGLE_CLIENT_ID"),
    googleClientSecret: readRequiredEnv("GOOGLE_CLIENT_SECRET"),
    mongodbUri: readRequiredEnv("MONGODB_URI"),
    mongodbDbName: readRequiredEnv("MONGODB_DB_NAME"),
    mongodbTransactionsEnabled: process.env.MONGODB_TRANSACTIONS === "true",
    adminEmails: parseAdminEmails(process.env.ADMIN_EMAILS),
  };
  return cachedConfig;
}