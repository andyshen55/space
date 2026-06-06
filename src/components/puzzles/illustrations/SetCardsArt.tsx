// Hero motif for the "Abstract Algebra for SET" course: three overplayed SET
// cards, each with a different shape/shading, hinting that a SET is three cards
// that agree-or-differ on every attribute. Theme-aware via `currentColor`.
export function SetCardsArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* three fanned cards */}
      <g transform="rotate(-12 30 55)">
        <rect x="18" y="34" width="26" height="42" rx="4" className="fill-background" />
        {/* solid diamond */}
        <path d="M31 47 L38 53 L31 59 L24 53 Z" fill="currentColor" />
      </g>
      <g>
        <rect x="37" y="29" width="26" height="42" rx="4" className="fill-background" />
        {/* open oval */}
        <rect x="44" y="42" width="12" height="16" rx="6" />
      </g>
      <g transform="rotate(12 70 55)">
        <rect x="56" y="34" width="26" height="42" rx="4" className="fill-background" />
        {/* striped triangle/squiggle stand-in */}
        <path d="M69 45 L75 58 L63 58 Z" />
        <line x1="65.5" y1="55" x2="72.5" y2="55" strokeWidth={1.4} />
        <line x1="67" y1="52" x2="71" y2="52" strokeWidth={1.4} />
      </g>
    </svg>
  );
}
