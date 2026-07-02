import { NextRequest, NextResponse } from 'next/server';
import { getDb, listSessions } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Public: upcoming bookable days with availability. Admin (?all=1): everything. */
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === '1';
  if (all && !canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const sessions = all
    ? listSessions()
    : listSessions({ upcomingOnly: true, activeOnly: true }).map((s) => ({
        id: s.id,
        date: s.date,
        label: s.label,
        spacesLeft: Math.max(0, s.capacity - (s.booked || 0)),
      }));
  return NextResponse.json({ sessions });
}

/** Admin: add a day. { date: 'YYYY-MM-DD', label?, capacity? } */
export async function POST(req: NextRequest) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.date || ''))) {
    return NextResponse.json({ error: 'Date must be YYYY-MM-DD' }, { status: 400 });
  }
  const db = getDb();
  try {
    db.prepare('INSERT INTO sessions (date, label, capacity) VALUES (?, ?, ?)').run(
      body.date,
      String(body.label || '').trim(),
      Math.max(1, Number(body.capacity) || 20)
    );
  } catch {
    return NextResponse.json({ error: 'That date already exists.' }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
