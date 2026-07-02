import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { adminPassword, championPin, makeToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** { role: 'admin' | 'champion', password, name? } */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || '');
  const name = String(body.name || '').trim().slice(0, 60);

  let role: 'admin' | 'champion' | null = null;
  if (body.role === 'admin' && safeEqual(password, adminPassword())) role = 'admin';
  if (body.role === 'champion' && safeEqual(password, championPin())) role = 'champion';
  if (!role) {
    return NextResponse.json({ error: 'Incorrect password — please try again.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(COOKIE_NAME, makeToken(role, name), {
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
