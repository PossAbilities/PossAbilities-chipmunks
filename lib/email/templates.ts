import { site } from '@/content/site';
import { formatDateLong } from '@/lib/db';

/**
 * Designed HTML emails — table-based with inline styles so they render
 * correctly in Outlook, Gmail, Apple Mail etc. Colours mirror the site's
 * brand tokens; update BRAND below alongside app/globals.css when the
 * official guidelines arrive.
 */
/** PossAbilities Brand Manual 1.1 palette — mirrors app/globals.css */
const BRAND = {
  purple: '#362B74', // brand indigo (headers, headings)
  purpleDeep: '#251D52',
  pink: '#E43092',
  acorn: '#7B3179', // plum accent
  leaf: '#4BC1B9', // brand teal
  sunshine: '#4BC1B9',
  cream: '#F4FAFA', // pale duck-egg page background
  duck: '#D6EEEE',
  ink: '#2B2453',
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shell(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.cream};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background-color:${BRAND.purple};border-radius:24px 24px 0 0;padding:32px 40px;text-align:center;">
    <div style="font-size:44px;line-height:1;">🐿️</div>
    <div style="color:#ffffff;font-size:28px;font-weight:800;letter-spacing:0.5px;padding-top:8px;">Cherwell Chipmunks</div>
    <div style="font-size:15px;font-weight:700;padding-top:4px;">
      <span style="color:#B9B4D8;">at </span><span style="color:${BRAND.pink};">Poss</span><span style="color:#ffffff;">Abilities</span>
    </div>
  </td></tr>

  <!-- Teal + pink brand stripes -->
  <tr><td style="background-color:${BRAND.leaf};height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="background-color:${BRAND.pink};height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- Body -->
  <tr><td style="background-color:#ffffff;padding:36px 40px;">
    ${body}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background-color:${BRAND.ink};border-radius:0 0 24px 24px;padding:28px 40px;text-align:center;">
    <div style="color:${BRAND.leaf};font-size:14px;font-weight:700;font-style:italic;padding-bottom:10px;">“${esc(site.tagline)}”</div>
    <div style="color:#ffffff;font-size:15px;font-weight:700;">${esc(site.orgName)} · ${esc(site.venue.name)}</div>
    <div style="color:#B9B4CE;font-size:13px;padding-top:6px;line-height:1.6;">
      ${esc(site.venue.addressLines.join(', '))}<br>
      <a href="mailto:${esc(site.contact.email)}" style="color:${BRAND.sunshine};text-decoration:none;">${esc(site.contact.email)}</a>
      &nbsp;·&nbsp; ${esc(site.contact.phone)}
    </div>
    <div style="color:#8F89A8;font-size:12px;padding-top:12px;">You’re receiving this email because you booked a place at the Cherwell Chipmunks Day Camp.</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function daysTable(days: { date: string; note?: string }[]): string {
  const rows = days
    .map(
      (d, i) => `<tr>
      <td style="padding:10px 16px;border-top:${i === 0 ? 'none' : `1px solid #D6EEEE`};">
        <span style="display:inline-block;background-color:${BRAND.purple};color:#fff;border-radius:999px;font-size:12px;font-weight:700;padding:3px 10px;margin-right:10px;">Day ${i + 1}</span>
        <span style="color:${BRAND.ink};font-size:15px;font-weight:700;">${esc(formatDateLong(d.date))}</span>
        ${d.note ? `<div style="color:${BRAND.acorn};font-size:13px;font-weight:700;padding:4px 0 0 2px;">💦 ${esc(d.note)}</div>` : ''}
      </td></tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E9F6F6;border-radius:16px;margin:18px 0;">${rows}</table>`;
}

function infoCard(colour: string, title: string, inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
  <tr><td style="border-left:5px solid ${colour};background-color:#F6FBFB;border-radius:12px;padding:16px 20px;">
    <div style="color:${BRAND.ink};font-size:15px;font-weight:800;padding-bottom:6px;">${title}</div>
    <div style="color:#5B5675;font-size:14px;line-height:1.7;">${inner}</div>
  </td></tr></table>`;
}

export interface BookingEmailData {
  ref: string;
  childFirst: string;
  parentName: string;
  days: { date: string; note?: string }[]; // ISO dates + optional day note
}

export function confirmationEmail(b: BookingEmailData): { subject: string; html: string } {
  const subject = `🐿️ ${b.childFirst} is booked in at Cherwell Chipmunks — ${b.ref}`;
  const body = `
    <div style="color:${BRAND.ink};font-size:22px;font-weight:800;">Hooray, ${esc(b.parentName)}! 🎉</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      <strong style="color:${BRAND.ink};">${esc(b.childFirst)}</strong> has a place at the Cherwell Chipmunks Day Camp.
      We can’t wait to meet them — the animals are already excited.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;">
      <tr><td style="background-color:${BRAND.sunshine};border-radius:12px;padding:10px 18px;">
        <span style="color:${BRAND.ink};font-size:13px;font-weight:700;">Booking reference</span>
        <span style="color:${BRAND.ink};font-size:18px;font-weight:800;padding-left:10px;letter-spacing:1px;">${esc(b.ref)}</span>
      </td></tr>
    </table>

    <div style="color:${BRAND.ink};font-size:16px;font-weight:800;padding-top:18px;">${esc(b.childFirst)}’s day${b.days.length > 1 ? 's' : ''} with us</div>
    ${daysTable(b.days)}

    ${infoCard(
      BRAND.pink,
      '💷 Payment',
      `The camp costs <strong>£${site.session.pricePerDay} per day (lunch included)</strong> — a total of <strong>£${site.session.pricePerDay * b.days.length}</strong> for this booking. Payment is in advance, and we’re unable to offer refunds for cancellations. Keep an eye out for our payment email with all the ways to pay.`
    )}
    ${infoCard(
      BRAND.leaf,
      '🎒 What to bring',
      `${site.whatToBring.map(esc).join(' &nbsp;·&nbsp; ')}<br><em>Lunch is included — no packed lunch needed!</em>`
    )}
    ${infoCard(
      BRAND.acorn,
      '🕘 Drop-off & pick-up',
      `Drop off from <strong>${esc(site.session.dropOffFrom)}</strong> and pick up at <strong>${esc(site.session.endTime)}</strong>. An Activity Champion will check ${esc(b.childFirst)} in when you arrive.`
    )}

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:18px 0 0;">
      Need to change anything — dates, contact details, medical information? Just reply to this
      email or call us on <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong> and quote your booking reference.
    </p>

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:14px 0 0;">
      See you soon!<br><strong style="color:${BRAND.ink};">The Chipmunks team at ${esc(site.orgName)}</strong>
    </p>`;
  return { subject, html: shell(subject, `${b.childFirst} is booked in — reference ${b.ref}`, body) };
}

export function reminderEmail(b: BookingEmailData & { date: string; note?: string }): { subject: string; html: string } {
  const subject = `⏰ See you tomorrow, ${b.childFirst}! Cherwell Chipmunks — ${formatDateLong(b.date)}`;
  const body = `
    <div style="color:${BRAND.ink};font-size:22px;font-weight:800;">Tomorrow’s the big day! 🐿️</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      Hi ${esc(b.parentName)} — just a friendly nudge that <strong style="color:${BRAND.ink};">${esc(b.childFirst)}</strong>
      is booked in at Cherwell Chipmunks <strong style="color:${BRAND.ink};">tomorrow, ${esc(formatDateLong(b.date))}</strong>.
    </p>

    ${b.note ? infoCard(BRAND.pink, '💦 Special note for tomorrow', esc(b.note)) : ''}
    ${infoCard(
      BRAND.acorn,
      '🕘 The plan',
      `Drop-off from <strong>${esc(site.session.dropOffFrom)}</strong> at ${esc(site.venue.name)}, ${esc(site.venue.addressLines.join(', '))}. Pick-up at <strong>${esc(site.session.endTime)}</strong>. Lunch is included.`
    )}
    ${infoCard(
      BRAND.leaf,
      '🎒 Don’t forget',
      site.whatToBring.map(esc).join(' &nbsp;·&nbsp; ')
    )}

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:18px 0 0;">
      Can’t make it any more? No problem — reply to this email or call
      <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong> so we can offer the place to another family.
      Your booking reference is <strong style="color:${BRAND.ink};">${esc(b.ref)}</strong>.
    </p>

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:14px 0 0;">
      See you tomorrow!<br><strong style="color:${BRAND.ink};">The Chipmunks team at ${esc(site.orgName)}</strong>
    </p>`;
  return { subject, html: shell(subject, `Reminder: ${b.childFirst} is with us tomorrow`, body) };
}

/** Branded "ways to pay" email — sent by the admin team from the Admin area. */
export function paymentEmail(b: BookingEmailData): { subject: string; html: string } {
  const total = site.session.pricePerDay * b.days.length;
  const subject = `💷 How to pay for ${b.childFirst}’s Chipmunks booking — ${b.ref}`;
  const methods = site.paymentMethods
    .map((m) => infoCard(BRAND.leaf, esc(m.title), esc(m.detail)))
    .join('');
  const body = `
    <div style="color:${BRAND.ink};font-size:22px;font-weight:800;">Time to bag ${esc(b.childFirst)}’s place! 🌰</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      Hi ${esc(b.parentName)} — here’s everything you need to pay for booking
      <strong style="color:${BRAND.ink};">${esc(b.ref)}</strong>.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;">
      <tr><td style="background-color:${BRAND.pink};border-radius:12px;padding:12px 20px;">
        <span style="color:#ffffff;font-size:13px;font-weight:700;">Amount due</span>
        <span style="color:#ffffff;font-size:20px;font-weight:800;padding-left:12px;">£${total}</span>
        <span style="color:#FBD5EA;font-size:13px;font-weight:700;padding-left:10px;">(${b.days.length} day${b.days.length === 1 ? '' : 's'} × £${site.session.pricePerDay}, lunch included)</span>
      </td></tr>
    </table>

    <div style="color:${BRAND.ink};font-size:16px;font-weight:800;padding-top:16px;">Ways to pay</div>
    ${methods}

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:18px 0 0;">
      <strong style="color:${BRAND.ink};">Please quote your booking reference ${esc(b.ref)} when paying.</strong>
      Payment is in advance and secures ${esc(b.childFirst)}’s place — places are limited and offered first come,
      first served. We’re unable to offer refunds for cancellations.
    </p>

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:14px 0 0;">
      Any questions, just reply to this email or call <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong>.<br>
      <strong style="color:${BRAND.ink};">The Chipmunks team at ${esc(site.orgName)}</strong>
    </p>`;
  return { subject, html: shell(subject, `£${total} due for booking ${b.ref} — ways to pay inside`, body) };
}

/** Sent (optionally) when the admin team marks a booking as paid. */
export function receiptEmail(
  b: BookingEmailData & { paymentMethod?: string; paymentDate?: string }
): { subject: string; html: string } {
  const subject = `✅ Payment received — ${b.childFirst} is all set for Chipmunks! ${b.ref}`;
  const body = `
    <div style="color:${BRAND.ink};font-size:22px;font-weight:800;">All paid — thank you! 🎉</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      Hi ${esc(b.parentName)} — we’ve received your payment for booking
      <strong style="color:${BRAND.ink};">${esc(b.ref)}</strong> and
      <strong style="color:${BRAND.ink};">${esc(b.childFirst)}</strong>’s place is fully secured.
      All that’s left is the fun bit.
    </p>
    ${
      b.paymentMethod
        ? infoCard(
            BRAND.leaf,
            '💷 Payment recorded',
            `Paid via <strong>${esc(b.paymentMethod)}</strong>${b.paymentDate ? ` on <strong>${esc(b.paymentDate)}</strong>` : ''}.`
          )
        : ''
    }
    <div style="color:${BRAND.ink};font-size:16px;font-weight:800;padding-top:18px;">${esc(b.childFirst)}’s day${b.days.length > 1 ? 's' : ''} with us</div>
    ${daysTable(b.days)}
    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:14px 0 0;">
      We’ll send a reminder the day before each visit. See you soon!<br>
      <strong style="color:${BRAND.ink};">The Chipmunks team at ${esc(site.orgName)}</strong>
    </p>`;
  return { subject, html: shell(subject, `Payment received for ${b.ref} — see you soon!`, body) };
}

/** Sent the moment an Activity Champion checks a child in. */
export function checkinEmail(b: {
  childFirst: string;
  parentName: string;
  time: string;
  checkedInBy: string;
}): { subject: string; html: string } {
  const subject = `✅ ${b.childFirst} has arrived safely at Chipmunks`;
  const body = `
    <div style="color:${BRAND.ink};font-size:22px;font-weight:800;">Safely checked in! ✅</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      Hi ${esc(b.parentName)} — just a quick note that <strong style="color:${BRAND.ink};">${esc(b.childFirst)}</strong>
      has arrived at Cherwell Chipmunks and been checked in.
    </p>
    ${infoCard(
      BRAND.leaf,
      '🕘 Check-in details',
      `Checked in at <strong>${esc(b.time)}</strong> by <strong>${esc(b.checkedInBy)}</strong>.`
    )}
    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:18px 0 0;">
      Have a lovely day — see you at pick-up!<br>
      <strong style="color:${BRAND.ink};">The Chipmunks team at ${esc(site.orgName)}</strong>
    </p>`;
  return { subject, html: shell(subject, `${b.childFirst} checked in at ${b.time}`, body) };
}

/** Sent the moment an Activity Champion checks a child out at pick-up. */
export function checkoutEmail(b: {
  childFirst: string;
  parentName: string;
  time: string;
  collectedBy: string;
}): { subject: string; html: string } {
  const subject = `🏠 ${b.childFirst} has gone home from Chipmunks`;
  const body = `
    <div style="color:${BRAND.ink};font-size:22px;font-weight:800;">Home time! 🏠</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      Hi ${esc(b.parentName)} — <strong style="color:${BRAND.ink};">${esc(b.childFirst)}</strong> has left
      Cherwell Chipmunks for the day.
    </p>
    ${infoCard(
      BRAND.pink,
      '🕘 Collection details',
      `Collected at <strong>${esc(b.time)}</strong> by <strong>${esc(b.collectedBy)}</strong>.`
    )}
    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:18px 0 0;">
      If this doesn’t look right, please call us straight away on
      <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong>.
    </p>
    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:14px 0 0;">
      <strong style="color:${BRAND.ink};">The Chipmunks team at ${esc(site.orgName)}</strong>
    </p>`;
  return {
    subject,
    html: shell(subject, `${b.childFirst} collected at ${b.time} by ${b.collectedBy}`, body),
  };
}

export function cancellationEmail(b: BookingEmailData): { subject: string; html: string } {
  const subject = `Your Chipmunks booking ${b.ref} has been cancelled`;
  const body = `
    <div style="color:${BRAND.ink};font-size:22px;font-weight:800;">Booking cancelled</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      Hi ${esc(b.parentName)} — this confirms that booking <strong style="color:${BRAND.ink};">${esc(b.ref)}</strong>
      for <strong style="color:${BRAND.ink};">${esc(b.childFirst)}</strong> has been cancelled. If this doesn’t look right,
      call us on <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong> and we’ll sort it straight away.
    </p>
    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:14px 0 0;">
      We’d love to see ${esc(b.childFirst)} another day — you can book again any time at our website.<br>
      <strong style="color:${BRAND.ink};">The Chipmunks team at ${esc(site.orgName)}</strong>
    </p>`;
  return { subject, html: shell(subject, `Booking ${b.ref} cancelled`, body) };
}
