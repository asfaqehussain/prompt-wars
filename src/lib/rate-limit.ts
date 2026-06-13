/**
 * Simple in-memory sliding window rate limiter for API routes.
 * Prevents abuse by limiting requests per IP within a time window.
 *
 * Note: In-memory storage resets on server restart, which is acceptable
 * for a hackathon demo. Production would use Redis or similar.
 */

interface RateLimitEntry {
  timestamps: number[];
}

/** In-memory store keyed by IP address. */
const rateLimitStore = new Map<string, RateLimitEntry>();

/** Configuration for the rate limiter. */
const RATE_LIMIT_CONFIG = {
  /** Maximum number of requests allowed within the window. */
  MAX_REQUESTS: 20,
  /** Time window in milliseconds (60 seconds). */
  WINDOW_MS: 60 * 1000,
} as const;

/**
 * Checks whether a request from the given IP should be rate-limited.
 * Returns `true` if the request is allowed, `false` if it should be blocked.
 *
 * @param identifier - Typically the client IP address from request headers.
 */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.WINDOW_MS;

  let entry = rateLimitStore.get(identifier);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(identifier, entry);
  }

  // Evict timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    return false;
  }

  entry.timestamps.push(now);
  return true;
}

/**
 * Extracts a client identifier from a Next.js request for rate limiting.
 * Falls back to a generic key if no forwarded header is present.
 */
export function getClientIdentifier(
  headers: Headers
): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "anonymous"
  );
}
