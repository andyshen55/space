// Inline, theme-aware tile art for the Monty Hall puzzle: three doors, the
// middle one ajar. Uses `currentColor` so the caller controls color.
export function MontyHallArt({ className }: { className?: string }) {
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
      {[14, 39, 64].map((x) => (
        <g key={x}>
          <rect x={x} y={24} width={22} height={52} rx={2} />
          <circle cx={x + 17} cy={50} r={1.8} fill="currentColor" stroke="none" />
        </g>
      ))}
      {/* the middle door swung open to reveal a goat (the dashed opening) */}
      <path d="M50 24 L44 20 L44 80 L50 76" fill="currentColor" fillOpacity="0.18" />
    </svg>
  );
}
