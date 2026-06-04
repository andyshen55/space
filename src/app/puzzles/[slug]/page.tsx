import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { puzzles, getPuzzleBySlug } from "@/data/puzzles";
import { siteConfig } from "@/data/site";
import { PuzzleIllustration } from "@/components/puzzles/illustrations";
import { SolutionReveal } from "@/components/puzzles/SolutionReveal";
import { PuzzleDemo } from "@/components/puzzles/PuzzleDemo";

interface PuzzlePageProps {
  params: { slug: string };
}

// Statically generate a page for every puzzle at build time (SSG, crawlable).
export function generateStaticParams() {
  return puzzles.map((puzzle) => ({ slug: puzzle.slug }));
}

export function generateMetadata({ params }: PuzzlePageProps): Metadata {
  const puzzle = getPuzzleBySlug(params.slug);
  if (!puzzle) return {};

  const url = `${siteConfig.url}/puzzles/${puzzle.slug}`;
  return {
    title: puzzle.title,
    description: puzzle.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: puzzle.title,
      description: puzzle.tagline,
    },
    twitter: {
      card: "summary",
      title: puzzle.title,
      description: puzzle.tagline,
    },
  };
}

export default function PuzzlePage({ params }: PuzzlePageProps) {
  const puzzle = getPuzzleBySlug(params.slug);
  if (!puzzle) notFound();

  // schema.org Question markup, with the solution modeled as the accepted
  // answer. The prompt and solution are also rendered as visible text below, so
  // the page is fully crawlable without JS (the solution lives in a <details>,
  // which is still in the DOM).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Question",
    name: puzzle.title,
    text: puzzle.prompt.join(" "),
    answerCount: 1,
    acceptedAnswer: {
      "@type": "Answer",
      text: puzzle.solution.join(" "),
    },
    ...(puzzle.source ? { isBasedOn: puzzle.source.url } : {}),
  };

  return (
    <article className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/puzzles"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <span aria-hidden="true">←</span> All puzzles
      </Link>

      <header className="mb-8 mt-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 text-foreground">
            <PuzzleIllustration name={puzzle.illustration} className="h-full w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
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
        </div>
        <h1 className="text-4xl font-bold">{puzzle.title}</h1>
      </header>

      <div className="space-y-4 text-lg leading-relaxed">
        {puzzle.prompt.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <SolutionReveal>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          {puzzle.solution.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {puzzle.demo && (
          <div className="mt-6">
            <PuzzleDemo demoKey={puzzle.demo} />
          </div>
        )}

        {puzzle.source && (
          <a
            href={puzzle.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {puzzle.source.label}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
        )}
      </SolutionReveal>
    </article>
  );
}
