import { NextRequest, NextResponse } from 'next/server';

/**
 * Content-Security-Policy with a per-request nonce for Next's own inline
 * scripts — done in middleware (not next.config.js headers()) because Next
 * needs the nonce available via the request headers to tag its injected
 * scripts. See https://nextjs.org/docs/app/guides/content-security-policy
 *
 * No 'unsafe-inline'/'unsafe-eval' for scripts. style-src allows
 * 'unsafe-inline' (inline style attributes used across the UI, e.g. the
 * mascot wave animation and the signature pad) plus Google Fonts' stylesheet.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob:;
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Skip static assets and image optimisation files — CSP on the document
    // response is what matters; applying it to every asset request is wasted work.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
