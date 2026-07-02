import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Admin: list sent/queued emails (newest first). */
export async function GET(req: NextRequest) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const db = getDb();
  const emails = db
    .prepare(
      `SELECT e.id, e.kind, e.to_email, e.subject, e.status, e.error, e.created_at, b.ref
       FROM emails e LEFT JOIN bookings b ON b.id = e.booking_id
       ORDER BY e.id DESC LIMIT 500`
    )
    .all();
  return NextResponse.json({ emails });
}
