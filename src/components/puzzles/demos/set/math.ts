// The mathematical core of the SET demo, ported from the ORMC "Abstract Algebra
// for SET" course (PySet, MIT © Andy Shen). Every card is a 4-vector over the
// field ℤ₃ — each attribute is a coordinate in {0, 1, 2} — and the whole game
// reduces to two one-liners over that vector space.
//
// Attribute order (documented once; the math is invariant to the choice, but
// the SVG renderer reads these indices, so keep them in sync with SetCard.tsx):
//   index 0 → color, 1 → shape, 2 → shading, 3 → count.
export type Card = readonly [number, number, number, number];

// Three cards form a SET ⟺ their vectors sum to 0⃗ mod 3 ⟺ on every attribute
// the three values are all-equal or all-different (those are exactly the triples
// that sum to 0 mod 3).
export function isSet(a: Card, b: Card, c: Card): boolean {
  return a.every((_, i) => (a[i] + b[i] + c[i]) % 3 === 0);
}

// The course punchline made mechanical: any two cards determine exactly one
// completing card — the unique vector that makes the sum 0⃗ mod 3.
export function thirdCard(a: Card, b: Card): Card {
  return a.map((_, i) => (3 - ((a[i] + b[i]) % 3)) % 3) as unknown as Card;
}

// The full 81-card deck = every point of (ℤ₃)⁴.
export const ALL_CARDS: Card[] = (() => {
  const deck: Card[] = [];
  for (let color = 0; color < 3; color++)
    for (let shape = 0; shape < 3; shape++)
      for (let shading = 0; shading < 3; shading++)
        for (let count = 0; count < 3; count++)
          deck.push([color, shape, shading, count]);
  return deck;
})();

export const cardKey = (c: Card): string => c.join("");

// Find the first SET among a list of cards, returned as the triple of board
// indices, or null if the board is SET-free.
export function findSet(cards: Card[]): [number, number, number] | null {
  for (let i = 0; i < cards.length; i++)
    for (let j = i + 1; j < cards.length; j++)
      for (let k = j + 1; k < cards.length; k++)
        if (isSet(cards[i], cards[j], cards[k])) return [i, j, k];
  return null;
}

// Deterministic shuffle (no Math.random at module scope — callers pass a seed so
// the same deal is reproducible). A small LCG is plenty for dealing cards.
function shuffled<T>(items: T[], seed: number): T[] {
  const out = items.slice();
  let s = (seed >>> 0) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Deal `n` cards from a freshly shuffled deck, guaranteeing at least one SET is
// present so the board is always solvable. Bumps the seed until a SET appears
// (the probability a random 12-card deal contains no SET is ~3%, so this almost
// never loops more than once).
export function dealBoard(n: number, seed: number): Card[] {
  for (let attempt = 0; attempt < 32; attempt++) {
    const board = shuffled(ALL_CARDS, seed + attempt).slice(0, n);
    if (findSet(board)) return board;
  }
  return shuffled(ALL_CARDS, seed).slice(0, n);
}
