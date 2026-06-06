"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// A cryptarithm: distinct letters stand for distinct digits, no word may start
// with 0, and exactly one assignment makes the column addition true.
interface Puzzle {
  id: string;
  label: string;
  addends: string[];
  sum: string;
  answer: Record<string, number>; // the unique solution (for "Reveal")
}

const PUZZLES: Puzzle[] = [
  {
    id: "send-more",
    label: "SEND + MORE = MONEY",
    addends: ["SEND", "MORE"],
    sum: "MONEY",
    answer: { S: 9, E: 5, N: 6, D: 7, M: 1, O: 0, R: 8, Y: 2 },
  },
  {
    id: "he-she",
    label: "HE + HE + HE = SHE",
    addends: ["HE", "HE", "HE"],
    sum: "SHE",
    answer: { H: 5, E: 0, S: 1 },
  },
  {
    id: "forty",
    label: "FORTY + TEN + TEN = SIXTY",
    addends: ["FORTY", "TEN", "TEN"],
    sum: "SIXTY",
    answer: { F: 2, O: 9, R: 7, T: 8, Y: 6, E: 5, N: 0, S: 3, I: 1, X: 4 },
  },
];

type Assignment = Record<string, number | null>;

const distinctLetters = (p: Puzzle): string[] => {
  const seen = new Set<string>();
  for (const w of [...p.addends, p.sum]) for (const ch of w) seen.add(ch);
  return Array.from(seen).sort();
};

const leadingLetters = (p: Puzzle): Set<string> =>
  new Set([...p.addends, p.sum].filter((w) => w.length > 1).map((w) => w[0]));

const wordValue = (word: string, a: Assignment): number | null => {
  let v = 0;
  for (const ch of word) {
    const d = a[ch];
    if (d === null || d === undefined) return null;
    v = v * 10 + d;
  }
  return v;
};

