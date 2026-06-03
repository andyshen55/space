import { books } from "@/data/books";
import { BooksView } from "@/components/ui/BooksView";

// BooksView (shelf + URL-driven modal) lives here so it persists across /books
// and /books/[slug] — the carousel never remounts and the book cover flies
// smoothly between the shelf and the open spread. `children` carries the
// per-route content (crawlable text for /books/[slug]).
export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BooksView books={books} />
      {children}
    </>
  );
}
