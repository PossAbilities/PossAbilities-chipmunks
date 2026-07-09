import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

/**
 * Lightweight signed-cookie auth with two roles:
 *  - admin:    full admin area — named admins (Admin → Team) sign in with an
 *              emailed magic link; ADMIN_PASSWORD remains as a fallback/master login.
 *  - champion: check-in register only — each Activity Champion has their own PIN
 *              (Admin → Team), so the register knows exactly who signed a child
 *              in or out; CHAMPION_PIN remains as a shared fallback PIN.
 * Admins can access champion pages too.
 *
 * Set ADMIN_PASSWORD, CHAMPION_PIN and SESSION_SECRET in production —
 * the defaults below are for local development only.
 */

export type Role = 'admin' | 'champion';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
export const COOKIE_NAME = 'chipmunks_session';

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'chipmunks-admin';
}
export function championPin() {
  return process.env.CHAMPION_PIN || '2468';
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function makeToken(role: Role, name = ''): string {
  const payload = Buffer.from(JSON.stringify({ role, name, iat: Date.now() })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): { role: Role; name: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.role !== 'admin' && data.role !== 'champion') return null;
    // Sessions last 14 days
    if (Date.now() - data.iat > 14 * 24 * 60 * 60 * 1000) return null;
    return { role: data.role, name: data.name || '' };
  } catch {
    return null;
  }
}

export function requestRole(req: NextRequest): { role: Role; name: string } | null {
  return verifyToken(req.cookies.get(COOKIE_NAME)?.value);
}

export function canAccess(session: { role: Role } | null, required: Role): boolean {
  if (!session) return false;
  if (required === 'champion') return true; // both roles may check in
  return session.role === 'admin';
}
