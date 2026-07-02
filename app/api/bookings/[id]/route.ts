import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';
import { cancellationEmail, receiptEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { bookingDays, type BookingRow } from '@/lib/bookings';

export const dynamic = 'force-dynamic';

/**
 * Update a booking (admin):
 *   { status: 'confirmed' | 'cancelled' }          — cancel/restore (emails the family on cancel)
 *   { paid: boolean, sendReceipt?: boolean }       — record payment, optionally email a receipt
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const db = getDb();
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(id)) as
    | BookingRow
    | undefined;
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const emailData = {
    ref: booking.ref,
    childFirst: booking.child_first,
    parentName: booking.parent_name,
    days: bookingDays(booking.id),
  };

  if (typeof body.paid === 'boolean') {
    db.prepare('UPDATE bookings SET paid = ?, paid_at = ? WHERE id = ?').run(
      body.paid ? 1 : 0,
      body.paid ? new Date().toISOString() : null,
      booking.id
    );
    if (body.paid && body.sendReceipt) {
      const { subject, html } = receiptEmail(emailData);
      await sendEmail({ to: booking.parent_email, subject, html, kind: 'receipt', bookingId: booking.id });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.status !== 'confirmed' && body.status !== 'cancelled') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(body.status, booking.id);

  if (body.status === 'cancelled' && booking.status !== 'cancelled') {
    const { subject, html } = cancellationEmail(emailData);
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
