import { cn } from "@/lib/utils";

interface VideoEmbedProps {
  url: string;
  title: string;
  className?: string;
}

export function VideoEmbed({ url, title, className }: VideoEmbedProps) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
      <div className="aspect-video">
        <iframe
          src={url}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
