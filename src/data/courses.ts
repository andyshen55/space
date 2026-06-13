import type { IllustrationKey } from "@/components/puzzles/illustrations";
import type { PuzzleDemoKey } from "@/components/puzzles/PuzzleDemo";

// A self-contained math-circle course. Mirrors the conventions in books.ts /
// puzzles.ts: typed entries, a registry-keyed illustration + demo (so a typo is
// a compile error), and a getCourseBySlug() helper for the dynamic route.

export interface CourseLesson {
  n: number; // lesson number within the course
  title: string;
  blurb: string; // one-line summary
  pdfUrl?: string; // optional static handout under /public/teaching/...
}

export interface CourseVideo {
  title: string;
  url: string; // embed URL for <VideoEmbed/> (YouTube/Vimeo)
  blurb?: string;
}

export interface Course {
  id: string;
  slug: string; // /teaching/[slug]
  title: string;
  tagline: string; // card + meta description
  level: "Elementary" | "Intermediate" | "Advanced";
  category?: string; // e.g. "Abstract Algebra", "Number Theory", "Graph Theory"
  summary: string[]; // the pitch / throughline, as paragraphs
  lessons?: CourseLesson[];
  videos?: CourseVideo[];
  demo?: PuzzleDemoKey; // optional embedded interactive (shared demo registry)
  illustration: IllustrationKey; // hero motif
  credit?: string; // authorship / attribution line
  resources?: { label: string; url: string }[];
}

