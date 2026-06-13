# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Building and production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS with PostCSS
- **Language**: TypeScript (strict mode)
- **Theme Management**: next-themes (system/light/dark toggle)
- **Animation**: motion (Framer Motion v12) — shared-layout/`layoutId` transitions, the 3D book, and the SVG puzzle demos
- **Carousel**: keen-slider (mouse-wheel support via a custom plugin) — powers the book shelf
- **3D**: three.js + `@react-three/fiber` v8 + `@react-three/drei` v9 (the React-18-compatible line) — only the `graphs-on-surfaces` course demo; loaded via an `ssr:false` dynamic import so the heavy bundle stays off every other page
- **Image Optimization**: Next.js Image component with AVIF/WebP formats

## Architecture Overview

### Layout System: Full-Bleed Pattern

This project uses Josh Comeau's CSS Grid pattern for full-bleed sections. The core is in `src/app/globals.css`:

- **`.wrapper`** class: Standard content container with max-width, centered on the page
- **`FullBleed`** component: Wraps sections to break out to full viewport width while keeping inner content constrained

All pages wrap their content in `<main className="flex-1 wrapper">` (set in root layout). To make a section full-bleed, use the `<FullBleed>` component.

### Content Data Files

Content is stored in `src/data/`:

- **`site.ts`**: Centralized config (site name, URL, nav links, social URLs, author bio, SEO defaults). Nav order: Home / Teaching / Books / Puzzles.
- **`books.ts`**: `Book[]` with `id`, `slug`, `title`, `author`, `coverImage` (+ intrinsic `coverWidth`/`coverHeight` for `next/image`), `description`, `notes`, `rating`. `getBookBySlug()` powers the `/books/[slug]` routes.
- **`puzzles.ts`**: `Puzzle[]` with `id`, `slug`, `title`, `tagline`, optional `category`/`difficulty`, `prompt`/`solution` as `string[]` paragraphs, an `illustration` key, an optional `demo` key, and optional `source`. `getPuzzleBySlug()` powers the `/puzzles/[slug]` routes. The `illustration`/`demo` fields are typed to registry keys (see Puzzles below), so an unknown key fails to compile.
- **`courses.ts`**: `Course[]` with `id`, `slug`, `title`, `tagline`, `level`, optional `category`, `summary` paragraphs, optional `lessons`/`videos`/`resources`/`credit`, an `illustration` key, and an optional `demo` key. `getCourseBySlug()` powers the `/teaching/[slug]` routes. The `illustration` and `demo` fields reuse the **same** puzzle registries (`IllustrationKey`, `PuzzleDemoKey`), so courses and puzzles share demos/art and an unknown key fails to compile. See "Teaching & Courses".
- **`teaching.ts`**: `TeachingResource[]` for standalone "Talks & one-offs" videos (kept but currently empty; the `/teaching` page renders that section only when non-empty). Full courses live in `courses.ts`, not here.

These files are imported into page components and rendered via map functions. Updates to site metadata, navigation, or content should go here first.

### Page Structure

- **Root layout** (`src/app/layout.tsx`): Sets up ThemeProvider, applies root metadata, renders Header/Footer/main
- **Home** (`src/app/page.tsx`): Uses Hero and Bio components
- **Teaching** (`src/app/teaching/`): `page.tsx` renders the course-card grid (+ an optional "Talks & one-offs" video section); `[slug]/page.tsx` is the per-course page (hero + summary + optional demo + videos + lessons + resources + credit) with `generateStaticParams`, per-course `generateMetadata`, and schema.org `Course` JSON-LD. See "Teaching & Courses".
- **Books** (`src/app/books/`): `layout.tsx` mounts the persistent `BooksView` (shelf + URL-driven modal); `page.tsx` is the bare shelf; `[slug]/page.tsx` adds per-book metadata + JSON-LD + crawlable text. See "Book Shelf System".
- **Puzzles** (`src/app/puzzles/`): `page.tsx` renders the illustrated tile grid; `[slug]/page.tsx` is the per-puzzle page (prompt + revealable solution + optional demo). See "Puzzles & Interactive Demos".

### Key Components

**Book Components** (`src/components/ui/`):
- **`BooksView`**: persistent shelf + URL-driven modal (mounted in `books/layout.tsx`)
- **`BookCarousel`**: keen-slider shelf with a custom wheel-to-drag plugin, center origin, responsive perView (6/3/2), and click-to-center-then-open
- **`BookSpread`**: the shared 3D open-book, used by both the modal and `/books/[slug]`
- **`BookDetailModal`**: in-app overlay that opens the spread and flies the cover back to the shelf on close

