import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Admin: view a stored email exactly as the family received it. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = getDb();
  const email = db.prepare('SELECT html FROM emails WHERE id = ?').get(Number(id)) as
    | { html: string }
    | undefined;
  if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new NextResponse(email.html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
