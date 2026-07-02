import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Admin: update a day. { label?, capacity?, active? } */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const db = getDb();
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(Number(id)) as
    | { label: string; capacity: number; active: number }
    | undefined;
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.prepare('UPDATE sessions SET label = ?, capacity = ?, active = ? WHERE id = ?').run(
    body.label !== undefined ? String(body.label).trim() : session.label,
    body.capacity !== undefined ? Math.max(1, Number(body.capacity) || 1) : session.capacity,
    body.active !== undefined ? (body.active ? 1 : 0) : session.active,
    Number(id)
  );
  return NextResponse.json({ ok: true });
}

/** Admin: delete a day (only if it has no bookings). */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = getDb();
  const used = db
    .prepare('SELECT COUNT(*) AS n FROM booking_days WHERE session_id = ?')
    .get(Number(id)) as { n: number };
  if (used.n > 0) {
    return NextResponse.json(
      { error: 'This day has bookings — deactivate it instead of deleting.' },
      { status: 409 }
    );
  }
  db.prepare('DELETE FROM sessions WHERE id = ?').run(Number(id));
  return NextResponse.json({ ok: true });
}
