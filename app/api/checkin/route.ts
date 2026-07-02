import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Champion/Admin: record arrival and departure.
 * { bookingDayId, action: 'in' | 'out' | 'undo-in' | 'undo-out' }
 */
export async function POST(req: NextRequest) {
  const session = requestRole(req);
  if (!canAccess(session, 'champion')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = Number(body.bookingDayId);
  const db = getDb();
  const row = db.prepare('SELECT * FROM booking_days WHERE id = ?').get(id);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const now = new Date().toISOString();
  const by = session!.name || session!.role;
  switch (body.action) {
    case 'in':
      db.prepare('UPDATE booking_days SET checked_in_at = ?, checked_in_by = ? WHERE id = ?').run(now, by, id);
      break;
    case 'out':
      db.prepare('UPDATE booking_days SET checked_out_at = ? WHERE id = ?').run(now, id);
      break;
    case 'undo-in':
      db.prepare(
        "UPDATE booking_days SET checked_in_at = NULL, checked_in_by = '', checked_out_at = NULL WHERE id = ?"
      ).run(id);
      break;
    case 'undo-out':
      db.prepare('UPDATE booking_days SET checked_out_at = NULL WHERE id = ?').run(id);
      break;
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
