import { NextRequest, NextResponse } from 'next/server';
import { getDb, todayISO } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Champion/Admin: the day's register — every confirmed child expected on
 * a given date, with photo, medical flags and check-in state.
 *   /api/register?date=YYYY-MM-DD   (defaults to today)
 */
export async function GET(req: NextRequest) {
  if (!canAccess(requestRole(req), 'champion')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const db = getDb();
  const date = req.nextUrl.searchParams.get('date') || todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Bad date' }, { status: 400 });
  }
  const session = db.prepare('SELECT * FROM sessions WHERE date = ?').get(date) as
    | { id: number; label: string }
    | undefined;

  const children = session
    ? db
        .prepare(
          `SELECT bd.id AS booking_day_id, bd.checked_in_at, bd.checked_in_by, bd.checked_out_at,
                  b.id AS booking_id, b.ref, b.child_first, b.child_last, b.child_dob, b.photo,
                  b.parent_name, b.parent_phone, b.kin_name, b.kin_phone, b.kin_relationship,
                  b.employee_name, b.employee_relation,
                  b.medical_conditions, b.allergies, b.dietary, b.medication, b.support_needs,
                  b.pickup_names, b.consent_photo, b.anything_else
           FROM booking_days bd
           JOIN bookings b ON b.id = bd.booking_id
           WHERE bd.session_id = ? AND b.status = 'confirmed'
           ORDER BY b.child_first, b.child_last`
        )
        .all(session.id)
    : [];

  return NextResponse.json({ date, session: session || null, children });
}
