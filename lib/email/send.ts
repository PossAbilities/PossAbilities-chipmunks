import nodemailer from 'nodemailer';
import { getDb } from '@/lib/db';

const DEFAULT_FROM = `"The Chipmunks at PossAbilities" <no-reply@possabilities.org.uk>`;

/**
 * Sends an email via Resend (if RESEND_API_KEY is set) or SMTP (if SMTP_HOST
 * is set), and always records a copy in the `emails` table so the Admin area
 * can preview exactly what families received. Without either configured, the
 * email stays in the outbox with status 'outbox' — perfect for local
 * development and demos. Resend is tried first when both are configured.
 *
 * Resend env vars: RESEND_API_KEY, EMAIL_FROM (or SMTP_FROM)
 * SMTP env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  kind: 'confirmation' | 'reminder' | 'cancellation' | 'payment' | 'receipt' | 'checkin' | 'checkout' | 'magic-link';
  bookingId?: number;
  sessionId?: number;
}): Promise<{ id: number; status: string }> {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO emails (booking_id, session_id, kind, to_email, subject, html, status)
       VALUES (?, ?, ?, ?, ?, ?, 'outbox')`
    )
    .run(opts.bookingId ?? null, opts.sessionId ?? null, opts.kind, opts.to, opts.subject, opts.html);
  const id = Number(result.lastInsertRowid);

  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || DEFAULT_FROM;
  const markSent = () => db.prepare(`UPDATE emails SET status = 'sent' WHERE id = ?`).run(id);
  const markFailed = (err: unknown) =>
    db
      .prepare(`UPDATE emails SET status = 'failed', error = ? WHERE id = ?`)
      .run(String(err instanceof Error ? err.message : err), id);

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
      }
      markSent();
      return { id, status: 'sent' };
    } catch (err) {
      markFailed(err);
      return { id, status: 'failed' };
    }
  }

  const host = process.env.SMTP_HOST;
  if (!host) return { id, status: 'outbox' };

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html });
    markSent();
    return { id, status: 'sent' };
  } catch (err) {
    markFailed(err);
    return { id, status: 'failed' };
  }
}
