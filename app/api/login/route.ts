import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { adminPassword, championPin, makeToken, COOKIE_NAME } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/**
 * { role: 'admin' | 'champion', password, name? }
 *
 * Admin: the shared ADMIN_PASSWORD remains a fallback/master login — named
 * admins normally sign in via an emailed magic link instead (see /api/auth/*).
 *
 * Champion: each Activity Champion can have their own PIN (Admin → Team),
 * which logs them in under their own name automatically. The shared
 * CHAMPION_PIN remains as a fallback, using whatever name they type in.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || '');
  const name = String(body.name || '').trim().slice(0, 60);

  let role: 'admin' | 'champion' | null = null;
  let finalName = name;

  if (body.role === 'admin' && password && safeEqual(password, adminPassword())) {
    role = 'admin';
    finalName = name || 'Admin';
  }

  if (body.role === 'champion' && password) {
    const db = getDb();
    const champions = db.prepare('SELECT name, pin FROM champions WHERE active = 1').all() as {
      name: string;
      pin: string;
    }[];
    const matched = champions.find((c) => safeEqual(password, c.pin));
    if (matched) {
      role = 'champion';
      finalName = matched.name;
    } else if (safeEqual(password, championPin())) {
      role = 'champion';
      finalName = name || 'Champion';
    }
  }

  if (!role) {
    return NextResponse.json({ error: 'Incorrect password — please try again.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role, name: finalName });
  res.cookies.set(COOKIE_NAME, makeToken(role, finalName), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 14 * 24 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
