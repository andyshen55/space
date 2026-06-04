import type { Metadata } from "next";
import { puzzles } from "@/data/puzzles";
import { PuzzleGrid } from "@/components/puzzles/PuzzleGrid";

export const metadata: Metadata = {
  title: "Puzzles",
  description:
    "A collection of my favorite puzzles — take a guess, then reveal the solution. Some come with a playable demo.",
};

// The heading and the grid are returned as siblings (not wrapped in a single
// div) so the grid's `full-bleed` can break out of the `.wrapper` column — see
// PuzzleGrid and the books layout for the same pattern.
export default function PuzzlesPage() {
  return (
    <>
      <div className="py-12">
        <h1 className="mb-4 text-4xl font-bold">Puzzles</h1>
        <p className="text-lg text-muted-foreground">
          A handful of puzzles I keep coming back to. Take a guess, then reveal
          the solution — a few come with a playable demo.
        </p>
      </div>

      <PuzzleGrid puzzles={puzzles} />
    </>
  );
}