export default function CryptarithmSolverDemo() {
  const [puzzleId, setPuzzleId] = useState(PUZZLES[0].id);
  const puzzle = PUZZLES.find((p) => p.id === puzzleId)!;
  const letters = useMemo(() => distinctLetters(puzzle), [puzzle]);
  const leading = useMemo(() => leadingLetters(puzzle), [puzzle]);

  const emptyAssignment = useMemo(
    () => Object.fromEntries(letters.map((l) => [l, null])) as Assignment,
    [letters]
  );
  const [assignment, setAssignment] = useState<Assignment>(emptyAssignment);

  // Reset the grid whenever the puzzle changes.
  const selectPuzzle = (id: string) => {
    setPuzzleId(id);
    const next = PUZZLES.find((p) => p.id === id)!;
    setAssignment(Object.fromEntries(distinctLetters(next).map((l) => [l, null])));
  };

  const setDigit = (letter: string, digit: number | null) =>
    setAssignment((prev) => ({ ...prev, [letter]: digit }));

  // ── Validation ──────────────────────────────────────────────────────────
  const usedBy = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const l of letters) {
      const d = assignment[l];
      if (d !== null && d !== undefined) (map[d] ??= []).push(l);
    }
    return map;
  }, [assignment, letters]);

  // Letters flagged in red: part of a duplicate digit, or a leading 0.
  const badLetters = useMemo(() => {
    const bad = new Set<string>();
    for (const sharers of Object.values(usedBy))
      if (sharers.length > 1) sharers.forEach((l) => bad.add(l));
    leading.forEach((l) => {
      if (assignment[l] === 0) bad.add(l);
    });
    return bad;
  }, [usedBy, assignment, leading]);

  const allAssigned = letters.every((l) => assignment[l] !== null);
  const sumValue = wordValue(puzzle.sum, assignment);
  const addendTotal = puzzle.addends.reduce<number | null>((acc, w) => {
    const v = wordValue(w, assignment);
    return acc === null || v === null ? null : acc + v;
  }, 0);
  const arithmeticOk =
    allAssigned && addendTotal !== null && addendTotal === sumValue;
  const solved = arithmeticOk && badLetters.size === 0;

  const reveal = () => setAssignment({ ...puzzle.answer });
  const clear = () => setAssignment(Object.fromEntries(letters.map((l) => [l, null])));

  // Status message.
  let status: string;
  if (solved) status = "Solved — every column adds up and the digits are all distinct.";
  else if (badLetters.size > 0) {
    const dup = Object.entries(usedBy).find(([, ls]) => ls.length > 1);
    const lead = Array.from(leading).find((l) => assignment[l] === 0);
    if (dup) status = `Two letters share digit ${dup[0]} (${dup[1].join(", ")}) — each digit is used once.`;
    else if (lead) status = `${lead} leads a word, so it can't be 0.`;
    else status = "Something's off — check the highlighted letters.";
  } else if (!allAssigned)
    status = `Assign a digit to every letter (${letters.filter((l) => assignment[l] !== null).length}/${letters.length} done).`;
  else status = "All assigned, but the columns don't add up yet — keep adjusting.";

  const maxLen = Math.max(...puzzle.addends.map((w) => w.length), puzzle.sum.length);

  // Render a word right-aligned into `maxLen` columns; blanks pad the left.
  const renderRow = (word: string, op: string, key: string) => {
    const pad = maxLen - word.length;
    return (
      <div key={key} className="flex items-end justify-end gap-0.5">
        <span className="w-5 text-right text-xl font-light text-muted-foreground">{op}</span>
        {Array.from({ length: maxLen }, (_, i) => {
          const ch = i < pad ? null : word[i - pad];
          const d = ch ? assignment[ch] : null;
          return (
            <span
              key={i}
              className="flex w-8 flex-col items-center sm:w-9"
            >
              <span className="font-mono text-xl font-semibold sm:text-2xl">{ch ?? ""}</span>
              <span
                className={cn(
                  "font-mono text-sm tabular-nums",
                  ch && d !== null
                    ? badLetters.has(ch)
                      ? "text-red-600 dark:text-red-400"
                      : solved
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                    : "text-transparent"
                )}
              >
                {ch && d !== null ? d : "0"}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* puzzle picker */}
      <div className="flex flex-wrap justify-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {PUZZLES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => selectPuzzle(p.id)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              p.id === puzzleId
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* the stacked column addition */}
      <div
        className={cn(
          "rounded-xl border bg-background px-4 py-4 transition-colors",
          solved ? "border-emerald-500" : "border-border"
        )}
      >
        {puzzle.addends.map((w, i) => renderRow(w, i === 0 ? "" : "+", `a${i}`))}
        <div className="my-1 ml-5 border-t-2 border-foreground" />
        {renderRow(puzzle.sum, "", "sum")}
      </div>

      {/* the digit key: one selector per distinct letter */}
      <div className="flex flex-wrap justify-center gap-2">
        {letters.map((l) => {
          const d = assignment[l];
          return (
            <label
              key={l}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm",
                badLetters.has(l) ? "border-red-500" : "border-border"
              )}
            >
              <span className="font-mono font-semibold">{l}</span>
              <select
                value={d ?? ""}
                onChange={(e) =>
                  setDigit(l, e.target.value === "" ? null : Number(e.target.value))
                }
                aria-label={`Digit for ${l}`}
                className="rounded bg-muted px-1 py-0.5 font-mono text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <option value="">–</option>
                {Array.from({ length: 10 }, (_, n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>

      <p
        className={cn(
          "min-h-[2.5rem] max-w-prose text-center text-sm",
          solved
            ? "font-medium text-emerald-600 dark:text-emerald-400"
            : badLetters.size > 0
            ? "text-red-600 dark:text-red-400"
            : "text-muted-foreground"
        )}
        aria-live="polite"
      >
        {status}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reveal}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Reveal answer
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
