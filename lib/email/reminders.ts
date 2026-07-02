import { getDb, todayISO } from '@/lib/db';
import { reminderEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';

/**
 * Sends "see you tomorrow" reminders for every confirmed booking with a
 * session tomorrow that hasn't already had a reminder. Safe to run as
 * often as you like (idempotent) — wire it to a daily cron, e.g.:
 *   0 16 * * *  cd /path/to/app && npm run reminders
 * or hit POST /api/cron/reminders with the CRON_SECRET header.
 */
export async function sendDueReminders(): Promise<{ sent: number; date: string }> {
  const db = getDb();
  const tomorrow = new Date(todayISO() + 'T12:00:00Z');
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const date = tomorrow.toISOString().slice(0, 10);

  const due = db
    .prepare(
      `SELECT b.id AS booking_id, b.ref, b.child_first, b.parent_name, b.parent_email,
              s.id AS session_id, s.date, s.notes
       FROM booking_days bd
       JOIN bookings b ON b.id = bd.booking_id
       JOIN sessions s ON s.id = bd.session_id
       WHERE s.date = ? AND b.status = 'confirmed'
         AND NOT EXISTS (
           SELECT 1 FROM emails e
           WHERE e.booking_id = b.id AND e.session_id = s.id AND e.kind = 'reminder'
             AND e.status IN ('sent', 'outbox')
         )`
    )
    .all(date) as {
    booking_id: number;
    ref: string;
    child_first: string;
    parent_name: string;
    parent_email: string;
    session_id: number;
    date: string;
    notes: string;
  }[];

  let sent = 0;
  for (const row of due) {
    const { subject, html } = reminderEmail({
      ref: row.ref,
      childFirst: row.child_first,
      parentName: row.parent_name,
      days: [{ date: row.date }],
      date: row.date,
      note: row.notes || undefined,
    });
    await sendEmail({
      to: row.parent_email,
      subject,
      html,
      kind: 'reminder',
      bookingId: row.booking_id,
      sessionId: row.session_id,
    });
    sent++;
  }
  return { sent, date };
}
