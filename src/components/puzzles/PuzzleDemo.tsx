"use client";

import dynamic from "next/dynamic";
import { DemoFrame } from "./DemoFrame";

// Registry of interactive demos. Each demo is a self-contained client component
// that takes no required props and manages its own state. Demos are lazily
// imported (`ssr: false`), so a puzzle page ships a demo's JS only when that
// puzzle actually has one — text-only puzzles ship none.
//
// This registry lives in a client module because `ssr: false` dynamic imports
// aren't allowed inside server components; the server detail page just renders
// <PuzzleDemo demoKey=... />. Adding an interactive puzzle = drop a file in
// ./demos and add one line here.
const demoRegistry = {
  "coin-table": dynamic(() => import("./demos/CoinTableDemo"), {
    ssr: false,
    loading: () => (
      <div className="mx-auto aspect-square w-full max-w-[420px] animate-pulse rounded-xl bg-muted" />
    ),
  }),
} as const;

export type PuzzleDemoKey = keyof typeof demoRegistry;

export function PuzzleDemo({ demoKey }: { demoKey: PuzzleDemoKey }) {
  const Demo = demoRegistry[demoKey];
  if (!Demo) return null;
  return (
    <DemoFrame>
      <Demo />
    </DemoFrame>
  );
}
