import { cn } from "@/lib/utils";

// Consistent chrome around every interactive puzzle demo: a labeled, bordered
// card. The demo itself (placed as children) owns its controls and state.
export function DemoFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure
      className={cn(
        "my-2 overflow-hidden rounded-xl border border-border bg-muted/30",
        className
      )}
    >
      <figcaption className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        Interactive demo
      </figcaption>
      <div className="p-4 sm:p-6">{children}</div>
    </figure>
  );
}
