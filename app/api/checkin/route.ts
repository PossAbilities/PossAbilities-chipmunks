import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';
import { checkinEmail, checkoutEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

function timeNow(): string {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London',
  });
}

/**
 * Champion/Admin: record arrival and departure, and email the family.
 *   { bookingDayId, action: 'in' | 'out' | 'undo-in' | 'undo-out', collectedBy? }
 * `collectedBy` (the name of the approved person picking up) is required for 'out'.
 */
export async function POST(req: NextRequest) {
  const session = requestRole(req);
  if (!canAccess(session, 'champion')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = Number(body.bookingDayId);
  const db = getDb();
  const row = db
    .prepare(
      `SELECT bd.id, bd.booking_id, b.parent_email, b.parent_name, b.child_first
       FROM booking_days bd
       JOIN bookings b ON b.id = bd.booking_id
       WHERE bd.id = ?`
    )
    .get(id) as
    | { id: number; booking_id: number; parent_email: string; parent_name: string; child_first: string }
    | undefined;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const now = new Date().toISOString();
  const by = session!.name || session!.role;

  switch (body.action) {
    case 'in': {
      db.prepare('UPDATE booking_days SET checked_in_at = ?, checked_in_by = ? WHERE id = ?').run(now, by, id);
      const { subject, html } = checkinEmail({
        childFirst: row.child_first,
        parentName: row.parent_name,
        time: timeNow(),
        checkedInBy: by,
      });
      await sendEmail({ to: row.parent_email, subject, html, kind: 'checkin', bookingId: row.booking_id });
      break;
    }
    case 'out': {
      const collectedBy = String(body.collectedBy || '').trim();
      if (!collectedBy) {
        return NextResponse.json({ error: 'Please say who is collecting the child.' }, { status: 400 });
      }
      db.prepare('UPDATE booking_days SET checked_out_at = ?, checked_out_by = ? WHERE id = ?').run(
        now,
        collectedBy,
        id
      );
      const { subject, html } = checkoutEmail({
        childFirst: row.child_first,
        parentName: row.parent_name,
        time: timeNow(),
        collectedBy,
      });
      await sendEmail({ to: row.parent_email, subject, html, kind: 'checkout', bookingId: row.booking_id });
      break;
    }
    case 'undo-in':
      db.prepare(
        "UPDATE booking_days SET checked_in_at = NULL, checked_in_by = '', checked_out_at = NULL, checked_out_by = '' WHERE id = ?"
      ).run(id);
      break;
    case 'undo-out':
      db.prepare("UPDATE booking_days SET checked_out_at = NULL, checked_out_by = '' WHERE id = ?").run(id);
      break;
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
