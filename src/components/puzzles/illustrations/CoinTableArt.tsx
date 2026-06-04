// Inline, theme-aware tile art for the coin-table puzzle. Strokes/fills use
// `currentColor`, so the caller controls the color via `text-*` (adapts to
// light/dark automatically). The coins are arranged as mirror pairs about the
// center to hint at the winning strategy.
export function CoinTableArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="40" />
      {/* center coin (the opening move) */}
      <circle cx="50" cy="50" r="7" fill="currentColor" stroke="none" />
      {/* symmetric pairs: each light coin has a partner 180° across the center */}
      <circle cx="32" cy="38" r="7" fill="currentColor" fillOpacity="0.22" />
      <circle cx="68" cy="62" r="7" fill="currentColor" fillOpacity="0.22" />
      <circle cx="64" cy="32" r="7" fill="currentColor" fillOpacity="0.22" />
      <circle cx="36" cy="68" r="7" fill="currentColor" fillOpacity="0.22" />
    </svg>
  );
}
