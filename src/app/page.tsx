import { Hero } from "@/components/home/Hero";
import { FullBleed } from "@/components/layout/FullBleed";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Example of a full-bleed section */}
      <FullBleed className="bg-muted py-16 my-16">
        <div className="wrapper">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Welcome</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This is an example of a full-bleed section that spans the entire
              width of the page. You can customize this section with your own
              content.
            </p>
          </div>
        </div>
      </FullBleed>

      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">About</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            Add additional content about yourself here. You can include your
            background, experience, interests, or any other information you&apos;d
            like to share with visitors.
          </p>
        </div>
      </section>
    </>
  );
}
