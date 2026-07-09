import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Admin: remove a named admin (Admin → Team). Keeps at least one admin. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) AS n FROM admins').get() as { n: number };
  if (count.n <= 1) {
    return NextResponse.json({ error: 'Keep at least one admin.' }, { status: 400 });
  }
  db.prepare('DELETE FROM admins WHERE id = ?').run(Number(id));
  return NextResponse.json({ ok: true });
}
