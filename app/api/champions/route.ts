import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Admin: list Activity Champions and their PINs (Admin → Team). */
export async function GET(req: NextRequest) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const db = getDb();
  const champions = db
    .prepare('SELECT id, name, pin, active, created_at FROM champions ORDER BY created_at ASC')
    .all();
  return NextResponse.json({ champions });
}

/** Admin: add an Activity Champion with their own sign-in PIN. { name, pin } */
export async function POST(req: NextRequest) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 80);
  const pin = String(body.pin || '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Please enter a name.' }, { status: 400 });
  }
  if (pin.length < 4) {
    return NextResponse.json({ error: 'PIN must be at least 4 characters.' }, { status: 400 });
  }
  const db = getDb();
  try {
    db.prepare('INSERT INTO champions (name, pin) VALUES (?, ?)').run(name, pin);
  } catch {
    return NextResponse.json({ error: 'That PIN is already in use — please pick another.' }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
