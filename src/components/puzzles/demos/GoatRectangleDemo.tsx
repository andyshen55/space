"use client";

import { useCallback, useRef, useState } from "react";

// 12 px per foot → a 20′×10′ rectangle is 240×120 px.
const W = 320;
const H = 220;
const LEFT = 40;
const RIGHT = 280;
const TOP = 55;
const BOT = 175;
const MIDY = (TOP + BOT) / 2;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function GoatRectangleDemo() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [goat, setGoat] = useState({ x: (LEFT + RIGHT) / 2, y: MIDY });
  const dragging = useRef(false);

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    };
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const p = toLocal(e.clientX, e.clientY);
      if (!p) return;
      setGoat({ x: clamp(p.x, LEFT, RIGHT), y: clamp(p.y, TOP, BOT) });
    },
    [toLocal]
  );

  const startDrag = (e: React.PointerEvent) => {
    dragging.current = true;
    // Pointer capture keeps move/up events coming even when the pointer leaves
    // the goat or the whole svg — so dragging off the rectangle and back works.
    svgRef.current?.setPointerCapture(e.pointerId);
  };
  const endDrag = (e: React.PointerEvent) => {
    dragging.current = false;
    svgRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const corners: [number, number][] = [
    [LEFT, TOP],
    [RIGHT, TOP],
    [LEFT, BOT],
    [RIGHT, BOT],
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full max-w-[440px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full touch-none select-none rounded-lg"
          onPointerMove={onMove}
          onPointerUp={endDrag}
          role="application"
          aria-label="A goat on a sliding loop between two parallel ropes, grazing a 10 by 20 rectangle."
        >
          <rect x={0} y={0} width={W} height={H} className="fill-emerald-500/[0.05]" />

          {/* the whole rectangle is grazed — the goat can reach every point of it */}
          <rect x={LEFT} y={TOP} width={RIGHT - LEFT} height={BOT - TOP} className="fill-emerald-500/30" />
          <rect x={LEFT} y={TOP} width={RIGHT - LEFT} height={BOT - TOP} fill="none" className="stroke-border" strokeWidth={1.5} />

          {/* the two parallel taut ropes along the long edges */}
          {[TOP, BOT].map((y) => (
            <line key={y} x1={LEFT} y1={y} x2={RIGHT} y2={y} className="stroke-amber-500" strokeWidth={3} />
          ))}

          {/* the sliding cross-piece (loop) with a ring riding on each rope */}
          <line x1={goat.x} y1={TOP} x2={goat.x} y2={BOT} className="stroke-foreground/70" strokeWidth={2} />
          {[TOP, BOT].map((y) => (
            <circle key={y} cx={goat.x} cy={y} r={4.5} fill="none" className="stroke-foreground" strokeWidth={2} />
          ))}

          {/* corner stakes */}
          {corners.map(([x, y], i) => (
            <path key={i} d={`M${x - 5} ${y - 7} L${x + 5} ${y - 7} L${x} ${y + 5} Z`} className="fill-foreground" pointerEvents="none" />
          ))}

          {/* the goat, draggable anywhere in the rectangle */}
          <text
            x={goat.x}
            y={goat.y}
            dy="0.33em"
            textAnchor="middle"
            fontSize={24}
            className="cursor-grab"
            onPointerDown={startDrag}
          >
            🐐
          </text>

          {/* dimension labels */}
          <text x={(LEFT + RIGHT) / 2} y={TOP - 10} textAnchor="middle" className="fill-muted-foreground" fontSize={11}>
            20′
          </text>
          <text x={LEFT - 12} y={MIDY} dy="0.33em" textAnchor="middle" className="fill-muted-foreground" fontSize={11}>
            10′
          </text>
        </svg>
      </div>

      <p className="max-w-prose text-center text-sm text-muted-foreground">
        The two <span className="font-medium text-amber-600 dark:text-amber-400">amber ropes</span> are
        tied taut between the corner stakes — two parallel lines, 10′ apart. The goat hangs from a loop
        that <em>slides</em> along both: drag it anywhere and it stays inside, reaching the full 20′
        left-to-right and the full 10′ top-to-bottom. A taut rope is a straight line, so two parallel
        lines box in the exact rectangle — every blade grazed, nothing outside.
      </p>
    </div>
  );
}
