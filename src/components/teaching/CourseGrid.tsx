import Link from "next/link";
import type { Course } from "@/data/courses";
import { PuzzleIllustration } from "@/components/puzzles/illustrations";

// Responsive grid of course cards (hero illustration + title + tagline +
// level/category chips), modeled on the puzzles grid. Breaks out to a wide
// container, so its root must be a direct child of `main.wrapper` for
// `full-bleed` to take effect.
export function CourseGrid({ courses }: { courses: Course[] }) {
  return (
    <div className="full-bleed pb-16">
      <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <li key={course.id} className="flex">
            <Link
              href={`/teaching/${course.slug}`}
              className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-muted p-10 text-foreground">
                <PuzzleIllustration
                  name={course.illustration}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {course.level}
                  </span>
                  {course.category && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {course.category}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold">{course.title}</h2>
                <p className="text-sm text-muted-foreground">{course.tagline}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