**Puzzle Components** (`src/components/puzzles/`):
- **`PuzzleGrid`**: responsive, full-bleed grid of illustrated tiles
- **`PuzzleIllustration`** + `illustrations/`: inline-SVG tile/hero-art registry (theme-aware via `currentColor`), shared by puzzle tiles **and** course cards
- **`SolutionReveal`**: native `<details>` spoiler — works without JS and stays crawlable
- **`PuzzleDemo`** + `DemoFrame` + `demos/`: the pluggable interactive-demo system, shared by `/puzzles` and `/teaching` (demos: `coin-table`, `set-board`, `cryptarithm-solver`, `graphs-on-surfaces`)

**Teaching Components** (`src/components/teaching/`):
- **`CourseGrid`**: responsive, full-bleed grid of course cards (hero illustration + level/category chips), mirroring `PuzzleGrid`

**Other UI Components** (`src/components/ui/`):
- **`VideoEmbed`**: Wraps iframe for video embeds with aspect ratio preservation
- **`DarkModeToggle`**: Client-side theme switcher using next-themes

**Layout Components** (`src/components/layout/`):
- **`Header`**: Sticky navigation with active route detection, dark mode toggle
- **`Footer`**: Site-wide footer
- **`FullBleed`**: CSS Grid breakout wrapper

**Home Components** (`src/components/home/`):
- **`Hero`**: Hero section with profile image and bio

### Book Shelf System

The book shelf is **URL-driven and persistent**. `books/layout.tsx` mounts
`BooksView` so it survives navigation between `/books` and `/books/[slug]` — the
keen-slider carousel never remounts, and the cover flies smoothly between the
shelf and the open book.

- **URL is the single source of truth.** A slug in the path opens that book; the
  bare `/books` shows the shelf. This holds for in-app clicks, direct loads, and
  browser back/forward. `BooksView` derives the active book from
  `usePathname()`. In-app opens use `history.pushState` (no RSC fetch) so the
  centering → open transition stays seamless, and it syncs `document.title` to
  match what a real navigation would show.
- **`BookCarousel`** — keen-slider with `loop` + `free-snap` and `origin:
  "center"`; responsive `perView` 6 / 3 / 2. A custom `WheelControls` plugin
  maps mouse-wheel events to drag events. Clicking a book first **centers** it
  (`moveToIdx`, shortest path around the loop), then opens it once
  `animationEnded` fires (the click is queued in `pendingActivate`). Covers are
  `motion.create(Link)` — real crawlable anchors that also carry hover variants
  (the cover swings open ~32° in 3D) and the shared-layout `layoutId`.
- **The flying cover.** Only the one book whose id equals `flyingId` gets a
  `layoutId` (`book-${id}`). If every cover had one, they'd all animate on close,
  because keen-slider scrolls slides via transforms *outside* motion's render
  cycle, leaving motion with a stale baseline. `layoutCrossfade={false}` keeps
  the cover opaque during the flight.
- **`BookSpread`** — the shared 3D open-book, rendered by **both** the modal and
  the standalone `/books/[slug]` page so the markup is identical. Controlled by
  an `isOpen` prop (the consumer owns timing). The `layoutId` element is the
  flight target; the left leaf rotates `-180°` to open. Desktop shows a two-page
  spread (title/author left, description/notes right via `PageContent`); mobile
  collapses to one scrollable page. Optional mouse-tracked tilt while open
  (desktop only).
- **`BookDetailModal`** — the in-app overlay. Opens the spread shortly after the
  cover flies in; on close it shuts the cover in place, then hands off to
  `BooksView` to unmount via `AnimatePresence` (cover flies back to the shelf).
  Esc or an outside click dismisses it.
- **`useMediaQuery`** (`src/lib/hooks/useMediaQuery.ts`) — SSR-safe breakpoint
  hook driving the mobile vs. desktop spread layout.

### Puzzles & Interactive Demos

Routes mirror the books `[slug]` pattern: `/puzzles` is the tile grid;
`/puzzles/[slug]` is a server-rendered page (prompt → `<SolutionReveal>`
containing the solution text + an optional demo) with `generateStaticParams`,
per-puzzle `generateMetadata`, and schema.org `Question` JSON-LD. Pages are fully
crawlable — the solution lives in a native `<details>`, so it's in the DOM even
without JS.

