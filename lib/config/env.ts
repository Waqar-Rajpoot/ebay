import "server-only";

const DEFAULT_IMAGEKIT_UPLOAD_FOLDER = "/ebay/products";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readPositiveInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`);
  }
  return parsed;
}

export interface DatabaseConfig {
  readonly uri: string;
  readonly name: string;
  readonly maxPoolSize: number;
  readonly serverSelectionTimeoutMs: number;
}

export interface ImageKitConfig {
  readonly privateKey: string;
  readonly urlEndpoint: string;
  readonly uploadFolder: string;
}

/** Database settings. Resolved lazily so a missing variable fails at first use. */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    uri: requireEnv("MONGODB_URI"),
    name: process.env.MONGODB_DB_NAME ?? "ebay",
    maxPoolSize: readPositiveInteger("MONGODB_MAX_POOL_SIZE", 10),
    serverSelectionTimeoutMs: readPositiveInteger("MONGODB_SERVER_SELECTION_TIMEOUT_MS", 5000),
  };
}

/** ImageKit settings. The private key must never reach the browser. */
export function getImageKitConfig(): ImageKitConfig {
  return {
    privateKey: requireEnv("IMAGEKIT_PRIVATE_KEY"),
    urlEndpoint: requireEnv("IMAGEKIT_URL_ENDPOINT").replace(/\/+$/, ""),
    uploadFolder: process.env.IMAGEKIT_UPLOAD_FOLDER ?? DEFAULT_IMAGEKIT_UPLOAD_FOLDER,
  };
}