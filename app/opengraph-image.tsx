import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

// Social share card (og:image / twitter:image) — generated once at build time.
export const alt = `${site.clubName} — ${site.strapline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const mascot = await readFile(join(process.cwd(), 'public/mascots/orla-wave-email.png'));
  const mascotSrc = `data:image/png;base64,${mascot.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: '#F4FAFA',
          borderBottom: '24px solid #E43092',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 720 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#4BC1B9', marginBottom: 16 }}>
            {site.orgName}
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, color: '#362B74', lineHeight: 1.05 }}>
            {site.clubName}
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: '#E43092', marginTop: 24 }}>
            {site.strapline}
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#251D52', marginTop: 24 }}>
            Day camp at {site.venue.name}, {site.venue.addressLines[site.venue.addressLines.length - 1]}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mascotSrc} width={280} height={441} alt="" style={{ objectFit: 'contain' }} />
      </div>
    ),
    size,
  );
}
