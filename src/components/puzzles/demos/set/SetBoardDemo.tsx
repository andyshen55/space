"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SetCard } from "./SetCard";
import {
  ALL_CARDS,
  dealBoard,
  findSet,
  isSet,
  thirdCard,
  type Card,
} from "./math";

type Mode = "find" | "complete";

const BOARD_SIZE = 12;

// A couple of small UI atoms reused across the two modes.
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function Control({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </button>
  );
}

// ── Mode 1: deal a board, hunt for a SET ──────────────────────────────────────
function FindMode() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const board = useMemo(() => dealBoard(BOARD_SIZE, seed), [seed]);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [hint, setHint] = useState<[number, number, number] | null>(null);
  const clearTimer = useRef<number | null>(null);

  const reset = useCallback((newSeed?: number) => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    setSelected([]);
    setResult(null);
    setHint(null);
    if (newSeed !== undefined) setSeed(newSeed);
  }, []);

  const toggle = useCallback(
    (i: number) => {
      if (result) return; // locked while a result is flashing
      setHint(null);
      setSelected((prev) => {
        if (prev.includes(i)) return prev.filter((x) => x !== i);
        if (prev.length === 3) return prev;
        const next = [...prev, i];
        if (next.length === 3) {
          const [a, b, c] = next;
          const ok = isSet(board[a], board[b], board[c]);
          setResult(ok ? "correct" : "wrong");
          clearTimer.current = window.setTimeout(
            () => {
              setSelected([]);
              setResult(null);
            },
            ok ? 1500 : 1100
          );
        }
        return next;
      });
    },
    [board, result]
  );

  const cardState = (i: number) => {
    if (result && selected.includes(i)) return result;
    if (selected.includes(i)) return "selected" as const;
    if (hint?.includes(i)) return "selected" as const;
    return "idle" as const;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid w-full max-w-md grid-cols-4 gap-2 sm:gap-3">
        {board.map((card, i) => (
          <SetCard
            key={i}
            card={card}
            state={cardState(i)}
            onClick={() => toggle(i)}
            className="aspect-[7/10] text-foreground"
            ariaLabel={`Card ${i + 1}`}
          />
        ))}
      </div>

      <p
        className={cn(
          "min-h-[2.5rem] max-w-prose text-center text-sm",
          result === "correct"
            ? "font-medium text-emerald-600 dark:text-emerald-400"
            : result === "wrong"
            ? "font-medium text-red-600 dark:text-red-400"
            : "text-muted-foreground"
        )}
        aria-live="polite"
      >
        {result === "correct"
          ? "That's a SET — on every attribute the three cards are all-same or all-different, so their vectors sum to 0 mod 3."
          : result === "wrong"
          ? "Not a SET — at least one attribute has exactly two matching, so the vectors don't sum to 0."
          : `Pick three cards you think form a SET (${selected.length}/3 chosen).`}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Control onClick={() => reset(Math.floor(Math.random() * 1e9))}>
          New cards
        </Control>
        <Control onClick={() => setHint(findSet(board))}>Show me a SET</Control>
        {selected.length > 0 && !result && (
          <Control onClick={() => reset()}>Clear</Control>
        )}
      </div>
    </div>
  );
}

// ── Mode 2: pick two cards, reveal the unique completer ───────────────────────
function pickPair(): [Card, Card] {
  const i = Math.floor(Math.random() * ALL_CARDS.length);
  let j = Math.floor(Math.random() * ALL_CARDS.length);
  if (j === i) j = (j + 1) % ALL_CARDS.length;
  return [ALL_CARDS[i], ALL_CARDS[j]];
}

function CompleteMode() {
  const [pair, setPair] = useState<[Card, Card]>(() => pickPair());
  const [revealed, setRevealed] = useState(false);
  const third = useMemo(() => thirdCard(pair[0], pair[1]), [pair]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-end justify-center gap-3 sm:gap-4">
        <SetCard card={pair[0]} className="w-20 text-foreground sm:w-24" />
        <span className="pb-6 text-2xl font-light text-muted-foreground">+</span>
        <SetCard card={pair[1]} className="w-20 text-foreground sm:w-24" />
        <span className="pb-6 text-2xl font-light text-muted-foreground">=</span>
        {revealed ? (
          <SetCard card={third} className="w-20 text-foreground sm:w-24" />
        ) : (
          <div className="flex aspect-[7/10] w-20 items-center justify-center rounded-xl border-2 border-dashed border-border text-3xl font-light text-muted-foreground sm:w-24">
            ?
          </div>
        )}
      </div>

      <p className="min-h-[2.5rem] max-w-prose text-center text-sm text-muted-foreground" aria-live="polite">
        {revealed
          ? "There's exactly one card that completes the SET: the unique vector making all three sum to 0 mod 3. Two cards always determine a third — that's why \"playing SET\" is \"spotting lines in finite geometry.\""
          : "Any two cards have exactly one completing card. Reveal it, then check: on each attribute the three are all-same or all-different."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {!revealed ? (
          <Control onClick={() => setRevealed(true)}>Reveal the third card</Control>
        ) : (
          <Control
            onClick={() => {
              setPair(pickPair());
              setRevealed(false);
            }}
          >
            New pair
          </Control>
        )}
      </div>
    </div>
  );
}

export default function SetBoardDemo() {
  const [mode, setMode] = useState<Mode>("find");

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        role="tablist"
        aria-label="SET demo modes"
        className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1"
      >
        <TabButton active={mode === "find"} onClick={() => setMode("find")}>
          Find a SET
        </TabButton>
        <TabButton active={mode === "complete"} onClick={() => setMode("complete")}>
          Complete the SET
        </TabButton>
      </div>

      {mode === "find" ? <FindMode /> : <CompleteMode />}
    </div>
  );
}
