import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';
import { paymentEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { bookingDays, type BookingRow } from '@/lib/bookings';

export const dynamic = 'force-dynamic';

/** Admin: send the branded "ways to pay" email for a booking. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = getDb();
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(id)) as
    | BookingRow
    | undefined;
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { subject, html } = paymentEmail({
    ref: booking.ref,
    childFirst: booking.child_first,
    parentName: booking.parent_name,
    days: bookingDays(booking.id),
  });
  const result = await sendEmail({
    to: booking.parent_email,
    subject,
    html,
    kind: 'payment',
    bookingId: booking.id,
  });
  return NextResponse.json({ ok: true, status: result.status });
}
