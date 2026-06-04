import type { IllustrationKey } from "@/components/puzzles/illustrations";
import type { PuzzleDemoKey } from "@/components/puzzles/PuzzleDemo";

export interface Puzzle {
  id: string;
  slug: string; // URL slug for /puzzles/[slug]
  title: string;
  tagline: string; // one-liner shown on the tile and used as the meta description
  category?: string; // e.g. "Game Theory", "Probability"
  difficulty?: "Easy" | "Medium" | "Hard";
  prompt: string[]; // paragraphs of the puzzle statement
  solution: string[]; // paragraphs of the answer (revealed on demand)
  illustration: IllustrationKey; // key into the inline-SVG illustration registry
  demo?: PuzzleDemoKey; // optional key into the interactive-demo registry
  source?: { label: string; url: string }; // optional attribution / further reading
}

export const puzzles: Puzzle[] = [
  {
    id: "1",
    slug: "coin-table",
    title: "Coins on a Round Table",
    tagline: "Two players, an endless stack of coins, and one tiny opening move that decides everything.",
    category: "Game Theory",
    difficulty: "Medium",
    illustration: "coin-table",
    demo: "coin-table",
    prompt: [
      "Alice and Bob sit across a circular table of radius R. Between them is an endless stack of identical coins of radius r (with 2r ≤ R, so at least one coin fits). They take turns placing coins flat on the table.",
      "A coin may go anywhere that lies entirely on the table and does not overlap any coin already placed. The player who places the last coin — leaving the opponent with no legal move — wins.",
      "Alice moves first. Does either player have a strategy that guarantees a win, and what is it?",
    ],
    solution: [
      "The first player, Alice, always wins, using a symmetry (“center-and-mirror”) strategy.",
      "Move 1: Alice places a coin exactly at the center of the table. From then on she plays as a mirror — whenever Bob places a coin at some point P, Alice replies at the diametrically opposite point −P (the 180° rotation of P about the center).",
      "Why the reply is always legal: after each of Alice’s moves the configuration is perfectly symmetric about the center. So if Bob’s coin at P fit without overlapping, its reflection −P is just as empty. The only point whose mirror image is itself is the center, and Alice grabbed that on move one, so Bob can never “steal” her reply.",
      "Since Alice always has a move immediately after Bob, it is Bob who eventually runs out of room. Alice places the last coin and wins. The same argument works for any centrally-symmetric table (a square, a regular hexagon, an ellipse…) — all that matters is the existence of a center point that maps to itself.",
      "Try it below: the AI plays Alice. It opens in the dead center, then answers every coin you place with its mirror image — watch how it never runs out of replies.",
    ],
  },
  {
    id: "2",
    slug: "monty-hall",
    title: "The Monty Hall Problem",
    tagline: "Three doors, one car. After the host opens a door, should you switch?",
    category: "Probability",
    difficulty: "Easy",
    illustration: "monty-hall",
    prompt: [
      "You’re on a game show facing three closed doors. Behind one is a car; behind the other two, goats. You pick a door — say door 1 — but it stays closed for now.",
      "The host, who knows what’s behind every door, opens one of the other two doors to reveal a goat. He then offers you a choice: stick with your original door, or switch to the remaining closed door.",
      "Should you switch, stay, or does it not matter?",
    ],
    solution: [
      "You should switch. Switching wins the car 2/3 of the time; staying wins only 1/3.",
      "Your first pick is right 1/3 of the time and wrong 2/3 of the time, and the host’s reveal can’t change that initial 1/3. When your first guess was right (1/3), switching loses. When it was wrong (2/3), the host is forced to expose the only other goat, so the one remaining door must hide the car — and switching wins.",
      "So switching wins exactly when your first guess was wrong, which is 2/3 of the time. The asymmetry comes entirely from the host’s knowledge: he never opens the car, which funnels the leftover probability onto the door you didn’t pick.",
    ],
    source: {
      label: "Monty Hall problem — Wikipedia",
      url: "https://en.wikipedia.org/wiki/Monty_Hall_problem",
    },
  },
  {
    id: "3",
    slug: "burning-ropes",
    title: "The Burning Ropes",
    tagline: "Measure exactly 45 minutes with two ropes that burn unevenly.",
    category: "Logic",
    difficulty: "Medium",
    illustration: "burning-ropes",
    prompt: [
      "You have two ropes and a lighter. Each rope takes exactly 60 minutes to burn from one end to the other, but neither burns at a uniform rate — half a rope might burn in 5 minutes and the other half in 55.",
      "Using only the ropes and the lighter, measure out exactly 45 minutes.",
    ],
    solution: [
      "Light the first rope at both ends and, at the same instant, light the second rope at one end only.",
      "A rope lit from both ends always finishes in 30 minutes, no matter how unevenly it burns: the two flames together consume a full hour’s worth of rope in half the time, meeting somewhere in the middle after 30 minutes.",
      "The moment the first rope is gone (30 minutes in), light the second end of the second rope. It had 30 minutes of burn left; lighting the other end now halves that to 15 minutes. When the second rope finishes, 30 + 15 = 45 minutes have elapsed.",
    ],
  },
];

// Look up a puzzle by its URL slug. Used by the dynamic /puzzles/[slug] routes.
export function getPuzzleBySlug(slug: string): Puzzle | undefined {
  return puzzles.find((puzzle) => puzzle.slug === slug);
}
