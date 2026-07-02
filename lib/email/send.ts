import nodemailer from 'nodemailer';
import { getDb } from '@/lib/db';

/**
 * Sends an email via SMTP when configured, and always records a copy in
 * the `emails` table so the Admin area can preview exactly what families
 * received. Without SMTP config the email stays in the outbox with
 * status 'outbox' — perfect for local development and demos.
 *
 * SMTP env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  kind: 'confirmation' | 'reminder' | 'cancellation' | 'payment' | 'receipt';
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
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"The Chipmunks at PossAbilities" <no-reply@possabilities.org.uk>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    db.prepare(`UPDATE emails SET status = 'sent' WHERE id = ?`).run(id);
    return { id, status: 'sent' };
  } catch (err) {
    db.prepare(`UPDATE emails SET status = 'failed', error = ? WHERE id = ?`).run(
      String(err instanceof Error ? err.message : err),
      id
    );
    return { id, status: 'failed' };
  }
}
