import { cn } from "@/lib/utils";

// Spoiler-friendly disclosure for a puzzle's solution. Built on a native
// <details> element so it works without JavaScript and the solution text stays
// in the DOM for crawlers; the chevron rotates when open.
export function SolutionReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details
      className={cn(
        "group mt-10 rounded-xl border border-border bg-muted/30",
        className
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 text-base font-medium transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
        <span>Reveal solution</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <div className="space-y-4 px-5 pb-6 pt-2">{children}</div>
    </details>
  );
}
