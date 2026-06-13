import type { Metadata } from "next";
import { drawings } from "@/data/drawings";
import { DrawingStack } from "@/components/art/DrawingStack";

export const metadata: Metadata = {
  title: "Art",
  description:
    "A stack of my drawings — click or swipe through the sheets, rewind to go back. It loops, so the pile never runs out.",
};

export default function ArtPage() {
  return (
    <>
      <div className="py-12">
        <h1 className="mb-4 text-4xl font-bold">Art</h1>
        <p className="text-lg text-muted-foreground">
          A pile of drawings. Click or swipe a sheet to flip it off the top and
          reveal the next; rewind to bring one back. Flip past the last and it
          loops around to the start.
        </p>
      </div>

      <DrawingStack drawings={drawings} />
    </>
  );
}
