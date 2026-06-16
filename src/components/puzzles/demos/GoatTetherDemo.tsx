"use client";

import { useCallback, useId, useRef, useState } from "react";

const W = 380;
const H = 300;
const MIN_R = 48;
const MAX_R = 150;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const hyp = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

interface Pt {
  x: number;
  y: number;
}

interface State {
  stakes: [Pt, Pt];
  radii: [number, number];
  angles: [number, number]; // where each rope-length handle sits on its circle
  goat: Pt;
}

// Project a point into the intersection (lens) of the two disks: alternately push
// it inside disk 0 and disk 1 until it satisfies both. Converges when the disks
// overlap; if they don't, it settles in the gap between them.
function clampToLens(p: Pt, s0: Pt, r0: number, s1: Pt, r1: number): Pt {
  let { x, y } = p;
  for (let i = 0; i < 12; i++) {
    let dx = x - s0.x, dy = y - s0.y, d = Math.hypot(dx, dy);
    if (d > r0 && d > 0) { x = s0.x + (dx * r0) / d; y = s0.y + (dy * r0) / d; }
    dx = x - s1.x; dy = y - s1.y; d = Math.hypot(dx, dy);
    if (d > r1 && d > 0) { x = s1.x + (dx * r1) / d; y = s1.y + (dy * r1) / d; }
  }
  return { x, y };
}

const INITIAL: State = {
  stakes: [{ x: 150, y: 158 }, { x: 240, y: 150 }],
  radii: [104, 104],
  angles: [Math.PI * 0.82, Math.PI * 0.12],
  goat: { x: 195, y: 154 },
};

function Stake({ x, y }: Pt) {
  return (
    <g pointerEvents="none">
      <path d={`M${x - 5} ${y - 8} L${x + 5} ${y - 8} L${x} ${y + 6} Z`} className="fill-foreground" />
      <line x1={x} y1={y - 8} x2={x} y2={y - 16} className="stroke-foreground" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

type DragTarget = "stake0" | "stake1" | "handle0" | "handle1" | "goat" | null;

export default function GoatTetherDemo() {
  const svgRef = useRef<SVGSVGElement>(null);
  const clip0 = useId();
  const [s, setS] = useState<State>(INITIAL);
  const drag = useRef<DragTarget>(null);

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
      const t = drag.current;
      if (!t) return;
      const p = toLocal(e.clientX, e.clientY);
      if (!p) return;
      setS((prev) => {
        const next: State = {
          stakes: [{ ...prev.stakes[0] }, { ...prev.stakes[1] }],
          radii: [...prev.radii],
          angles: [...prev.angles],
          goat: { ...prev.goat },
        };
        if (t === "stake0" || t === "stake1") {
          const i = t === "stake0" ? 0 : 1;
          next.stakes[i] = { x: clamp(p.x, 12, W - 12), y: clamp(p.y, 12, H - 12) };
        } else if (t === "handle0" || t === "handle1") {
          const i = t === "handle0" ? 0 : 1;
          const st = next.stakes[i];
          next.radii[i] = clamp(hyp(p.x, p.y, st.x, st.y), MIN_R, MAX_R);
          next.angles[i] = Math.atan2(p.y - st.y, p.x - st.x);
        } else {
          next.goat = p;
        }
        next.goat = clampToLens(next.goat, next.stakes[0], next.radii[0], next.stakes[1], next.radii[1]);
        return next;
      });
    },
    [toLocal]
  );

  // `start` is curried: start(target) is called in render to build the
  // onPointerDown handler, but the ref writes run inside the returned handler at
  // event time, not during render — the react-hooks/refs rule can't see that.
  const start = (target: DragTarget) => (e: React.PointerEvent) => {
    /* eslint-disable react-hooks/refs */
    drag.current = target;
    svgRef.current?.setPointerCapture(e.pointerId);
    /* eslint-enable react-hooks/refs */
  };
  const end = (e: React.PointerEvent) => {
    drag.current = null;
    svgRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const handlePos = (i: 0 | 1): Pt => ({
    x: s.stakes[i].x + Math.cos(s.angles[i]) * s.radii[i],
    y: s.stakes[i].y + Math.sin(s.angles[i]) * s.radii[i],
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full max-w-[440px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full touch-none select-none rounded-lg"
          onPointerMove={onMove}
          onPointerUp={end}
          role="application"
          aria-label="One goat tied to two stakes. Drag a stake to move it, drag a rope handle to change its length, and drag the goat within the overlap of the two circles."
        >
          <defs>
            <clipPath id={clip0}>
              <circle cx={s.stakes[1].x} cy={s.stakes[1].y} r={s.radii[1]} />
            </clipPath>
          </defs>

          <rect x={0} y={0} width={W} height={H} className="fill-emerald-500/[0.06]" />

          {/* each tether's reach */}
          {[0, 1].map((i) => (
            <circle
              key={i}
              cx={s.stakes[i].x}
              cy={s.stakes[i].y}
              r={s.radii[i]}
              className="fill-emerald-500/10 stroke-emerald-600/70 dark:stroke-emerald-400/70"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              pointerEvents="none"
            />
          ))}

          {/* the lens the goat is actually confined to: disk 0 clipped by disk 1 */}
          <circle
            cx={s.stakes[0].x}
            cy={s.stakes[0].y}
            r={s.radii[0]}
            clipPath={`url(#${clip0})`}
            className="fill-emerald-500/35"
            pointerEvents="none"
          />

          {/* two ropes from the goat's collar to the two stakes */}
          {[0, 1].map((i) => (
            <line
              key={i}
              x1={s.goat.x}
              y1={s.goat.y}
              x2={s.stakes[i].x}
              y2={s.stakes[i].y}
              className="stroke-foreground/55"
              strokeWidth={1.5}
              pointerEvents="none"
            />
          ))}

          {[0, 1].map((i) => (
            <g key={i}>
              <Stake x={s.stakes[i].x} y={s.stakes[i].y} />
              <circle
                cx={s.stakes[i].x}
                cy={s.stakes[i].y}
                r={15}
                fill="transparent"
                className="cursor-move"
                onPointerDown={start(i === 0 ? "stake0" : "stake1")}
              />
              {/* rope-length handle on the circle */}
              {(() => {
                const h = handlePos(i as 0 | 1);
                return (
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r={7}
                    className="fill-background stroke-emerald-600 dark:stroke-emerald-400 cursor-pointer"
                    strokeWidth={2.5}
                    onPointerDown={start(i === 0 ? "handle0" : "handle1")}
                  />
                );
              })()}
            </g>
          ))}

          {/* the single goat, confined to the lens */}
          <text
            x={s.goat.x}
            y={s.goat.y}
            dy="0.33em"
            textAnchor="middle"
            fontSize={26}
            className="cursor-grab"
            onPointerDown={start("goat")}
          >
            🐐
          </text>
        </svg>
      </div>

      <p className="max-w-prose text-center text-sm text-muted-foreground">
        One goat, tied to <span className="font-medium text-foreground">two</span> stakes. Drag a{" "}
        <span className="font-medium text-foreground">stake</span> to move it, drag a{" "}
        <span className="font-medium text-emerald-600 dark:text-emerald-400">handle</span> to change a
        rope&apos;s length, and drag the <span className="font-medium text-foreground">goat</span> — it
        can only roam the lens where both circles overlap. Curves, never a rectangle.
      </p>
    </div>
  );
}
