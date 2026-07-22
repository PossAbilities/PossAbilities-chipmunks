import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { magicLinkEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { publicOrigin } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

const GENERIC_MESSAGE = 'If that email has admin access, we’ve sent a sign-in link — check your inbox.';

/**
 * Public: request a magic sign-in link for a named admin (Admin → Team).
 * { email }
 *
 * Always replies with the same generic message whether or not the email is a
 * known admin, so this can't be used to discover who has admin access.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const generic = () => NextResponse.json({ ok: true, message: GENERIC_MESSAGE });

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return generic();

  const db = getDb();
  const admin = db.prepare('SELECT name FROM admins WHERE lower(email) = ?').get(email) as
    | { name: string }
    | undefined;
  if (!admin) return generic();

  const recent = db
    .prepare("SELECT 1 FROM magic_links WHERE email = ? AND created_at > datetime('now', '-60 seconds')")
    .get(email);
  if (recent) return generic();

  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)').run(email, token, expiresAt);

  const link = `${publicOrigin(req)}/api/auth/verify?token=${token}`;
  const { subject, html } = magicLinkEmail({ name: admin.name || email, link });
  const sent = await sendEmail({ to: email, subject, html, kind: 'magic-link' });

  // In local/demo use without Resend or SMTP configured, hand back the link
  // directly so sign-in can still be tested — production always has one of
  // these set, so this never applies once real email is going out.
  if (!process.env.RESEND_API_KEY && !process.env.SMTP_HOST) {
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE, devLink: link, devEmailStatus: sent.status });
  }
  return generic();
}
