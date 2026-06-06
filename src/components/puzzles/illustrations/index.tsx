import { CoinTableArt } from "./CoinTableArt";
import { MontyHallArt } from "./MontyHallArt";
import { BurningRopesArt } from "./BurningRopesArt";
import { SetCardsArt } from "./SetCardsArt";
import { CryptarithmArt } from "./CryptarithmArt";
import { SurfacesArt } from "./SurfacesArt";

// Registry of inline-SVG tile/hero illustrations, shared by the puzzle tiles and
// the course cards. Adding a new illustration is one import + one line here; the
// data files' `illustration` field is typed to these keys, so a typo is a
// compile error.
export const illustrations = {
  "coin-table": CoinTableArt,
  "monty-hall": MontyHallArt,
  "burning-ropes": BurningRopesArt,
  "set-cards": SetCardsArt,
  cryptarithm: CryptarithmArt,
  surfaces: SurfacesArt,
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
