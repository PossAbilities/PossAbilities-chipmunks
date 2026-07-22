import { NextRequest, NextResponse } from 'next/server';
import { requestRole, canAccess } from '@/lib/auth';
import { teaserEmail, bookingOpenEmail, fillingUpEmail, finalCallEmail } from '@/lib/email/staffTemplates';
import { publicOrigin } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

const CAMPAIGN = {
  teaser: teaserEmail,
  'booking-open': bookingOpenEmail,
  'filling-up': fillingUpEmail,
  'final-call': finalCallEmail,
} as const;

type CampaignKey = keyof typeof CAMPAIGN;

/**
 * Admin: preview a staff campaign email — either the raw HTML (default, so
 * it can be viewed or copied straight into an email tool) or JSON with the
 * subject line too (?format=json).
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  if (!canAccess(requestRole(req), 'admin')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { key } = await ctx.params;
  const build = CAMPAIGN[key as CampaignKey];
  if (!build) return NextResponse.json({ error: 'Unknown campaign email' }, { status: 404 });

  const bookingUrl = `${publicOrigin(req)}/book`;
  const { subject, html } = build({ bookingUrl });

  if (req.nextUrl.searchParams.get('format') === 'json') {
    return NextResponse.json({ subject, html });
  }
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
