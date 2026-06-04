import { CoinTableArt } from "./CoinTableArt";
import { MontyHallArt } from "./MontyHallArt";
import { BurningRopesArt } from "./BurningRopesArt";

// Registry of inline-SVG tile illustrations. Adding a new puzzle illustration is
// one import + one line here; the data file's `illustration` field is typed to
// these keys, so a typo is a compile error.
export const illustrations = {
  "coin-table": CoinTableArt,
  "monty-hall": MontyHallArt,
  "burning-ropes": BurningRopesArt,
} as const;

export type IllustrationKey = keyof typeof illustrations;

export function PuzzleIllustration({
  name,
  className,
}: {
  name: IllustrationKey;
  className?: string;
}) {
  const Art = illustrations[name];
  return <Art className={className} />;
}
