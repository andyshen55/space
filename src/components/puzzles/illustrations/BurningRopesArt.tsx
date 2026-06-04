// Inline, theme-aware tile art for the burning-ropes puzzle: two uneven ropes,
// each with a flame at one end. Uses `currentColor` so the caller controls color.
export function BurningRopesArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M14 40 q 12 -9 24 0 t 24 0 t 24 0" />
      <path d="M14 66 q 12 9 24 0 t 24 0 t 24 0" />
      {/* a flame at the right end of each rope */}
      <path
        d="M86 40 c -4 -5, 2 -7, 0 -13 c 6 4, 6 11, 0 13 z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M86 66 c -4 -5, 2 -7, 0 -13 c 6 4, 6 11, 0 13 z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
