import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Admin: list named admins (Admin → Team). */
export async function GET(req: NextRequest) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const db = getDb();
  const admins = db.prepare('SELECT id, email, name, created_at FROM admins ORDER BY created_at ASC').all();
  return NextResponse.json({ admins });
}

/** Admin: add a named admin, who then signs in with an emailed magic link. { email, name } */
export async function POST(req: NextRequest) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 80);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Please enter a name.' }, { status: 400 });
  }
  const db = getDb();
  try {
    db.prepare('INSERT INTO admins (email, name) VALUES (?, ?)').run(email, name);
  } catch {
    return NextResponse.json({ error: 'That email is already an admin.' }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
