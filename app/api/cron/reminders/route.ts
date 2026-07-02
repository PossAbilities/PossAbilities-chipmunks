import { NextRequest, NextResponse } from 'next/server';
import { sendDueReminders } from '@/lib/email/reminders';
import { requestRole, canAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Trigger reminder emails. Call daily from a scheduler:
 *   curl -X POST -H "x-cron-secret: $CRON_SECRET" https://your-site/api/cron/reminders
 * Also callable from the Admin area (admin cookie).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorised =
    (secret && req.headers.get('x-cron-secret') === secret) ||
    canAccess(requestRole(req), 'admin');
  if (!authorised) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const result = await sendDueReminders();
  return NextResponse.json(result);
}
