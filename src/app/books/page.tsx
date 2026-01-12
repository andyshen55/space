import type { Metadata } from "next";
import { books } from "@/data/books";
import { BookCarousel } from "@/components/ui/BookCarousel";

export const metadata: Metadata = {
  title: "Books",
  description: "Recommended books and publications.",
};

export default function BooksPage() {
  return (
    <>
      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">Books</h1>
        <p className="text-lg text-muted-foreground">
          A collection of books I&apos;ve read, written, or recommend.
        </p>
      </div>

      <div className="full-bleed py-16">
        <BookCarousel books={books} />
      </div>
    </>
  );
}
