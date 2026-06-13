// Inline, theme-aware tile art for the knight's-tour puzzle: a small chessboard
// with a knight and a dashed L-move. Uses `currentColor` so the caller controls
// the color via `text-*`.
export function KnightsTourArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {/* 4×4 chessboard */}
      {Array.from({ length: 16 }, (_, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        if ((r + c) % 2 === 0) return null;
        return (
          <rect key={i} x={18 + c * 16} y={18 + r * 16} width={16} height={16} fill="currentColor" fillOpacity={0.18} />
        );
      })}
      <rect x={18} y={18} width={64} height={64} fill="none" stroke="currentColor" strokeWidth={2} />

      {/* the L-shaped knight move: from one square's center to another */}
      <path
        d="M42 42 L42 66 L66 66"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="3 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={42} cy={42} r={3} fill="currentColor" />
      <circle cx={66} cy={66} r={4.5} fill="currentColor" />
      {/* knight glyph at the destination */}
      <text x={66} y={66} dy="0.34em" textAnchor="middle" fontSize={20} fill="currentColor">
        ♞
      </text>
    </svg>
  );
}
