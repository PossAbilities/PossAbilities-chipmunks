import fs from 'node:fs';
import path from 'node:path';
import Chipmunk from '@/components/Chipmunk';

/**
 * Layered, animated club mascots.
 *
 * Each character is two transparent PNGs in public/mascots/, exported
 * from the SAME canvas so they overlay 1:1:
 *   <name>-body.png — the character without the waving arm
 *   <name>-arm.png  — just the waving arm, same canvas/crop
 * The arm layer is stacked on the body and waves around an elbow pivot
 * (CSS only, honours prefers-reduced-motion).
 *
 * pivotX/pivotY: the elbow position as percentages of the image box —
 * tune per character until the wave hinges naturally.
 */
const CHARACTERS = {
  orla: {
    alt: 'Orla, the Chipmunks mascot, waving hello',
    pivotX: '65%',
    pivotY: '50.4%',
  },
  // Two more characters incoming — drop their PNGs in public/mascots/
  // and register them here.
} as const;

export type MascotName = keyof typeof CHARACTERS;

export default function Mascot({
  name = 'orla',
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
        className="mascot-arm absolute inset-0 z-20 w-full h-auto"
        style={{ transformOrigin: `${c.pivotX} ${c.pivotY}` }}
      />
    </div>
  );
}
