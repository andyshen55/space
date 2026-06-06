"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { Card } from "./math";

// value→glyph order, matching the attribute indices documented in math.ts.
// (The math is invariant to these choices; they just have to be consistent.)
const COLORS = ["#e2231a", "#9b59b6", "#27ae60"] as const; // index 0: color
type Shape = "oval" | "diamond" | "squiggle"; //              index 1: shape
const SHAPES: Shape[] = ["oval", "diamond", "squiggle"];
type Shading = "solid" | "open" | "striped"; //               index 2: shading
const SHADINGS: Shading[] = ["solid", "open", "striped"];
//                                                            index 3: count → value + 1

// One symbol drawn centered at (cx, cy) inside a half-width/half-height box.
const HW = 22;
const HH = 7.5;

function shapePath(shape: Shape, cx: number, cy: number): string {
  if (shape === "diamond") {
    return `M${cx} ${cy - HH} L${cx + HW} ${cy} L${cx} ${cy + HH} L${cx - HW} ${cy} Z`;
  }
  if (shape === "squiggle") {
    // A rotationally-symmetric wavy blob — reads clearly as "not oval, not
    // diamond". Two cubic lobes mirrored through the center.
    return [
      `M${cx - HW} ${cy}`,
      `C${cx - HW} ${cy - HH * 1.7} ${cx - HW * 0.2} ${cy - HH * 1.5} ${cx + HW * 0.12} ${cy - HH * 0.3}`,
      `C${cx + HW * 0.35} ${cy + HH * 0.7} ${cx + HW} ${cy + HH * 0.4} ${cx + HW} ${cy}`,
      `C${cx + HW} ${cy + HH * 1.7} ${cx + HW * 0.2} ${cy + HH * 1.5} ${cx - HW * 0.12} ${cy + HH * 0.3}`,
      `C${cx - HW * 0.35} ${cy - HH * 0.7} ${cx - HW} ${cy - HH * 0.4} ${cx - HW} ${cy}`,
      "Z",
    ].join(" ");
  }
  // oval: a fully-rounded rectangle (a stadium).
  return `M${cx - HW + HH} ${cy - HH} L${cx + HW - HH} ${cy - HH} A${HH} ${HH} 0 0 1 ${cx + HW - HH} ${cy + HH} L${cx - HW + HH} ${cy + HH} A${HH} ${HH} 0 0 1 ${cx - HW + HH} ${cy - HH} Z`;
}

// Render any of the 81 SET cards from its 4-vector. Theme-aware: the card face
// and border follow the site palette; the three SET ink colors are fixed.
export function SetCard({
  card,
  state = "idle",
  onClick,
  className,
  ariaLabel,
}: {
  card: Card;
  state?: "idle" | "selected" | "correct" | "wrong";
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  const patternId = useId();
  const [colorI, shapeI, shadingI, countI] = card;
  const color = COLORS[colorI];
  const shape = SHAPES[shapeI];
  const shading = SHADINGS[shadingI];
  const count = countI + 1;

  // Vertically center `count` symbols around y = 50, spacing 24 apart.
  const ys = Array.from({ length: count }, (_, i) => 50 + (i - (count - 1) / 2) * 24);

  const fill =
    shading === "solid" ? color : shading === "striped" ? `url(#${patternId})` : "none";

  const interactive = !!onClick;
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={interactive ? state === "selected" : undefined}
      className={cn(
        "block rounded-xl transition-transform",
        interactive &&
          "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:-translate-y-0.5",
        className
      )}
    >
      <svg viewBox="0 0 70 100" className="h-full w-full" role="img">
        <defs>
          <pattern
            id={patternId}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(0)"
          >
            <line x1="0" y1="0" x2="0" y2="4" stroke={color} strokeWidth="1.4" />
          </pattern>
        </defs>

        <rect
          x="2"
          y="2"
          width="66"
          height="96"
          rx="8"
          className={cn(
            "fill-background transition-colors",
            state === "selected" && "fill-accent/10",
            state === "correct" && "fill-emerald-500/15",
            state === "wrong" && "fill-red-500/15"
          )}
          stroke={
            state === "correct"
              ? "#10b981"
              : state === "wrong"
              ? "#ef4444"
              : state === "selected"
              ? "currentColor"
              : "hsl(var(--border))"
          }
          strokeWidth={state === "idle" ? 1.5 : 2.5}
        />

        {ys.map((cy, i) => (
          <path
            key={i}
            d={shapePath(shape, 35, cy)}
            fill={fill}
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </Tag>
  );
}
