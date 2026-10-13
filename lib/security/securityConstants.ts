import type { RateLimitPolicy } from "@/lib/security/requestGuards";

export const MAX_JSON_BODY_BYTES = 20_000;
export const MAX_TRACKED_RATE_LIMIT_KEYS = 10_000;

export const PRODUCT_RATE_LIMIT: RateLimitPolicy = {
  name: "products",
  maxRequests: 20,
  windowMs: 60_000,
};

export const UPLOAD_RATE_LIMIT: RateLimitPolicy = {
  name: "uploads",
  maxRequests: 10,
  windowMs: 60_000,
};