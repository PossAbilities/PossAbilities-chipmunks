import type { NextRequest } from 'next/server';

/**
 * Minimal in-memory rate limiter for login/auth endpoints — this app runs as
 * a single long-lived Node process (not serverless/edge-distributed), so a
 * module-level Map is enough to actually slow down brute-force attempts
 * against the admin password, Activity Champion PINs (as short as 4 digits),
 * and the magic-link request endpoint.
 *
 * Not a substitute for edge-level rate limiting (e.g. Cloudflare) if that's
 * available — this is the floor, not the ceiling.
 */

interface Bucket {
  count: number;
  windowResetAt: number;
  lockedUntil?: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS_PER_WINDOW = 8;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const buckets = new Map<string, Bucket>();

// Avoid unbounded growth from scanners hitting many distinct IPs.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if ((!b.lockedUntil || b.lockedUntil < now) && b.windowResetAt < now) buckets.delete(key);
    }
  },
  30 * 60 * 1000
).unref?.();

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Call once per attempt. Returns whether this attempt is allowed. */
export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const b = buckets.get(key);

  if (b?.lockedUntil && b.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((b.lockedUntil - now) / 1000) };
  }

  if (!b || b.windowResetAt < now) {
    buckets.set(key, { count: 1, windowResetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  b.count += 1;
  if (b.count > MAX_ATTEMPTS_PER_WINDOW) {
    b.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) };
  }
  return { allowed: true };
}
