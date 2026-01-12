import type { Metadata } from "next";
import { teachingResources } from "@/data/teaching";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

export const metadata: Metadata = {
  title: "Teaching",
  description: "Educational resources, lectures, and tutorials.",
};

export default function TeachingPage() {
  return (
    <div className="py-12 space-y-16">
      <div>
        <h1 className="text-4xl font-bold mb-4">Teaching</h1>
        <p className="text-lg text-muted-foreground">
          Educational resources, lectures, and tutorials.
        </p>
      </div>

      <div className="space-y-16">
        {teachingResources.map((resource) => (
          <article key={resource.id} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{resource.title}</h2>
              <p className="text-muted-foreground">{resource.description}</p>
            </div>

            <VideoEmbed url={resource.videoUrl} title={resource.title} />

            {resource.links && resource.links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {resource.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {link.label}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
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
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
