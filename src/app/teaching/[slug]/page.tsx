import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getCourseBySlug } from "@/data/courses";
import { siteConfig } from "@/data/site";
import { PuzzleIllustration } from "@/components/puzzles/illustrations";
import { PuzzleDemo } from "@/components/puzzles/PuzzleDemo";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

// Statically generate a page for every course at build time (SSG, crawlable).
export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return {};

  const url = `${siteConfig.url}/teaching/${course.slug}`;
  return {
    title: course.title,
    description: course.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: course.title,
      description: course.tagline,
    },
    twitter: {
      card: "summary",
      title: course.title,
      description: course.tagline,
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  // schema.org Course markup. The summary becomes the description; the provider
  // is the math circle these courses were taught at. Fully crawlable text lives
  // in the visible body below.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary.join(" "),
    url: `${siteConfig.url}/teaching/${course.slug}`,
    provider: {
      "@type": "Organization",
      name: "UCLA Olga Radko Endowed Math Circle (ORMC)",
      sameAs: "https://circles.math.ucla.edu/",
    },
    ...(course.lessons
      ? {
          hasPart: course.lessons.map((lesson) => ({
            "@type": "LearningResource",
            name: `Lesson ${lesson.n}: ${lesson.title}`,
            description: lesson.blurb,
          })),
        }
      : {}),
  };

  return (
    <article className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/teaching"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <span aria-hidden="true">←</span> All courses
      </Link>

      <header className="mb-8 mt-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 text-foreground">
            <PuzzleIllustration name={course.illustration} className="h-full w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {course.level}
            </span>
            {course.category && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {course.category}
              </span>
            )}
          </div>
        </div>
        <h1 className="text-4xl font-bold">{course.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{course.tagline}</p>
      </header>

      <div className="space-y-4 text-lg leading-relaxed">
        {course.summary.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {course.demo && (
        <div className="mt-10">
          <PuzzleDemo demoKey={course.demo} />
        </div>
      )}

      {course.videos && course.videos.length > 0 && (
        <section className="mt-12 space-y-8">
          {course.videos.map((video, i) => (
            <div key={i} className="space-y-3">
              <h2 className="text-xl font-semibold">{video.title}</h2>
              {video.blurb && <p className="text-muted-foreground">{video.blurb}</p>}
              <VideoEmbed url={video.url} title={video.title} />
            </div>
          ))}
        </section>
      )}

      {course.lessons && course.lessons.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-bold">Lessons</h2>
          <ol className="space-y-3">
            {course.lessons.map((lesson) => (
              <li
                key={lesson.n}
                className="flex gap-4 rounded-xl border border-border bg-muted/30 p-4"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background"
                  aria-hidden="true"
                >
                  {lesson.n}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-semibold">{lesson.title}</h3>
                    {lesson.pdfUrl && (
                      <a
                        href={lesson.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                      >
                        Handout (PDF)
                      </a>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{lesson.blurb}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {course.resources && course.resources.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Resources</h2>
          <div className="flex flex-wrap gap-3">
            {course.resources.map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {resource.label}
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
            ))}
          </div>
        </section>
      )}

      {course.credit && (
        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          {course.credit}
        </p>
      )}
    </article>
  );
}
