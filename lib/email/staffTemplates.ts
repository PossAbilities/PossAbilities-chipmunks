import { site } from '@/content/site';
import { BRAND, esc, shell, infoCard } from './templates';

/**
 * A staff-facing campaign to promote the Chipmunks day camp internally —
 * distinct from the parent/booking transactional emails above. These are
 * broadcast emails (not tied to a specific booking), so callers supply the
 * booking page URL to link to. Reuses the same brand shell so the whole
 * email family looks and feels like one system.
 *
 * Suggested send order, a few weeks apart in the run-up to the summer:
 *   1. teaserEmail      — "save the date", build excitement early
 *   2. bookingOpenEmail — booking opens, full details + how to book
 *   3. fillingUpEmail   — mid-campaign nudge with social proof
 *   4. finalCallEmail   — last chance before the diary's full
 */

function ctaButton(label: string, url: string, colour = BRAND.pink): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;">
    <tr><td style="background-color:${colour};border-radius:999px;">
      <a href="${esc(url)}" style="display:inline-block;padding:15px 34px;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;">${esc(label)}</a>
    </td></tr>
  </table>`;
}

function dealChecklist(): string {
  const rows = site.theDeal
    .map(
      (d) => `<tr><td style="padding:5px 0;color:${BRAND.ink};font-size:14px;font-weight:700;">
        <span style="color:${BRAND.leaf};font-weight:800;">✓</span>&nbsp; ${esc(d)}
      </td></tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F6FBFB;border-radius:14px;margin:18px 0;padding:16px 20px;">${rows}</table>`;
}

