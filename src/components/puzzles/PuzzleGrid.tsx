import Link from "next/link";
import { Puzzle } from "@/data/puzzles";
import { PuzzleIllustration } from "./illustrations";

// Responsive grid of illustrated puzzle tiles. Breaks out to a wide container
// (the 65ch `.wrapper` column is too narrow for multiple columns); the root must
// be a direct child of `main.wrapper` for `full-bleed` to take effect.
export function PuzzleGrid({ puzzles }: { puzzles: Puzzle[] }) {
  return (
    <div className="full-bleed pb-16">
      <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {puzzles.map((puzzle) => (
          <li key={puzzle.id} className="flex">
            <Link
              href={`/puzzles/${puzzle.slug}`}
              className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-muted p-10 text-foreground">
                <PuzzleIllustration
                  name={puzzle.illustration}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {puzzle.category && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {puzzle.category}
                    </span>
                  )}
                  {puzzle.difficulty && (
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {puzzle.difficulty}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold">{puzzle.title}</h2>
                <p className="text-sm text-muted-foreground">{puzzle.tagline}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
