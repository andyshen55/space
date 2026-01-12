import type { Metadata } from "next";
import Image from "next/image";
import { books } from "@/data/books";
import { BookCarousel } from "@/components/ui/BookCarousel";
import { FullBleed } from "@/components/layout/FullBleed";

export const metadata: Metadata = {
  title: "Books",
  description: "Recommended books and publications.",
};

export default function BooksPage() {
  return (
    <div className="py-12 space-y-16">
      <div>
        <h1 className="text-4xl font-bold mb-4">Books</h1>
        <p className="text-lg text-muted-foreground">
          A collection of books I&apos;ve read, written, or recommend.
        </p>
      </div>

      {/* Full-bleed carousel section */}
      <FullBleed className="bg-muted py-12">
        <div className="wrapper">
          <h2 className="text-2xl font-bold mb-8">Featured Books</h2>
          <BookCarousel books={books} />
        </div>
      </FullBleed>

      {/* Grid view as alternative */}
      <section>
        <h2 className="text-2xl font-bold mb-8">All Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <article key={book.id} className="group">
              {book.link ? (
                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block space-y-3 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
                >
                  <BookCard book={book} />
                </a>
              ) : (
                <div className="space-y-3">
                  <BookCard book={book} />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function BookCard({ book }: { book: typeof books[0] }) {
  return (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        <Image
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>
      <div>
        <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        {book.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {book.description}
          </p>
        )}
      </div>
    </>
  );
}
