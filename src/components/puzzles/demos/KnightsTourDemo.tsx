"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const N = 7; // 7×7 board
const CELL = 42;
const SIZE = N * CELL;

const KNIGHT_OFFSETS = [
  [1, 2],
  [2, 1],
  [-1, 2],
  [-2, 1],
  [1, -2],
  [2, -1],
  [-1, -2],
  [-2, -1],
];

interface Sq {
  r: number;
  c: number;
}

const same = (a: Sq, b: Sq) => a.r === b.r && a.c === b.c;
const onBoard = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;
const center = (s: Sq) => ({ x: s.c * CELL + CELL / 2, y: s.r * CELL + CELL / 2 });

function knightMoves(s: Sq): Sq[] {
  return KNIGHT_OFFSETS.map(([dr, dc]) => ({ r: s.r + dr, c: s.c + dc })).filter(
    (m) => onBoard(m.r, m.c)
  );
}

export default function KnightsTourDemo() {
  const [path, setPath] = useState<Sq[]>([]);

  const current = path.length ? path[path.length - 1] : null;
  const visited = useMemo(() => new Set(path.map((s) => s.r * N + s.c)), [path]);

  // Squares the knight may legally hop to next: a knight's move from the current
  // square, not already visited. Before the first move, any square is a start.
  const legal = useMemo<Sq[]>(() => {
    if (!current) return [];
    return knightMoves(current).filter((m) => !visited.has(m.r * N + m.c));
  }, [current, visited]);
  const isLegalNext = useCallback(
    (r: number, c: number) => legal.some((m) => same(m, { r, c })),
    [legal]
  );

  const clickCell = (r: number, c: number) => {
    if (!current) {
      setPath([{ r, c }]);
      return;
    }
    if (visited.has(r * N + c)) return;
    if (isLegalNext(r, c)) setPath((p) => [...p, { r, c }]);
  };

  const undo = () => setPath((p) => p.slice(0, -1));
  const reset = () => setPath([]);

  const complete = path.length === N * N;
  const stuck = current !== null && !complete && legal.length === 0;

  const status = !current
    ? "Click any square to drop the knight, then hop along the highlighted L-moves."
    : complete
    ? "All 49 squares visited — an open tour! But check: square 49 is never a knight's move from square 1, so you can't close the loop."
    : stuck
    ? "No moves left — the knight is boxed in. Undo and try another route."
    : `${path.length} / 49 visited. Keep going — can you cover them all and land a knight's move from the start?`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[320px]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-full w-full select-none rounded-lg"
          role="group"
          aria-label="7 by 7 chessboard for building a knight's tour"
        >
          {/* board squares (chessboard colouring — the heart of the proof) */}
          {Array.from({ length: N * N }, (_, i) => {
            const r = Math.floor(i / N);
            const c = i % N;
            const dark = (r + c) % 2 === 1;
            const isVisited = visited.has(i);
            const isCurrent = current ? same(current, { r, c }) : false;
            return (
              <rect
                key={i}
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                onClick={() => clickCell(r, c)}
                className={cn(
                  dark ? "fill-foreground/[0.16]" : "fill-foreground/[0.05]",
                  isVisited && "fill-emerald-500/25",
                  (isLegalNext(r, c) || (!current && !isVisited)) && "cursor-pointer",
                  isCurrent && "fill-emerald-500/40"
                )}
              />
            );
          })}

          {/* path between consecutive squares */}
          {path.length > 1 && (
            <polyline
              points={path.map((s) => { const p = center(s); return `${p.x},${p.y}`; }).join(" ")}
              fill="none"
              className="stroke-emerald-600 dark:stroke-emerald-400"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.7}
            />
          )}

          {/* legal next-move markers */}
          {legal.map((m, i) => {
            const p = center(m);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={6}
                className="fill-accent"
                opacity={0.8}
                pointerEvents="none"
              />
            );
          })}

          {/* move numbers */}
          {path.map((s, i) => {
            const p = center(s);
            const isLast = i === path.length - 1;
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                dy="0.35em"
                textAnchor="middle"
                className="fill-foreground font-semibold"
                fontSize={isLast ? 0 : 13}
                pointerEvents="none"
              >
                {isLast ? "" : i + 1}
              </text>
            );
          })}

          {/* the knight on its current square */}
          {current &&
            (() => {
              const p = center(current);
              return (
                <text
                  x={p.x}
                  y={p.y}
                  dy="0.34em"
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize={26}
                  pointerEvents="none"
                >
                  ♞
                </text>
              );
            })()}

          {/* board border + grid lines */}
          <rect x={0.5} y={0.5} width={SIZE - 1} height={SIZE - 1} fill="none" className="stroke-border" strokeWidth={1} />
        </svg>
      </div>

      <p
        className={cn(
          "min-h-[2.5rem] max-w-prose text-center text-sm",
          complete ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        )}
        aria-live="polite"
      >
        {status}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={undo}
          disabled={path.length === 0}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={path.length === 0}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
