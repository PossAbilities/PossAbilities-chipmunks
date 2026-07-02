import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';
import { cancellationEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

/** Update a booking's status (admin): { status: 'confirmed' | 'cancelled' } */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  if (body.status !== 'confirmed' && body.status !== 'cancelled') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const db = getDb();
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(id)) as
    | { id: number; ref: string; status: string; child_first: string; parent_name: string; parent_email: string }
    | undefined;
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(body.status, booking.id);

  if (body.status === 'cancelled' && booking.status !== 'cancelled') {
    const days = db
      .prepare(
        `SELECT s.date FROM booking_days bd JOIN sessions s ON s.id = bd.session_id
         WHERE bd.booking_id = ? ORDER BY s.date`
      )
      .all(booking.id) as { date: string }[];
    const { subject, html } = cancellationEmail({
      ref: booking.ref,
      childFirst: booking.child_first,
      parentName: booking.parent_name,
      days,
    });
    await sendEmail({
      to: booking.parent_email,
      subject,
      html,
      kind: 'cancellation',
      bookingId: booking.id,
    });
  }
  return NextResponse.json({ ok: true });
}