**Two compile-time registries make puzzles pluggable.** Adding a puzzle = 1 data
entry (+ 1 SVG, + optionally 1 demo file + 1 registry line):

- **Illustration registry** (`src/components/puzzles/illustrations/index.tsx`):
  maps an `IllustrationKey` → an inline-SVG component (theme-aware via
  `currentColor`). Used for both the tiles and the detail-page motif.
- **Demo registry** (`src/components/puzzles/PuzzleDemo.tsx`, `"use client"`):
  maps a `PuzzleDemoKey` → `dynamic(() => import("./demos/X"), { ssr: false })`,
  wrapped in `DemoFrame`. It lives in a **client** module because `ssr: false`
  dynamic imports aren't allowed inside server components; the server detail page
  just renders `<PuzzleDemo demoKey=... />`. This **single registry is shared** by
  both puzzles and courses (`courses.ts` types its `demo` field as `PuzzleDemoKey`
  too), so a demo can be embedded on `/puzzles/[slug]` or `/teaching/[slug]` with
  no duplication.

**Demos are author-written React client components — not arbitrary/runtime
code.** Each demo is a self-contained `"use client"` default export with no
required props. It's statically imported, type-checked, linted, and
**code-split**: a demo's JS (and deps like `motion`) downloads only when its
puzzle is opened, and text-only puzzles ship none. The data file references a
demo only by a key constrained to `keyof typeof demoRegistry`, so an unknown key
is a compile error and renders nothing at runtime. (To run *untrusted* code you'd
need real isolation — an `<iframe sandbox>` or Web Worker — which this design
deliberately avoids.)

**Adding a demo:** (1) create `src/components/puzzles/demos/MyDemo.tsx`
(`"use client"`, default export, no required props); (2) add one line to
`demoRegistry`; (3) set `demo: "my-key"` on the puzzle in `puzzles.ts`.

**Example — `CoinTableDemo.tsx`:** an SVG coin-placement game illustrating the
center-and-mirror strategy. The AI opens in the center and mirrors each of your
moves to `-P`; a ghost coin previews legality (green/red). `tableIsFull()` runs
an exact disk-coverage test — the `(R − r)` placement disk is full iff its
boundary circle is covered *and* every pairwise exclusion-circle intersection is
covered — to detect when no legal move remains and declare the AI the winner. The
coin radius `r` is tuned so the endgame is reachable in ~a dozen moves.

**3D demos are the same pattern, just heavier.** A demo may pull in three.js / R3F
(see `graphs-on-surfaces` below). Because every demo is `ssr:false` + dynamically
imported, that 3D bundle is code-split and downloads only when its page mounts —
no other route pays for it. Same registry, same `<PuzzleDemo>` API.

### Teaching & Courses

The `/teaching` feature is a **courses showcase** built on the same
data → SSG-`[slug]` → registry pattern as Books and Puzzles:

- **`/teaching`** (`page.tsx`) renders `<CourseGrid>` over `courses` (full-bleed
  card grid), plus an optional "Talks & one-offs" `VideoEmbed` section that
  appears only when `teachingResources` is non-empty.
- **`/teaching/[slug]`** (`[slug]/page.tsx`) is a server component mirroring
  `puzzles/[slug]`: `generateStaticParams` from `courses`, per-course
  `generateMetadata`, schema.org **`Course`** JSON-LD (`provider` = ORMC,
  `lessons` → `hasPart`), then a crawlable body — hero (illustration + level/
  category chips) → `summary` paragraphs → embedded `<PuzzleDemo>` (if `demo` set)
  → `videos` via `VideoEmbed` → numbered `lessons` (each with optional `pdfUrl`)
  → `resources` → `credit` line.
- **Shared registries:** courses reuse the puzzle `IllustrationKey` (hero motifs
  `set-cards`, `cryptarithm`, `surfaces`) and `PuzzleDemoKey` (no separate course
  registry). Adding a course = 1 entry in `courses.ts` (+ optionally 1 illustration
  + 1 demo, registered as for puzzles); the route, metadata, and sitemap entry
  follow automatically.

**The three courses:** ① **Abstract Algebra for SET** (`set-board` demo) —
a SET card is a vector in (ℤ₃)⁴; three cards form a set ⟺ their vectors sum to 0.
② **Cryptarithms** (`cryptarithm-solver` demo). ③ **Graph Theory on Surfaces**
(`graphs-on-surfaces` 3D demo).

