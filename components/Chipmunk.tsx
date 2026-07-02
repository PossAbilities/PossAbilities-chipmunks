/** Friendly chipmunk mascot — warm fur, PossAbilities-pink cheeks & details. */
const FUR = '#C97038';
const FUR_DEEP = '#9C4F22';
const CREAM = '#FFF4E6';
const INK = '#362B74';
const PINK = '#E43092';
const TEAL = '#4BC1B9';

export default function Chipmunk({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" role="img">
      {/* tail */}
      <g className="origin-bottom-left animate-tail-swish">
        <path d="M150 130c30-8 42-42 28-68-4-8-14-6-15 3-2 20-12 34-30 42z" fill={FUR} opacity="0.95" />
        <path d="M152 122c20-8 28-30 22-48" stroke={CREAM} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.5" />
      </g>
      {/* body */}
      <ellipse cx="95" cy="130" rx="52" ry="46" fill={FUR} />
      {/* belly */}
      <ellipse cx="95" cy="140" rx="30" ry="32" fill={CREAM} />
      {/* back stripes */}
      <path d="M52 118c-2 12 0 24 6 34" stroke={FUR_DEEP} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M138 118c2 12 0 24-6 34" stroke={FUR_DEEP} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* head */}
      <circle cx="95" cy="72" r="38" fill={FUR} />
      {/* ears */}
      <circle cx="66" cy="42" r="13" fill={FUR} />
      <circle cx="124" cy="42" r="13" fill={FUR} />
      <circle cx="66" cy="43" r="6.5" fill={PINK} opacity="0.8" />
      <circle cx="124" cy="43" r="6.5" fill={PINK} opacity="0.8" />
      {/* cheeks */}
      <circle cx="72" cy="84" r="13" fill={CREAM} />
      <circle cx="118" cy="84" r="13" fill={CREAM} />
      <circle cx="67" cy="88" r="5" fill={PINK} opacity="0.4" />
      <circle cx="123" cy="88" r="5" fill={PINK} opacity="0.4" />
      {/* eyes */}
      <circle cx="82" cy="66" r="6" fill={INK} />
      <circle cx="108" cy="66" r="6" fill={INK} />
      <circle cx="84" cy="64" r="2" fill="#fff" />
      <circle cx="110" cy="64" r="2" fill="#fff" />
      {/* nose + mouth */}
      <ellipse cx="95" cy="80" rx="5" ry="4" fill={INK} />
      <path d="M95 84c0 6-6 8-10 6M95 84c0 6 6 8 10 6" stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* buck teeth */}
      <rect x="90" y="90" width="5" height="7" rx="1.5" fill="#fff" />
      <rect x="95.5" y="90" width="5" height="7" rx="1.5" fill="#fff" />
      {/* held acorn — teal cap for a PossAbilities touch */}
      <circle cx="95" cy="132" r="11" fill={CREAM} />
      <circle cx="95" cy="133" r="9" fill="#E8A657" />
      <path d="M86 128c2-5 16-5 18 0z" fill={TEAL} />
      {/* arms */}
      <path d="M72 120c6 8 14 12 23 12M118 120c-6 8-14 12-23 12" stroke={FUR} strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* feet */}
      <ellipse cx="72" cy="172" rx="12" ry="7" fill={FUR} />
      <ellipse cx="118" cy="172" rx="12" ry="7" fill={FUR} />
    </svg>
  );
}
