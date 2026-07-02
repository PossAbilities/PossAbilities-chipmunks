/**
 * PossAbilities brand marks, recreated from Brand Manual 1.1:
 * a pink diagonal bar crossed by a teal circle (the overlap reads plum),
 * with the "Poss"(pink)+"Abilities"(indigo) wordmark.
 */

export function PossMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      {/* pink diagonal bar */}
      <rect x="30" y="4" width="24" height="104" rx="2" fill="#E43092" transform="rotate(14 42 56)" />
      {/* teal circle */}
      <circle cx="62" cy="38" r="30" fill="#4BC1B9" />
      {/* plum overlap: clip the rotated bar to the circle */}
      <g clipPath="url(#pa-circle)">
        <rect x="30" y="4" width="24" height="104" rx="2" fill="#7B3179" transform="rotate(14 42 56)" />
      </g>
      <defs>
        <clipPath id="pa-circle">
          <circle cx="62" cy="38" r="30" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function PossWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span className="text-pink">Poss</span>
      <span className="text-indigo">Abilities</span>
    </span>
  );
}

/** Chipmunks club lockup used in headers. */
export function ChipmunksLockup({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <PossMark className="h-10 w-auto shrink-0" />
      <span className="leading-none">
        <span className={`block font-display font-bold text-xl ${light ? 'text-white' : 'text-indigo'}`}>
          Cherwell Chipmunks
        </span>
        <span className="block text-[11px] font-body font-bold tracking-wide">
          <span className={light ? 'text-white/60' : 'text-ink/50'}>at </span>
          <span className="text-pink">Poss</span>
          <span className={light ? 'text-white' : 'text-indigo'}>Abilities</span>
        </span>
      </span>
    </span>
  );
}
