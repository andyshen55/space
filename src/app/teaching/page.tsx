import type { Metadata } from "next";
import { courses } from "@/data/courses";
import { teachingResources } from "@/data/teaching";
import { CourseGrid } from "@/components/teaching/CourseGrid";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

export const metadata: Metadata = {
  title: "Teaching",
  description:
    "Math-circle courses that climb from a concrete game or puzzle up to the real mathematics underneath — each with a narrative arc, a lesson list, and interactive demos.",
};

// The heading and the grid are returned as siblings (not wrapped in a single
// div) so the grid's `full-bleed` can break out of the `.wrapper` column — same
// pattern as the puzzles page.
export default function TeachingPage() {
  return (
    <>
      <div className="py-12">
        <h1 className="mb-4 text-4xl font-bold">Teaching</h1>
        <p className="text-lg text-muted-foreground">
          Math-circle courses I&apos;ve built and taught — each one starts from a
          game or puzzle you can play, then climbs to the real mathematics
          underneath. Open one for the throughline, the lessons, and an
          interactive demo.
        </p>
      </div>

      <CourseGrid courses={courses} />

      {teachingResources.length > 0 && (
        <section className="pb-16">
          <h2 className="mb-6 text-2xl font-bold">Talks &amp; one-offs</h2>
          <div className="space-y-12">
            {teachingResources.map((resource) => (
              <article key={resource.id} className="space-y-4">
                <div>
                  <h3 className="mb-1 text-xl font-semibold">{resource.title}</h3>
                  <p className="text-muted-foreground">{resource.description}</p>
                </div>
                <VideoEmbed url={resource.videoUrl} title={resource.title} />
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
