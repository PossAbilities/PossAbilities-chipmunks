import type { NextRequest } from 'next/server';

/**
 * The site's own public address — used to build links/images that get
 * emailed out or embedded (magic-link sign-in, staff campaign emails).
 *
 * `req.nextUrl.origin` reflects whatever Host header the Node process itself
 * sees. On Render that's always correct, but a self-hosted server sitting
 * behind a reverse proxy, tunnel, or router port-forward can see an internal
 * address (e.g. http://localhost:3000) instead of the real public domain —
 * which would silently generate links nobody outside that machine can open.
 *
 * Set APP_URL (e.g. https://chipmunks.possabilities.org.uk) to remove any
 * doubt; otherwise this falls back to the standard X-Forwarded-* headers a
 * reverse proxy typically sets, and only then to the request's own origin.
 */
export function publicOrigin(req: NextRequest): string {
  const configured = process.env.APP_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured;

  const forwardedHost = req.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0].trim() || 'https';
    return `${forwardedProto}://${forwardedHost.split(',')[0].trim()}`;
  }

  return req.nextUrl.origin;
}