function datesRibbon(): string {
  const weeks = [
    { label: 'Week 1', range: 'Mon 3 – Fri 7 August 2026' },
    { label: 'Week 2', range: 'Mon 10 – Fri 14 August 2026' },
  ];
  const cells = weeks
    .map(
      (w) => `<td width="50%" style="padding:14px 16px;background-color:${BRAND.purple};${w.label === 'Week 1' ? 'border-radius:14px 0 0 14px;' : 'border-radius:0 14px 14px 0;border-left:2px solid rgba(255,255,255,0.15);'}">
        <div style="color:${BRAND.sunshine};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">${esc(w.label)}</div>
        <div style="color:#ffffff;font-size:15px;font-weight:800;padding-top:2px;">${esc(w.range)}</div>
      </td>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;"><tr>${cells}</tr></table>`;
}

function activityStrip(keys: string[]): string {
  const chosen = site.activities.filter((a) => keys.includes(a.title));
  const cells = chosen
    .map(
      (a) => `<td width="${Math.floor(100 / chosen.length)}%" style="padding:14px 10px;text-align:center;vertical-align:top;">
        <div style="font-size:30px;line-height:1;">${a.emoji}</div>
        <div style="color:${BRAND.ink};font-size:13px;font-weight:800;padding-top:6px;">${esc(a.title)}</div>
      </td>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FCEFF6;border-radius:14px;margin:20px 0;"><tr>${cells}</tr></table>`;
}

export interface StaffCampaignOpts {
  bookingUrl: string; // link to /book on the live site, e.g. https://chipmunks.possabilities.org.uk/book
}

/** 1. Save-the-date teaser — sent weeks before booking opens, just to build buzz. */
export function teaserEmail(opts: StaffCampaignOpts): { subject: string; html: string } {
  const subject = `🐿️ ${site.clubName} is coming back this summer!`;
  const body = `
    <div style="color:${BRAND.ink};font-size:24px;font-weight:800;">Psst… ${esc(site.strapline)} 🌞</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      ${esc(site.clubName)} is back for another summer of animals, adventures and (very serious) bake-offs —
      and it's one of our favourite staff perks. If you've got children or grandchildren aged
      <strong style="color:${BRAND.ink};">${esc(site.session.ageRange)}</strong>, save the dates below.
    </p>

    ${datesRibbon()}

    ${infoCard(
      BRAND.pink,
      '💦 Don’t forget…',
      `Wednesday <strong>5 August</strong> is Water Fight Wednesday — pack spare clothes and a towel!`
    )}

    ${activityStrip(['Help look after our animals', 'The immersive room', 'Chipmunks bake-off'])}

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:18px 0 0;">
      <strong style="color:${BRAND.ink};">Booking isn't open just yet</strong> — we'll email you the moment it is,
      with everything you need to grab a place. Places are limited and go on a first come, first served basis,
      so keep an eye on your inbox!
    </p>
    ${ctaButton('Have a peek at the website →', opts.bookingUrl.replace(/\/book\/?$/, ''), BRAND.leaf)}

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:22px 0 0;">
      Questions in the meantime? Just reply to this email or call
      <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong>.<br>
      <strong style="color:${BRAND.ink};">The ${esc(site.clubName)} team</strong>
    </p>`;
  return { subject, html: shell(subject, `Save the date — two weeks of summer fun for staff families`, body, 'You’re receiving this because you’re a PossAbilities employee — forwarded to you by your HR or comms team.') };
}

/** 2. Booking-open — the main campaign email: full details + how to book. */
export function bookingOpenEmail(opts: StaffCampaignOpts): { subject: string; html: string } {
  const subject = `🎉 Booking is open for ${site.clubName} 2026!`;
  const body = `
    <div style="color:${BRAND.ink};font-size:24px;font-weight:800;">The wait is over — booking’s open! 🎉</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      ${esc(site.intro)}
    </p>

    ${datesRibbon()}

    <div style="color:${BRAND.ink};font-size:16px;font-weight:800;padding-top:20px;">The deal</div>
    ${dealChecklist()}

    ${activityStrip(['Help look after our animals', 'Treasure hunts', 'Games & competitions'])}

    <div style="color:${BRAND.ink};font-size:16px;font-weight:800;padding-top:6px;">How to book — 3 quick steps</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;">
      <tr><td style="padding:8px 0;">
        <span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;background-color:${BRAND.purple};color:#fff;border-radius:50%;font-size:13px;font-weight:800;">1</span>
        <span style="color:${BRAND.ink};font-size:14px;font-weight:700;padding-left:10px;">Head to the booking page and choose your day(s)</span>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;background-color:${BRAND.purple};color:#fff;border-radius:50%;font-size:13px;font-weight:800;">2</span>
        <span style="color:${BRAND.ink};font-size:14px;font-weight:700;padding-left:10px;">Add your child’s details, a photo, and who’s allowed to collect them</span>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;background-color:${BRAND.purple};color:#fff;border-radius:50%;font-size:13px;font-weight:800;">3</span>
        <span style="color:${BRAND.ink};font-size:14px;font-weight:700;padding-left:10px;">Sign the consent form and pay to confirm your place</span>
      </td></tr>
    </table>

    ${ctaButton('Book your place now →', opts.bookingUrl)}

    ${infoCard(
      BRAND.acorn,
      '👀 Good to know',
      `${esc(site.eligibility)} Places are limited and offered first come, first served — the sooner you book, the more days you'll get to choose from.`
    )}

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:18px 0 0;">
      Any questions at all, just reply to this email or call
      <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong>.<br>
      <strong style="color:${BRAND.ink};">The ${esc(site.clubName)} team</strong>
    </p>`;
  return { subject, html: shell(subject, `Book now — 2 weeks of summer camp, £${site.session.pricePerDay}/day`, body, 'You’re receiving this because you’re a PossAbilities employee — forwarded to you by your HR or comms team.') };
}

/** 3. Mid-campaign nudge — social proof + urgency, for staff who haven't booked yet. */
export function fillingUpEmail(opts: StaffCampaignOpts): { subject: string; html: string } {
  const subject = `⏰ ${site.clubName} spaces are going fast!`;
  const testimonial = site.testimonials[0];
  const body = `
    <div style="color:${BRAND.ink};font-size:24px;font-weight:800;">Don’t let the summer sneak up on you! ⏰</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      ${esc(site.clubName)} places are filling up fast for both weeks this August — if you haven't booked yet
      for your children or grandchildren, now's the time.
    </p>

    ${datesRibbon()}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr><td style="background-color:${BRAND.purple};border-radius:16px;padding:22px 26px;">
        <div style="color:${BRAND.sunshine};font-size:28px;line-height:1;">“</div>
        <div style="color:#ffffff;font-size:15px;font-style:italic;line-height:1.7;">${esc(testimonial.quote)}</div>
        <div style="color:#B9B4D8;font-size:13px;font-weight:700;padding-top:10px;">— ${esc(testimonial.name)}</div>
      </td></tr>
    </table>

    ${infoCard(
      BRAND.pink,
      '💷 The deal, in short',
      `£${site.session.pricePerDay} per day (lunch included) · ${esc(site.session.ageRange)} · drop off ${esc(site.session.dropOffFrom)}, pick up ${esc(site.session.endTime)} · ${esc(site.eligibility)}`
    )}

    ${ctaButton('Grab your place before it’s gone →', opts.bookingUrl)}

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:22px 0 0;">
      Questions? Reply to this email or call <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong>.<br>
      <strong style="color:${BRAND.ink};">The ${esc(site.clubName)} team</strong>
    </p>`;
  return { subject, html: shell(subject, `Places are filling up for both weeks this August`, body, 'You’re receiving this because you’re a PossAbilities employee — forwarded to you by your HR or comms team.') };
}

/** 4. Final call — sent a few days before booking effectively closes. */
export function finalCallEmail(opts: StaffCampaignOpts): { subject: string; html: string } {
  const subject = `🚨 Last call for ${site.clubName} — book before it's too late!`;
  const body = `
    <div style="color:${BRAND.ink};font-size:24px;font-weight:800;">This is it — last call! 🚨</div>
    <p style="color:#5B5675;font-size:15px;line-height:1.7;margin:14px 0 0;">
      We're down to the wire — if you've been meaning to book your children or grandchildren onto
      ${esc(site.clubName)} this summer, this is your reminder before the diary fills up completely.
    </p>

    ${datesRibbon()}
    ${dealChecklist()}

    ${ctaButton('Book now — before it’s full →', opts.bookingUrl)}

    <p style="color:#5B5675;font-size:14px;line-height:1.7;margin:22px 0 0;">
      Stuck, or booking on someone else's behalf? Just reply to this email or call
      <strong style="color:${BRAND.ink};">${esc(site.contact.phone)}</strong> and we'll sort it together.<br>
      <strong style="color:${BRAND.ink};">The ${esc(site.clubName)} team</strong>
    </p>`;
  return { subject, html: shell(subject, `Last chance to book — the diary's nearly full`, body, 'You’re receiving this because you’re a PossAbilities employee — forwarded to you by your HR or comms team.') };
}