export const courses: Course[] = [
  {
    id: "1",
    slug: "set",
    title: "Abstract Algebra for SET",
    tagline:
      "Build just enough abstract algebra to beat the card game SET — and discover SET is secretly geometry.",
    level: "Intermediate",
    category: "Abstract Algebra",
    illustration: "set-cards",
    demo: "set-board",
    credit:
      "UCLA Olga Radko Endowed Math Circle (ORMC), Winter 2023 — Andy Shen & Naji Sarsam. The demo's logic is ported from PySet (MIT © Andy Shen).",
    summary: [
      "The goal of this course is simple and a little mischievous: model the card game SET with enough mathematics that you can reliably beat it — because that's what fun is all about.",
      "To get there we climb a ladder of abstraction, each rung motivated by the next. What is a number? leads to the twelve axioms of the real numbers; those axioms lead to groups (symmetries you can “add”, some of which don't commute), to modular arithmetic ℤₙ, to fields (it turns out ℤₙ is a field exactly when n is prime), and finally to vector spaces over any field — including the wrap-around lattice (ℤ₃)².",
      "Then comes the payoff. Encode each card as a 4-vector over ℤ₃ — one coordinate each for color, shape, shading, and number. Three cards form a SET exactly when their vectors sum to 0⃗ mod 3 — equivalently, when they form a line in the finite affine space AG(4, 3). So any two cards determine exactly one completing card, and “playing SET” turns out to be “spotting lines in geometry.”",
    ],
    lessons: [
      { n: 1, title: "What Is a Number? (Part I)", blurb: "Brainstorm what a number really is — and what it has to do." },
      { n: 2, title: "What Is a Number? (Part II)", blurb: "The number-line hierarchy ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ and the twelve algebraic axioms." },
      { n: 3, title: "Symmetries and Groups", blurb: "The symmetry group of the triangle (D₃) — and the discovery that order can matter." },
      { n: 4, title: "From the Integers to ℤₙ", blurb: "Wrapping the number line around: building modular arithmetic from scratch." },
      { n: 5, title: "Modular Arithmetic", blurb: "Clock arithmetic; the addition and multiplication tables of ℤₙ." },
      { n: 6, title: "Abstract Fields", blurb: "What makes a field — and the theorem that ℤₙ is a field if and only if n is prime." },
      { n: 7, title: "Vector Spaces Over Fields", blurb: "Arrow vectors vs. coordinate vectors; generalizing ℝ² to 𝔽ᵈ and the (ℤ₃)² lattice." },
      { n: 8, title: "Modeling SET", blurb: "Cards as vectors; experimentally finding that only (ℤ₃)⁴ makes “SET” mean “sum to 0.”" },
      { n: 9, title: "The Geometry of SET", blurb: "A SET is a line; two cards have a unique completer; the optional full proof." },
    ],
  },
  {
    id: "2",
    slug: "cryptarithms",
    title: "Cryptarithms",
    tagline:
      "Each letter is a secret digit. SEND + MORE = MONEY — find the one assignment that makes the sum true.",
    level: "Elementary",
    category: "Number Theory",
    illustration: "cryptarithm",
    demo: "cryptarithm-solver",
    credit: "Adapted from the ORMC cryptarithms handout (prose and figures rebuilt from scratch).",
    summary: [
      "A cryptarithm is an arithmetic puzzle in disguise: distinct letters stand for distinct digits, no number may start with 0, and exactly one assignment of digits makes the arithmetic come out true. The most famous is Dudeney's 1924 classic, SEND + MORE = MONEY.",
      "The method is pure deduction, worked column by column from the carries. In SEND + MORE = MONEY, the leading M must be 1 — two four-digit numbers can't add past about 20000 — which forces S, then O, and so on, each step squeezing the puzzle until it collapses to a single answer: 9567 + 1085 = 10652.",
      "That's what makes cryptarithms a great first taste of real proof: every deduction is forced, so solving one is itself a chain of tiny proofs by contradiction. Try the solver below on three classics — SEND + MORE = MONEY, HE + HE + HE = SHE (50 + 50 + 50 = 150), and FORTY + TEN + TEN = SIXTY (29786 + 850 + 850 = 31486, which uses all ten digits at once).",
    ],
    // videos: two Manim animations to be embedded once URLs are provided.
  },
  {
    id: "3",
    slug: "graphs-on-surfaces",
    title: "Graph Theory on Surfaces",
    tagline:
      "Some graphs can't be drawn without crossings on paper — but wrap the paper into a doughnut and the knots come undone.",
    level: "Advanced",
    category: "Graph Theory",
    illustration: "surfaces",
    demo: "graphs-on-surfaces",
    credit:
      "Based on the ORMC Spring 2023 graphs handouts (primary source Oleg Gleizer, 2021, revised by Andy Shen & Naji Sarsam). Prose rewritten for this page.",
    summary: [
      "We start where the planar-graphs lesson leaves off: the complete graph K₅ and the utility graph K₃,₃ are non-planar. On a flat page — or, equivalently, on a sphere — they are forced to have at least one edge crossing, no matter how cleverly you draw them.",
      "The first twist is that the plane and the sphere are the same surface for graph-drawing. Stereographic projection makes this precise: shine a light from the north pole of a sphere and every point casts a shadow on the plane below, a crossing-preserving bijection. So “planar” really means “drawable on a sphere.”",
      "Change the surface and everything changes. On a torus — a doughnut — both K₅ and K₃,₃ can be drawn with zero crossings: the extra handle gives edges room to pass over and around the hole. The Möbius strip and the cylinder give yet other behaviors, and orientability starts to matter.",
      "The bookkeeping tool that ties it together is the Euler characteristic χ = V − E + F. It's 2 for the sphere, 0 for the torus, and drops by 2 for every handle you add (the genus): χ = 2 − 2g. The smallest genus of a surface a graph embeds in cleanly is its graph genus — a single number capturing “how twisted does the page have to be.”",
    ],
    lessons: [
      { n: 1, title: "Planar Graphs & Euler's Formula", blurb: "V − E + F = 2; why K₅ and K₃,₃ can't be drawn flat without crossings." },
      { n: 2, title: "The Sphere = the Plane", blurb: "Stereographic projection; spherical polyhedra all have χ = 2." },
      { n: 3, title: "The Cylinder & the Möbius Strip", blurb: "Orientability, and what changes when the surface has an edge or a twist." },
      { n: 4, title: "Graphs on a Torus", blurb: "K₅ and K₃,₃ embed with no crossings; the torus has χ = 0." },
      { n: 5, title: "Genus & the Euler Characteristic", blurb: "Handles, χ = 2 − 2g, and the graph genus as one number for “how twisted.”" },
    ],
  },
];

// Look up a course by its URL slug. Used by the dynamic /teaching/[slug] routes.
export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}
