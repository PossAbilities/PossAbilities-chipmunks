'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { site } from '@/content/site';

/**
 * A contact-email link that never exposes a literal address or `mailto:` in the
 * server-rendered HTML.
 *
 * Cloudflare's "Email Address Obfuscation" (Scrape Shield) rewrites any email
 * address it finds in origin HTML into a `/cdn-cgi/l/email-protection#…` link
 * that relies on a Cloudflare decoder script. On this site's custom-hostname
 * routing that decoder path returns 404, so every obfuscated email link is dead
 * (flagged by the broken-link monitor).
 *
 * Building the href on the client after hydration means Cloudflare never sees an
 * address to rewrite: the real `mailto:` link works for visitors, and crawlers /
 * monitors only ever see a harmless same-page `#` placeholder — no broken link.
 */
export default function ContactEmail({
  className,
  children = 'Email us',
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [href, setHref] = useState('#');

  useEffect(() => {
    setHref('mailto:' + site.contact.email);
  }, []);

  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}
