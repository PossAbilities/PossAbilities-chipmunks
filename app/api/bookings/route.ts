import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getDb, makeRef, UPLOADS_DIR } from '@/lib/db';
import { requestRole, canAccess } from '@/lib/auth';
import { confirmationEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/** Create a booking (public, multipart/form-data). */
export async function POST(req: NextRequest) {
  const db = getDb();
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 });
  }

  const str = (k: string) => String(form.get(k) ?? '').trim();
  const required: Record<string, string> = {
    child_first: 'child’s first name',
    child_last: 'child’s last name',
    parent_name: 'parent/guardian name',
    parent_email: 'email address',
    parent_phone: 'phone number',
  };
  for (const [key, label] of Object.entries(required)) {
    if (!str(key)) return NextResponse.json({ error: `Please provide the ${label}.` }, { status: 400 });
  }
  const email = str('parent_email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'That email address doesn’t look right.' }, { status: 400 });
  }
  if (str('consent_activities') !== 'yes' || str('consent_medical') !== 'yes') {
    return NextResponse.json(
      { error: 'The activity and emergency-treatment consents are required to book.' },
      { status: 400 }
    );
  }

  let sessionIds: number[];
  try {
    sessionIds = JSON.parse(str('session_ids'));
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) throw new Error();
    sessionIds = sessionIds.map(Number);
  } catch {
    return NextResponse.json({ error: 'Please choose at least one day.' }, { status: 400 });
  }

  // Validate sessions exist, are upcoming/active and have space
  const dates: string[] = [];
  for (const id of sessionIds) {
    const s = db
      .prepare(
        `SELECT s.*, (
           SELECT COUNT(*) FROM booking_days bd JOIN bookings b ON b.id = bd.booking_id
           WHERE bd.session_id = s.id AND b.status = 'confirmed'
         ) AS booked
         FROM sessions s WHERE s.id = ? AND s.active = 1`
      )
      .get(id) as { id: number; date: string; capacity: number; booked: number } | undefined;
    if (!s) return NextResponse.json({ error: 'One of the chosen days is no longer available.' }, { status: 400 });
    if (s.booked >= s.capacity) {
      return NextResponse.json({ error: `Sorry — ${s.date} is now fully booked.` }, { status: 409 });
    }
    dates.push(s.date);
  }

  // Photo upload (optional but encouraged — shown on the check-in register)
  let photoName = '';
  const photo = form.get('photo');
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: 'Photo is too large (max 8 MB).' }, { status: 400 });
    }
    const ext = PHOTO_TYPES[photo.type];
    if (!ext) {
      return NextResponse.json({ error: 'Photo must be a JPEG, PNG or WebP image.' }, { status: 400 });
    }
    photoName = crypto.randomUUID() + ext;
    fs.writeFileSync(path.join(UPLOADS_DIR, photoName), Buffer.from(await photo.arrayBuffer()));
  }

  const ref = makeRef();
  const insert = db.transaction(() => {
    const res = db
      .prepare(
        `INSERT INTO bookings (
          ref, child_first, child_last, child_dob, photo,
          parent_name, parent_email, parent_phone, relationship,
          kin_name, kin_phone, kin_relationship,
          medical_conditions, allergies, dietary, medication, support_needs, gp_details,
          pickup_names, consent_photo, consent_medical, consent_activities, anything_else
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .run(
        ref,
        str('child_first'),
        str('child_last'),
        str('child_dob'),
        photoName,
        str('parent_name'),
        email,
        str('parent_phone'),
        str('relationship'),
        str('kin_name'),
        str('kin_phone'),
        str('kin_relationship'),
        str('medical_conditions'),
        str('allergies'),
        str('dietary'),
        str('medication'),
        str('support_needs'),
        str('gp_details'),
        str('pickup_names'),
        str('consent_photo') === 'yes' ? 1 : 0,
        1,
        1,
        str('anything_else')
      );
    const bookingId = Number(res.lastInsertRowid);
    const addDay = db.prepare('INSERT INTO booking_days (booking_id, session_id) VALUES (?, ?)');
    for (const id of sessionIds) addDay.run(bookingId, id);
    return bookingId;
  });
  const bookingId = insert();

  const { subject, html } = confirmationEmail({
    ref,
    childFirst: str('child_first'),
    parentName: str('parent_name'),
    dates: dates.sort(),
  });
  await sendEmail({ to: email, subject, html, kind: 'confirmation', bookingId });

  return NextResponse.json({ ok: true, ref });
}

/** List all bookings with their days (admin only). */
export async function GET(req: NextRequest) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const db = getDb();
  const bookings = db
    .prepare(`SELECT * FROM bookings ORDER BY created_at DESC`)
    .all() as Record<string, unknown>[];
  const days = db
    .prepare(
      `SELECT bd.*, s.date, s.label FROM booking_days bd
       JOIN sessions s ON s.id = bd.session_id ORDER BY s.date ASC`
    )
    .all() as { booking_id: number }[];
  const byBooking = new Map<number, unknown[]>();
  for (const d of days) {
    const list = byBooking.get(d.booking_id) || [];
    list.push(d);
    byBooking.set(d.booking_id, list);
  }
  return NextResponse.json({
    bookings: bookings.map((b) => ({ ...b, days: byBooking.get(b.id as number) || [] })),
  });
}
