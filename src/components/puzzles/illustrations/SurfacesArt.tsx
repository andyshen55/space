// Hero motif for "Graph Theory on Surfaces": a torus (doughnut) with a small
// graph drawn on it — the course's central idea that a graph forced to cross
// itself on the page can be drawn cleanly once the page is wrapped into a torus.
// Theme-aware via `currentColor`.
export function SurfacesArt({ className }: { className?: string }) {
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
      {/* torus outline: outer body + the hole */}
      <ellipse cx="50" cy="52" rx="40" ry="27" />
      <path d="M30 48 Q50 62 70 48" />
      <path d="M34 51 Q50 42 66 51" />

      {/* a few graph vertices riding on the surface, with edges — one edge dips
          through the hole region, the move that undoes a planar crossing */}
      <path d="M28 38 Q50 22 72 38" strokeWidth={1.6} opacity={0.85} />
      <path d="M28 38 Q40 56 50 57" strokeWidth={1.6} opacity={0.85} />
      <path d="M72 38 Q60 56 50 57" strokeWidth={1.6} opacity={0.85} />
      <path d="M28 38 Q12 52 50 70" strokeWidth={1.6} opacity={0.85} />
      <path d="M72 38 Q88 52 50 70" strokeWidth={1.6} opacity={0.85} />

      {[
        [28, 38],
        [72, 38],
        [50, 57],
        [50, 70],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.4" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}
