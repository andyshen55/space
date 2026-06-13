"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import type { Drawing } from "@/data/drawings";
import { cn } from "@/lib/utils";

interface Vec {
  x: number;
  y: number;
}

// Decorative sheets behind the live ones, purely for stack thickness. They are
// static — they never change content or position — so nothing reshuffles during
// a swipe. The visible "pile" fan comes entirely from these.
const DECO = 3;
const peek = (k: number) => ({
  x: k * 7,
  y: k * 12,
  rotate: k * 1.8,
  scale: 1 - k * 0.04,
});

export function DrawingStack({ drawings }: { drawings: Drawing[] }) {
  const N = drawings.length;
  const reduce = useReducedMotion() ?? false;

  // `index` points at the top sheet; everything is mod N, so the pile is cyclic
  // — that is what makes it feel endless and loop with no special-casing.
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const draggedRef = useRef(false); // suppress the click that follows a real drag
  const historyRef = useRef<Vec[]>([]); // exit vectors, so rewind returns a sheet from where it left

  // Motion values for the live top sheet only. Rotation follows x, so the sheet
  // tilts as it is dragged or flung. The sheet beneath never moves.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-400, 400], [-16, 16], { clamp: false });

  const { flingT, flyInT, snapT } = useMemo(
    () => ({
      flingT: reduce
        ? { duration: 0.2, ease: "easeIn" as const }
        : { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
      flyInT: reduce
        ? { duration: 0.2 }
        : { type: "spring" as const, stiffness: 260, damping: 26 },
      snapT: { type: "spring" as const, stiffness: 550, damping: 38 },
    }),
    [reduce],
  );

  const flingDistance = useCallback(() => {
    if (reduce) return 140;
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    return w * 0.9 + 260;
  }, [reduce]);

  // Dismiss the top sheet. The sheet directly beneath is already sitting at
  // center showing the *next* drawing, so flinging the top one away simply
  // reveals it — no rise, no reshuffle. Once the fling finishes we swap the top
  // sheet's content to that next drawing and snap it back to center, all before
  // the browser paints (flushSync), so the hand-off is invisible.
  const advance = useCallback(
    async (vec: Vec) => {
      if (busyRef.current || N === 0) return;
      busyRef.current = true;
      setBusy(true);
      historyRef.current.push(vec);

      await Promise.all([
        animate(x, vec.x, flingT).finished,
        animate(y, vec.y, flingT).finished,
        animate(opacity, 0, flingT).finished,
      ]);

      flushSync(() => setIndex((i) => (i + 1) % N));
      x.set(0);
      y.set(0);
      opacity.set(1);

      busyRef.current = false;
      setBusy(false);
    },
    [N, x, y, opacity, flingT],
  );

  // Undo the last dismissal: step back a sheet and fly it in from the side it
  // left (or from the right by default). It lands on top of the sheet beneath,
  // which is already showing the drawing it covered.
  const rewind = useCallback(async () => {
    if (busyRef.current || N === 0) return;
    busyRef.current = true;
    setBusy(true);

    const vec = historyRef.current.pop() ?? { x: flingDistance(), y: -60 };

    flushSync(() => setIndex((i) => (i - 1 + N) % N));
    x.set(vec.x);
    y.set(vec.y);
    opacity.set(1);
    await Promise.all([
      animate(x, 0, flyInT).finished,
      animate(y, 0, flyInT).finished,
    ]);

    busyRef.current = false;
    setBusy(false);
  }, [N, x, y, opacity, flyInT, flingDistance]);

  const advanceDefault = useCallback(
    () => advance({ x: flingDistance(), y: reduce ? 0 : -60 }),
    [advance, flingDistance, reduce],
  );

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swiped =
        Math.abs(offset.x) > 100 ||
        Math.abs(velocity.x) > 550 ||
        Math.abs(offset.y) > 150 ||
        Math.abs(velocity.y) > 650;

      if (swiped) {
        const dir = (offset.x || velocity.x) >= 0 ? 1 : -1;
        const dy = Math.max(-280, Math.min(280, offset.y));
        advance({ x: dir * flingDistance(), y: reduce ? dir * 16 : dy });
      } else {
        // Below threshold — spring back to center.
        animate(x, 0, snapT);
        animate(y, 0, snapT);
      }
    },
    [advance, flingDistance, reduce, x, y, snapT],
  );

  const handleCardClick = useCallback(() => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    advanceDefault();
  }, [advanceDefault]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        rewind();
      } else if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advanceDefault();
      }
    },
    [rewind, advanceDefault],
  );

  if (N === 0) {
    return (
      <p className="py-24 text-center text-muted-foreground">
        No drawings yet — add some to <code>src/data/drawings.ts</code>.
      </p>
    );
  }

  const topCard = drawings[index];
  const nextCard = drawings[(index + 1) % N];

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Drawings — click or swipe a sheet to flip through"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative flex w-full items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ height: "min(72vh, 480px)" }}
      >
        <div className="relative aspect-[4/5] w-[min(82vw,340px)]">
          {/* Static decorative paper behind everything — gives the pile its
              thickness without ever moving. */}
          {Array.from({ length: DECO }, (_, i) => {
            const depth = i + 1;
            const p = peek(depth);
            return (
              <div
                key={`deco-${depth}`}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotate}deg) scale(${p.scale})`,
                  zIndex: 10 - depth,
                }}
              >
                <PaperSheet />
              </div>
            );
          })}

          {/* The next drawing, parked at center directly behind the top sheet.
              When the top sheet is flung away this is revealed in place — no
              movement at all. */}
          <div className="pointer-events-none absolute inset-0" style={{ zIndex: 20 }}>
            <Sheet drawing={nextCard} />
          </div>

          {/* The live top sheet — draggable + clickable. */}
          <motion.div
            drag={!busy}
            dragMomentum={false}
            onPointerDown={() => {
              draggedRef.current = false;
            }}
            onDragStart={() => {
              draggedRef.current = true;
            }}
            onDragEnd={handleDragEnd}
            onClick={handleCardClick}
            style={{ x, y, rotate, opacity, zIndex: 30 }}
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
          >
            <Sheet drawing={topCard} interactive />
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={rewind}
          disabled={busy}
          aria-label="Rewind to the previous drawing"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          <RewindIcon /> Rewind
        </button>

        <span
          aria-live="polite"
          className="min-w-16 text-center text-sm tabular-nums text-muted-foreground"
        >
          {index + 1} / {N}
        </span>

        <button
          type="button"
          onClick={advanceDefault}
          disabled={busy}
          aria-label="Next drawing"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          Next <NextIcon />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Click or swipe a sheet to flip through · loops back to the start
      </p>
    </div>
  );
}

// The paper surface — always a light cream sheet (paper is paper, in either
// theme) with a soft shadow.
function PaperSheet({
  children,
  interactive = false,
}: {
  children?: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-full w-full overflow-hidden rounded-lg border border-black/10 bg-[#fbfaf7]",
        interactive ? "shadow-2xl" : "shadow-md",
      )}
    >
      {children}
    </div>
  );
}

// A sheet carrying a drawing, centered and contained, captioned along the foot.
function Sheet({
  drawing,
  interactive = false,
}: {
  drawing: Drawing;
  interactive?: boolean;
}) {
  return (
    <PaperSheet interactive={interactive}>
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-1 items-center justify-center p-6">
          {/* Plain <img>: drawings are mixed/unknown aspect ratios and SVG, so we
              contain them in a sized box rather than use next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={drawing.image}
            alt={drawing.alt}
            draggable={false}
            loading="eager"
            decoding="async"
            className="pointer-events-none max-h-full max-w-full select-none object-contain"
          />
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-black/5 px-5 py-3 text-neutral-700">
          <span className="truncate text-sm font-medium">{drawing.title}</span>
          {(drawing.medium || drawing.year) && (
            <span className="shrink-0 text-xs text-neutral-400">
              {[drawing.medium, drawing.year].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      </div>
    </PaperSheet>
  );
}

function RewindIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 19 4 12l7-7M20 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
