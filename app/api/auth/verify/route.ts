import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { makeToken, COOKIE_NAME } from '@/lib/auth';
import { publicOrigin } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

/** Public: consume a magic-link token and sign the matching admin in. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const origin = publicOrigin(req);
  const fail = (reason: string) => NextResponse.redirect(`${origin}/admin?error=${reason}`);
  if (!token) return fail('invalid');

  const db = getDb();
  const row = db.prepare('SELECT * FROM magic_links WHERE token = ?').get(token) as
    | { id: number; email: string; expires_at: string; used_at: string | null }
    | undefined;
  if (!row) return fail('invalid');
  if (row.used_at) return fail('used');
  if (new Date(row.expires_at).getTime() < Date.now()) return fail('expired');

  const admin = db.prepare('SELECT name FROM admins WHERE lower(email) = ?').get(row.email) as
    | { name: string }
    | undefined;
  if (!admin) return fail('invalid');

  db.prepare('UPDATE magic_links SET used_at = ? WHERE id = ?').run(new Date().toISOString(), row.id);

  const res = NextResponse.redirect(`${origin}/admin`);
  res.cookies.set(COOKIE_NAME, makeToken('admin', admin.name || row.email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 14 * 24 * 60 * 60,
  });
  return res;
}
