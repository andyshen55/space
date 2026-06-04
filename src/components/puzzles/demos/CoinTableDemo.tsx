"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// SVG coordinate space spans -VIEW..VIEW on both axes, centered on the table.
const VIEW = 200;
const R = 170; // table radius
const r = 28; // coin radius — small enough to look clean, large enough to fill in a dozen-ish moves
const EPS = 0.001;

type Owner = "ai" | "you";
interface Coin {
  x: number;
  y: number;
  owner: Owner;
}

// A coin at (x, y) is legal iff it lies entirely on the table and overlaps no
// existing coin.
function isLegal(x: number, y: number, coins: Coin[]): boolean {
  if (Math.hypot(x, y) + r > R) return false;
  for (const c of coins) {
    if (Math.hypot(x - c.x, y - c.y) < 2 * r - EPS) return false;
  }
  return true;
}

// The two intersection points of two equal-radius circles, or [] if they don't
// properly cross (identical, or too far apart). Used to enumerate the "corners"
// of the free space between coins.
function intersectEqualCircles(
  a: Coin,
  b: Coin,
  rad: number
): { x: number; y: number }[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  if (d < EPS || d > 2 * rad - EPS) return [];
  const h = Math.sqrt(rad * rad - (d * d) / 4); // height off the chord midpoint
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return [
    { x: mx + (-dy / d) * h, y: my + (dx / d) * h },
    { x: mx - (-dy / d) * h, y: my - (dx / d) * h },
  ];
}

// Do a set of equal-width angular arcs cover the whole circle? Each arc is
// [start, end] with end - start its width (may exceed 2π for a full wrap).
function arcsCoverCircle(arcs: [number, number][]): boolean {
  const TAU = 2 * Math.PI;
  const ivs: [number, number][] = [];
  for (const [start, end] of arcs) {
    const width = Math.min(end - start, TAU);
    const a = ((start % TAU) + TAU) % TAU;
    const b = a + width;
    if (b >= TAU) {
      ivs.push([a, TAU], [0, b - TAU]);
    } else {
      ivs.push([a, b]);
    }
  }
  if (ivs.length === 0) return false;
  ivs.sort((p, q) => p[0] - q[0]);
  if (ivs[0][0] > EPS) return false; // gap before the first arc
  let reach = ivs[0][1];
  for (let i = 1; i < ivs.length; i++) {
    if (ivs[i][0] > reach + EPS) return false; // gap between arcs
    reach = Math.max(reach, ivs[i][1]);
  }
  return reach >= TAU - EPS;
}

// Is the table full — i.e., is there no legal spot left for another coin?
//
// A coin center is legal iff it lies in the disk of radius (R − r) and is ≥ 2r
// from every existing coin center. So "no legal move" means the union of the
// 2r-radius exclusion disks (one per coin) completely covers that (R − r) disk.
// Exact disk-coverage test: the (R − r) disk is covered iff
//   (a) its boundary circle is covered by the exclusion disks, AND
//   (b) every point where two exclusion circles cross inside the disk is itself
//       inside some other exclusion disk.
// If either check finds an uncovered point, that point is a legal placement.
// N is tiny (a few dozen coins) and this runs once per turn, so cost is trivial.
function tableIsFull(coins: Coin[]): boolean {
  const RB = R - r; // radius of the legal-center disk
  const D = 2 * r; // exclusion radius around each coin center

  // (a) Is the boundary circle (radius RB) fully covered? Each coin whose
  // exclusion disk reaches the rim covers an angular arc of it.
  const arcs: [number, number][] = [];
  for (const c of coins) {
    const rho = Math.hypot(c.x, c.y);
    const cosHalf = (RB * RB + rho * rho - D * D) / (2 * RB * Math.max(rho, EPS));
    if (cosHalf >= 1) continue; // exclusion disk doesn't reach the rim
    const half = cosHalf <= -1 ? Math.PI : Math.acos(cosHalf);
    const mid = Math.atan2(c.y, c.x);
    arcs.push([mid - half, mid + half]);
  }
  if (!arcsCoverCircle(arcs)) return false; // an uncovered rim point is legal

  // (b) Check every point where two exclusion circles cross.
  for (let i = 0; i < coins.length; i++) {
    for (let j = i + 1; j < coins.length; j++) {
      for (const p of intersectEqualCircles(coins[i], coins[j], D)) {
        if (Math.hypot(p.x, p.y) > RB + EPS) continue; // outside the legal disk
        let covered = false;
        for (let k = 0; k < coins.length; k++) {
          if (k === i || k === j) continue;
          if (Math.hypot(p.x - coins[k].x, p.y - coins[k].y) < D - EPS) {
            covered = true;
            break;
          }
        }
        if (!covered) return false; // an uncovered corner is a legal spot
      }
    }
  }
  return true; // (R − r) disk fully covered → no legal move remains
}

// The AI (playing first, as Alice) always opens in the dead center.
const INITIAL: Coin[] = [{ x: 0, y: 0, owner: "ai" }];

