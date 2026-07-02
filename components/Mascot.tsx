import fs from 'node:fs';
import path from 'node:path';
import Chipmunk from '@/components/Chipmunk';

/**
 * Layered, animated club mascots.
 *
 * Each character is two transparent PNGs in public/mascots/:
 *   <name>-body.png  — the character with the waving arm REMOVED
 *   <name>-arm.png   — just the arm, cropped tight, elbow at bottom-left
 * The arm is pinned at the shoulder and waves on a loop (CSS only).
 *
 * Until the artwork files exist, we fall back to the built-in drawn
 * chipmunk so the site never shows a broken image.
 *
 * Tuning knobs per character (percentages of body width/height):
 *   armWidth — arm image width relative to body width
 *   armRight/armTop — where the elbow pivot sits on the body
 */
const CHARACTERS = {
  chip: {
    alt: 'Chip, the Chipmunks mascot, waving hello',
    armWidth: 36,
    armRight: -14,
    armTop: 28,
  },
  // Two more characters incoming — add them here:
  // dale: { alt: '…', armWidth: 36, armRight: -14, armTop: 28 },
} as const;

export type MascotName = keyof typeof CHARACTERS;

export default function Mascot({
  name = 'chip',
  className = '',
}: {
  name?: MascotName;
  className?: string;
}) {
  const c = CHARACTERS[name];
  const dir = path.join(process.cwd(), 'public', 'mascots');
  const hasArt =
    fs.existsSync(path.join(dir, `${name}-body.png`)) &&
    fs.existsSync(path.join(dir, `${name}-arm.png`));

  if (!hasArt) {
    // Artwork not supplied yet — use the drawn stand-in
    return <Chipmunk className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/mascots/${name}-body.png`} alt={c.alt} className="relative z-10 w-full h-auto" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/mascots/${name}-arm.png`}
        alt=""
        aria-hidden
        className="mascot-arm absolute z-20"
        style={{
          width: `${c.armWidth}%`,
          right: `${c.armRight}%`,
          top: `${c.armTop}%`,
        }}
      />
    </div>
  );
}
