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
    child_dob: 'child’s date of birth',
    parent_name: 'parent/guardian name',
    parent_email: 'email address',
    parent_phone: 'phone number',
    employee_name: 'name of the PossAbilities employee',
    employee_id: 'employee’s payroll or Element Suite ID',
    employee_relation: 'child’s relationship to the employee',
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
  const days: { date: string; note: string }[] = [];
  for (const id of sessionIds) {
    const s = db
      .prepare(
        `SELECT s.*, (
           SELECT COUNT(*) FROM booking_days bd JOIN bookings b ON b.id = bd.booking_id
           WHERE bd.session_id = s.id AND b.status = 'confirmed'
         ) AS booked
         FROM sessions s WHERE s.id = ? AND s.active = 1`
      )
      .get(id) as { id: number; date: string; capacity: number; booked: number; notes: string } | undefined;
    if (!s) return NextResponse.json({ error: 'One of the chosen days is no longer available.' }, { status: 400 });
    if (s.booked >= s.capacity) {
      return NextResponse.json({ error: `Sorry — ${s.date} is now fully booked.` }, { status: 409 });
    }
    days.push({ date: s.date, note: s.notes || '' });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));

  // Chipmunks must be 8 or over on their first booked day
  const dob = new Date(str('child_dob') + 'T12:00:00Z');
  if (!Number.isNaN(dob.getTime())) {
    const firstDay = new Date(days[0].date + 'T12:00:00Z');
    const age =
      (firstDay.getTime() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 8) {
      return NextResponse.json(
        { error: 'Cherwell Chipmunks must be 8 years old or over — sorry, little ones!' },
        { status: 400 }
      );
    }
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

  // Signature (required) — drawn on the form, stored privately like photos
  const signature = form.get('signature');
  if (!(signature instanceof File) || signature.size === 0) {
    return NextResponse.json({ error: 'Please sign the booking to confirm it.' }, { status: 400 });
  }
  if (signature.type !== 'image/png' || signature.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'The signature could not be read — please try signing again.' }, { status: 400 });
  }
  if (!str('signed_name')) {
    return NextResponse.json({ error: 'Please type your full name to sign.' }, { status: 400 });
  }
  const signatureName = 'sig-' + crypto.randomUUID() + '.png';
  fs.writeFileSync(path.join(UPLOADS_DIR, signatureName), Buffer.from(await signature.arrayBuffer()));
  const signedAt = new Date().toISOString();

  const ref = makeRef();
  const insert = db.transaction(() => {
    const res = db
      .prepare(
        `INSERT INTO bookings (
          ref, child_first, child_last, child_dob, child_address, photo,
          parent_name, parent_email, parent_phone, parent_phone2, relationship,
          kin_name, kin_phone, kin_relationship, kin_address,
          medical_conditions, allergies, dietary, medication, support_needs, gp_details,
          employee_name, employee_id, employee_relation, employee_email,
          signature, signed_name, signed_at,
          pickup_names, consent_photo, consent_medical, consent_activities, anything_else
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      )
      .run(
        ref,
        str('child_first'),
        str('child_last'),
        str('child_dob'),
        str('child_address'),
        photoName,
        str('parent_name'),
        email,
        str('parent_phone'),
        str('parent_phone2'),
        str('relationship'),
        str('kin_name'),
        str('kin_phone'),
        str('kin_relationship'),
        str('kin_address'),
        str('medical_conditions'),
        str('allergies'),
        str('dietary'),
        str('medication'),
        str('support_needs'),
        str('gp_details'),
        str('employee_name'),
        str('employee_id'),
        str('employee_relation'),
        str('employee_email'),
        signatureName,
        str('signed_name'),
        signedAt,
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
    days,
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
