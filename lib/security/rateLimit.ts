import { MAX_TRACKED_RATE_LIMIT_KEYS } from "@/lib/security/securityConstants";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

// In-memory and per server instance. Use a shared store (e.g. Redis) when scaling out.
const buckets = new Map<string, RateLimitBucket>();

function pruneExpiredBuckets(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Fixed-window rate limiter keyed by an arbitrary string. */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  if (buckets.size > MAX_TRACKED_RATE_LIMIT_KEYS) pruneExpiredBuckets(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= maxRequests) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}