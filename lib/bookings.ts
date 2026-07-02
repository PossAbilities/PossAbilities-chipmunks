import { getDb } from '@/lib/db';

export interface BookingRow {
  id: number;
  ref: string;
  status: string;
  paid: number;
  child_first: string;
  parent_name: string;
  parent_email: string;
}

/** The booked days (with any day notes) for a booking, oldest first. */
export function bookingDays(bookingId: number): { date: string; note?: string }[] {
  const db = getDb();
  return (
    db
      .prepare(
        `SELECT s.date, s.notes FROM booking_days bd JOIN sessions s ON s.id = bd.session_id
         WHERE bd.booking_id = ? ORDER BY s.date`
      )
      .all(bookingId) as { date: string; notes: string }[]
  ).map((r) => ({ date: r.date, note: r.notes || undefined }));
}
