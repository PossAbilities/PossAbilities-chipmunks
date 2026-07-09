import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Admin: update an Activity Champion. { name?, pin?, active? } */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const db = getDb();
  const champion = db.prepare('SELECT * FROM champions WHERE id = ?').get(Number(id)) as
    | { name: string; pin: string; active: number }
    | undefined;
  if (!champion) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pin = body.pin !== undefined ? String(body.pin).trim() : champion.pin;
  if (body.pin !== undefined && pin.length < 4) {
    return NextResponse.json({ error: 'PIN must be at least 4 characters.' }, { status: 400 });
  }
  try {
    db.prepare('UPDATE champions SET name = ?, pin = ?, active = ? WHERE id = ?').run(
      body.name !== undefined ? String(body.name).trim() : champion.name,
      pin,
      body.active !== undefined ? (body.active ? 1 : 0) : champion.active,
      Number(id)
    );
  } catch {
    return NextResponse.json({ error: 'That PIN is already in use — please pick another.' }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

/** Admin: remove an Activity Champion. Past check-in records keep their name. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = getDb();
  db.prepare('DELETE FROM champions WHERE id = ?').run(Number(id));
  return NextResponse.json({ ok: true });
}
