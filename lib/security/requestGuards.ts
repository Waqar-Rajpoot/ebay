import { checkRateLimit } from "@/lib/security/rateLimit";

export interface RateLimitPolicy {
  name: string;
  maxRequests: number;
  windowMs: number;
}

export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; response: Response };

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/** Browsers always send Origin on cross-site POSTs; requiring a match blocks CSRF. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Applies the same-origin and rate-limit checks.
 * Returns an error Response to send back, or null when the request may proceed.
 */
export function guardMutationRequest(request: Request, policy: RateLimitPolicy): Response | null {
  if (!isSameOrigin(request)) {
    return Response.json({ message: "Forbidden." }, { status: 403 });
  }

  const result = checkRateLimit(
    `${policy.name}:${getClientIdentifier(request)}`,
    policy.maxRequests,
    policy.windowMs
  );
  if (!result.allowed) {
    return Response.json(
      { message: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
    );
  }
  return null;
}

/** Reads a JSON body, rejecting oversized or malformed payloads. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  const text = await request.text();
  if (Buffer.byteLength(text) > maxBytes) {
    return { ok: false, response: Response.json({ message: "Payload too large." }, { status: 413 }) };
  }
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, response: Response.json({ message: "Invalid JSON body." }, { status: 400 }) };
  }
}