// Hero motif for the Cryptarithms course: the classic SEND + MORE = MONEY laid
// out as a column addition, with one letter swapped for its secret digit to hint
// at the puzzle. Theme-aware via `currentColor`.
export function CryptarithmArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="17"
        fontWeight={700}
        textAnchor="end"
      >
        <text x="78" y="30">SEND</text>
        <text x="78" y="52">MORE</text>
        <text x="22" y="52">+</text>
        <text x="80" y="80">MONEY</text>
      </g>
      {/* the addition bar */}
      <rect x="20" y="58" width="62" height="2.4" stroke="none" />
    </svg>
  );
}
