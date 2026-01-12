import Image from "next/image";
import { siteConfig } from "@/data/site";

export function Hero() {
  return (
    <section className="py-12 md:py-20">
      <div className="flex flex-col items-center text-center gap-8">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-border">
          <Image
            src={siteConfig.author.image}
            alt={siteConfig.author.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 128px, 160px"
          />
        </div>

        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {siteConfig.author.name}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {siteConfig.author.bio}
          </p>
        </div>
      </div>
    </section>
  );
}
