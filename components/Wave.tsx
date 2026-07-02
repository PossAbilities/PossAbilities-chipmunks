/**
 * The PossAbilities signature double wave (teal crest over indigo swell),
 * traced from the brand manual's page furniture.
 *
 * Renders as a full-width divider. `flip` mirrors it vertically for use
 * at the top of a section; `drift` adds a gentle side-to-side motion.
 */
export default function Wave({
  flip = false,
  drift = false,
  className = '',
  teal = '#4BC1B9',
  indigo = '#362B74',
}: {
  flip?: boolean;
  drift?: boolean;
  className?: string;
  teal?: string;
  indigo?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''} ${className}`}
    >
      <svg
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className={`block h-full w-[110%] -ml-[5%] ${drift ? 'animate-wave-drift' : ''}`}
      >
        {/* teal crest sits slightly higher */}
        <path
          d="M0,68 C170,10 340,2 520,26 C740,56 900,98 1120,88 C1260,80 1370,52 1440,20 L1440,110 L0,110 Z"
          fill={teal}
        />
        {/* indigo swell in front */}
        <path
          d="M0,86 C200,34 380,24 560,44 C780,70 940,108 1150,100 C1280,94 1380,74 1440,52 L1440,110 L0,110 Z"
          fill={indigo}
        />
      </svg>
    </div>
  );
}