**Example — SET demo (`demos/set/`):** `math.ts` holds the ported PySet core
(`isSet`/`thirdCard`/`dealBoard`; attribute order color/shape/shading/count);
`SetCard.tsx` renders any of the 81 cards as theme-aware SVG (3 colors × 3 shapes
× 3 shadings × 1–3 count, striped fill via a `useId`-keyed `<pattern>`);
`SetBoardDemo.tsx` is the two-tab demo (find-a-SET board + the third-card finder,
the course punchline).

**Example — graphs demo (`demos/graphs/`):** the only **three.js / R3F** demo.
`geometry.ts` is pure TS (no three import): it defines K₅ = C₅(1,2) and
K₃,₃ = C₆(1,3), lays them out on three surfaces — **plane**, **sphere** (the same
2D layout via inverse stereographic projection, which *provably preserves
crossings* — that's the "plane = sphere" lesson), and **torus** (circulant
embeddings where the "skip"/"diameter" edges wind once through the hole, Δv = +1,
making them mutually parallel in the universal cover → crossing-free) — and counts
crossings **exactly** (2D segment intersection for plane/sphere; periodic
segment intersection across integer translates for the torus). `GraphsOnSurfacesDemo.tsx`
(`"use client"`) renders it with `<Canvas>` + `<OrbitControls>` + drei `<Line>`
edges (hole-winding edges highlighted amber), a graph/surface toggle, and a live
crossings + χ = V − E + F readout. The torus is tilted to a 3/4 view (its hole-axis
is z; straight-down, wrapping edges project onto each other and *look* like
crossings). Result: plane/sphere show crossings (K₅ = 5 pentagram, K₃,₃ = 3),
torus shows **0** for both. There's a node math-check approach (replicate the
detectors against the same data) to confirm counts without WebGL.

### Styling Conventions

- **Color system**: Defined in `tailwind.config.ts` as CSS variables (background, foreground, border, accent, muted, etc.)
- **Utility function**: `cn()` in `src/lib/utils.ts` combines clsx + tailwind-merge for safe class composition
- **Global styles**: `src/app/globals.css` contains reset, full-bleed grid setup, and utility classes

### Image Handling

- Profile image: `public/images/profile.jpg`
- Book covers: `public/books/` (referenced as `/books/*.jpeg` in `src/data/books.ts`, with intrinsic `coverWidth`/`coverHeight`)
- Puzzle tile art **and course hero art**: **no image assets** — illustrations are inline SVG components in `src/components/puzzles/illustrations/` (shared registry)
- Course handout PDFs: would live under `public/teaching/<course>/...` and be referenced via a lesson's `pdfUrl` (none hosted yet — `pdfUrl` is currently unset on all lessons)
- Other assets: `public/` root
- Next.js Image component is used throughout for automatic optimization (AVIF/WebP)

### SEO and Metadata

- **Dynamic metadata**: Root layout uses `siteConfig` from `src/data/site.ts` for title templates, Open Graph, and Twitter cards
- **Static routes**: `robots.ts` and `sitemap.ts` in `src/app/` for SEO
- **Social preview**: Uses OG image at `${siteConfig.url}/og-image.png`

### Environment Variables

- **`NEXT_PUBLIC_SITE_URL`**: Set in production (optional, defaults to `https://yoursite.com`)
- Must be prefixed with `NEXT_PUBLIC_` to be accessible in client code

## Development Workflow

1. **Update content**: Modify `src/data/site.ts`, `src/data/books.ts`, `src/data/puzzles.ts`, `src/data/courses.ts`, or `src/data/teaching.ts`
2. **Add a puzzle**: add an entry to `puzzles.ts` + an SVG in `illustrations/` (and register it); for an interactive one, add a demo in `demos/` and one line to the `demoRegistry` (see "Puzzles & Interactive Demos")
3. **Add a course**: add an entry to `courses.ts` (+ optionally a hero SVG in `illustrations/` and a demo in `demos/` + `demoRegistry` line — both registries are shared with puzzles); the `/teaching/[slug]` route, metadata, and sitemap entry follow automatically (see "Teaching & Courses")
4. **Add sections**: Create a new page in `src/app/` or a new component in `src/components/`
5. **Style**: Use TailwindCSS classes; update colors in `tailwind.config.ts` if needed
6. **Test dark mode**: Theme toggle persists across page reloads via next-themes
7. **Lint before commit**: `npm run lint` catches TypeScript and ESLint issues