export default function CoinTableDemo() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [coins, setCoins] = useState<Coin[]>(INITIAL);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [moved, setMoved] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Map a pointer position to table-centered SVG coordinates. The SVG is kept
  // square (aspect-square), so the mapping is a simple linear scale.
  const toLocal = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * (2 * VIEW) - VIEW,
      y: ((clientY - rect.top) / rect.height) * (2 * VIEW) - VIEW,
    };
  }, []);

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      if (thinking || gameOver) return;
      const p = toLocal(e.clientX, e.clientY);
      if (p) setGhost(p);
    },
    [thinking, gameOver, toLocal]
  );

  const place = useCallback(
    (e: React.PointerEvent) => {
      if (thinking || gameOver) return;
      const p = toLocal(e.clientX, e.clientY);
      if (!p || !isLegal(p.x, p.y, coins)) return;

      const you: Coin = { x: p.x, y: p.y, owner: "you" };
      // The AI answers with the mirror point −P. By symmetry this reply is
      // always legal, but we guard defensively.
      const ai: Coin = { x: -p.x, y: -p.y, owner: "ai" };
      const aiLegal = isLegal(ai.x, ai.y, [...coins, you]);

      setCoins((prev) => [...prev, you]);
      setMoved(true);
      setGhost(null);
      setThinking(true);

      // Play the AI's reply after a short beat, then check whether the table is
      // now full — if so, you have no move and the AI made the last one.
      window.setTimeout(() => {
        setCoins((prev) => (aiLegal ? [...prev, ai] : prev));
        setThinking(false);
        const board = aiLegal ? [...coins, you, ai] : [...coins, you];
        if (tableIsFull(board)) setGameOver(true);
      }, 450);
    },
    [coins, thinking, gameOver, toLocal]
  );

  const reset = useCallback(() => {
    setCoins(INITIAL);
    setGhost(null);
    setThinking(false);
    setMoved(false);
    setGameOver(false);
  }, []);

  const ghostLegal = ghost ? isLegal(ghost.x, ghost.y, coins) : false;
  // The most recent player coin, used to draw the dashed "mirror axis".
  const lastYou = moved
    ? [...coins].reverse().find((c) => c.owner === "you") ?? null
    : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative aspect-square w-full max-w-[420px]">
        <svg
          ref={svgRef}
          viewBox={`${-VIEW} ${-VIEW} ${2 * VIEW} ${2 * VIEW}`}
          className="h-full w-full touch-none select-none"
          onPointerMove={handleMove}
          onPointerLeave={() => setGhost(null)}
          onPointerDown={place}
          role="application"
          aria-label="Coins on a round table: place a coin and watch the AI mirror it across the center."
        >
          {/* the table */}
          <circle
            cx={0}
            cy={0}
            r={R}
            className="fill-muted stroke-border"
            strokeWidth={2}
          />
          {/* symmetry crosshair through the center */}
          <line x1={-R} y1={0} x2={R} y2={0} className="stroke-border" strokeWidth={1} strokeDasharray="4 6" opacity={0.6} />
          <line x1={0} y1={-R} x2={0} y2={R} className="stroke-border" strokeWidth={1} strokeDasharray="4 6" opacity={0.6} />

          {/* dashed axis linking the latest mirrored pair through the center */}
          {lastYou && (
            <line
              x1={lastYou.x}
              y1={lastYou.y}
              x2={-lastYou.x}
              y2={-lastYou.y}
              className="stroke-foreground"
              strokeWidth={1.5}
              strokeDasharray="2 6"
              opacity={0.45}
            />
          )}

          {/* placed coins: AI = solid disc, you = hollow ring */}
          {coins.map((c, i) => (
            <motion.circle
              key={i}
              cx={c.x}
              cy={c.y}
              initial={{ r: 0 }}
              animate={{ r }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              strokeWidth={3}
              className={cn(
                "stroke-foreground",
                c.owner === "ai" ? "fill-foreground" : "fill-background"
              )}
            />
          ))}

          {/* cursor preview: green when legal, red when not */}
          {ghost && !thinking && !gameOver && (
            <circle
              cx={ghost.x}
              cy={ghost.y}
              r={r}
              strokeWidth={2}
              strokeDasharray="4 4"
              className={cn(
                ghostLegal
                  ? "fill-emerald-500/25 stroke-emerald-500"
                  : "fill-red-500/15 stroke-red-500"
              )}
            />
          )}
        </svg>
      </div>

      <p
        className={cn(
          "max-w-prose text-center text-sm",
          gameOver ? "font-medium text-foreground" : "text-muted-foreground"
        )}
        aria-live="polite"
      >
        {gameOver
          ? "No legal spots remain — you're boxed in, so the AI placed the last coin and wins. That's the strategy in action: mirroring guarantees the AI a reply on every turn, so you're always the one who runs out of room. Hit Reset to try again."
          : !moved
          ? "The AI opened in the dead center. Your move — drop a coin anywhere it fully fits without overlapping."
          : "The AI replied at the mirror point, 180° across the center. Whenever your move is legal, so is its reflection — so the AI never runs out of replies and makes the last move."}
      </p>

      <div className="flex w-full max-w-[420px] flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="-8 -8 16 16" aria-hidden="true">
              <circle r="7" className="fill-foreground" />
            </svg>
            AI (Alice)
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="-8 -8 16 16" aria-hidden="true">
              <circle r="6" strokeWidth="2.5" className="fill-background stroke-foreground" />
            </svg>
            You
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
