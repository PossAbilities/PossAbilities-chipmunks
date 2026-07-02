import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  const s = String(v ?? '');
  // Guard against spreadsheet formula injection as well as quoting
  const guarded = /^[=+\-@\t]/.test(s) ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
}

/**
 * Admin: export bookings as CSV.
 *   /api/export                → one row per booking (days combined)
 *   /api/export?mode=days      → one row per booked day (incl. check-in times)
 *   &date=YYYY-MM-DD           → limit day-mode export to one date
 */
export async function GET(req: NextRequest) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const db = getDb();
  const mode = req.nextUrl.searchParams.get('mode') || 'bookings';
  const date = req.nextUrl.searchParams.get('date');

  let header: string[];
  let rows: unknown[][];

  if (mode === 'days') {
    const data = db
      .prepare(
        `SELECT s.date, s.label, b.ref, b.status, b.child_first, b.child_last, b.child_dob,
                b.parent_name, b.parent_email, b.parent_phone,
                b.kin_name, b.kin_phone, b.kin_relationship,
                b.medical_conditions, b.allergies, b.dietary, b.medication, b.support_needs,
                b.employee_name, b.employee_relation,
                b.pickup_names, bd.checked_in_at, bd.checked_in_by, bd.checked_out_at
         FROM booking_days bd
         JOIN bookings b ON b.id = bd.booking_id
         JOIN sessions s ON s.id = bd.session_id
         ${date ? 'WHERE s.date = ?' : ''}
         ORDER BY s.date, b.child_last, b.child_first`
      )
      .all(...(date ? [date] : [])) as Record<string, unknown>[];
    header = Object.keys(data[0] || { date: '', ref: '' });
    rows = data.map((r) => header.map((h) => r[h]));
  } else {
    const data = db
      .prepare(
        `SELECT b.ref, b.status, b.paid, b.paid_at, b.created_at, b.child_first, b.child_last, b.child_dob,
                b.parent_name, b.parent_email, b.parent_phone, b.relationship,
                b.kin_name, b.kin_phone, b.kin_relationship,
                b.medical_conditions, b.allergies, b.dietary, b.medication, b.support_needs, b.gp_details,
                b.employee_name, b.employee_id, b.employee_relation,
                b.pickup_names, b.consent_photo, b.anything_else,
                (SELECT GROUP_CONCAT(s.date, '; ') FROM booking_days bd
                 JOIN sessions s ON s.id = bd.session_id
                 WHERE bd.booking_id = b.id) AS booked_days
         FROM bookings b ORDER BY b.created_at DESC`
      )
      .all() as Record<string, unknown>[];
    header = Object.keys(data[0] || { ref: '' });
    rows = data.map((r) => header.map((h) => r[h]));
  }

  const csv = [header.join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\r\n');
  const filename = `chipmunks-${mode}${date ? '-' + date : ''}.csv`;
  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
