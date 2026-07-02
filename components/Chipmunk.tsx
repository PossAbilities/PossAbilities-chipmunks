/** Friendly chipmunk mascot, drawn to match the brand palette. */
export default function Chipmunk({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" role="img">
      {/* tail */}
      <g className="origin-bottom-left animate-tail-swish">
        <path
          d="M150 130c30-8 42-42 28-68-4-8-14-6-15 3-2 20-12 34-30 42z"
          fill="rgb(var(--acorn))"
          opacity="0.9"
        />
        <path
          d="M152 122c20-8 28-30 22-48"
          stroke="rgb(var(--cream))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </g>
      {/* body */}
      <ellipse cx="95" cy="130" rx="52" ry="46" fill="rgb(var(--acorn))" />
      {/* belly stripe */}
      <ellipse cx="95" cy="140" rx="30" ry="32" fill="rgb(var(--cream))" />
      <path d="M60 108c0-20 14-34 35-34s35 14 35 34" stroke="rgb(var(--ink))" strokeWidth="0" fill="none" />
      {/* back stripes */}
      <path d="M52 118c-2 12 0 24 6 34" stroke="rgb(var(--brand-deep))" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M138 118c2 12 0 24-6 34" stroke="rgb(var(--brand-deep))" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* head */}
      <circle cx="95" cy="72" r="38" fill="rgb(var(--acorn))" />
      {/* ears */}
      <circle cx="66" cy="42" r="13" fill="rgb(var(--acorn))" />
      <circle cx="124" cy="42" r="13" fill="rgb(var(--acorn))" />
      <circle cx="66" cy="43" r="6.5" fill="rgb(var(--cream))" />
      <circle cx="124" cy="43" r="6.5" fill="rgb(var(--cream))" />
      {/* cheeks */}
      <circle cx="72" cy="84" r="13" fill="rgb(var(--cream))" />
      <circle cx="118" cy="84" r="13" fill="rgb(var(--cream))" />
      {/* eyes */}
      <circle cx="82" cy="66" r="6" fill="rgb(var(--ink))" />
      <circle cx="108" cy="66" r="6" fill="rgb(var(--ink))" />
      <circle cx="84" cy="64" r="2" fill="#fff" />
      <circle cx="110" cy="64" r="2" fill="#fff" />
      {/* nose + mouth */}
      <ellipse cx="95" cy="80" rx="5" ry="4" fill="rgb(var(--ink))" />
      <path d="M95 84c0 6-6 8-10 6M95 84c0 6 6 8 10 6" stroke="rgb(var(--ink))" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* buck teeth */}
      <rect x="90" y="90" width="5" height="7" rx="1.5" fill="#fff" />
      <rect x="95.5" y="90" width="5" height="7" rx="1.5" fill="#fff" />
      {/* arms holding acorn */}
      <circle cx="95" cy="132" r="11" fill="rgb(var(--sunshine))" />
      <path d="M89 124c1-4 11-4 12 0" stroke="rgb(var(--brand-deep))" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M72 120c6 8 14 12 23 12M118 120c-6 8-14 12-23 12" stroke="rgb(var(--acorn))" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* feet */}
      <ellipse cx="72" cy="172" rx="12" ry="7" fill="rgb(var(--acorn))" />
      <ellipse cx="118" cy="172" rx="12" ry="7" fill="rgb(var(--acorn))" />
    </svg>
  );
}
