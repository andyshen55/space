// Inline, theme-aware tile art for the grazing-goat puzzle: a stake, a dashed
// grazing circle, a rope, and a simple goat. Uses `currentColor`.
export function GoatArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* grazing area */}
      <circle cx={48} cy={54} r={37} strokeDasharray="4 5" />

      {/* stake at the centre */}
      <path d="M44 54 L52 54 L48 62 Z" fill="currentColor" stroke="none" />
      <line x1={48} y1={50} x2={48} y2={54} />

      {/* rope to the goat */}
      <line x1={48} y1={54} x2={60} y2={52} strokeDasharray="2 3" />

      {/* goat: body, head, horns, legs */}
      <rect x={58} y={44} width={20} height={11} rx={5} fill="currentColor" fillOpacity={0.12} />
      <circle cx={81} cy={45} r={4.5} fill="currentColor" fillOpacity={0.12} />
      <path d="M79 41 Q81 35 84 38" />
      <line x1={61} y1={55} x2={61} y2={64} />
      <line x1={67} y1={55} x2={67} y2={64} />
      <line x1={73} y1={55} x2={73} y2={64} />
      <line x1={58} y1={46} x2={54} y2={42} />
    </svg>
  );
}
