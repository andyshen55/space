"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Book } from "@/data/books";
import { siteConfig } from "@/data/site";
import { BookCarousel } from "./BookCarousel";
import { BookDetailModal } from "./BookDetailModal";

/**
 * Persistent books view. Lives in books/layout.tsx so the shelf stays mounted
 * across /books and /books/[slug] — clicking a book never remounts the carousel,
 * and the Framer Motion `layoutId` cover flies smoothly between the shelf and the
 * modal.
 *
 * The URL is the single source of truth for which book is open: a slug in the
 * path opens the modal (and the carousel centers that book), whether we got there
 * by an in-app click or a direct visit / shared link. In-app opens use
 * history.pushState (instant, no RSC fetch) so the centering → open transition
 * stays seamless.
 */
export function BooksView({ books }: { books: Book[] }) {
  const pathname = usePathname();
  const router = useRouter();
  // Tracks whether we opened the current book via pushState, so close can simply
  // pop that history entry rather than pushing a new /books entry.
  const openedViaPush = useRef(false);

  const slug = pathname?.startsWith("/books/")
    ? decodeURIComponent(pathname.slice("/books/".length))
    : null;
  const activeBook = slug ? books.find((b) => b.slug === slug) ?? null : null;

  // Only the book that actually flies between the shelf and the modal carries a
  // `layoutId`. If every cover were a layout node, keen-slider's scroll (which
  // transforms slides outside React's render cycle) would leave motion with a
  // stale baseline and animate all 10 covers when the modal's shared-layout tears
  // down on close. We set this when opening and keep it through the close
  // animation (cleared on exit), so the fly-back still works.
  const [flyingId, setFlyingId] = useState<string | null>(
    activeBook?.id ?? null
  );

  // Keep the flying book in sync when the active book changes from outside a
  // click (direct load, browser back/forward). Never clears here — the close
  // animation needs the id to persist until the modal has finished exiting.
  useEffect(() => {
    // Intentional sync-on-change: when the active book changes from outside a
    // click (direct load, back/forward) we must update the flying id, but never
    // clear it here — the close animation needs it to persist until the modal
    // has finished exiting, so this can't be derived during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeBook && flyingId !== activeBook.id) setFlyingId(activeBook.id);
  }, [activeBook, flyingId]);

  // In-app opens use history.pushState, which doesn't re-run generateMetadata —
  // so sync the tab title to match what a direct visit to the route would show
  // (`<book title> | <site>` from the layout's title template, and `Books | <site>`
  // for the bare shelf). On real navigations Next manages the title itself; these
  // values match, so there's no conflict.
  useEffect(() => {
    document.title = activeBook
      ? `${activeBook.title} | ${siteConfig.name}`
      : `Books | ${siteConfig.name}`;
  }, [activeBook]);

  const openBook = useCallback((book: Book) => {
    openedViaPush.current = true;
    // Mark the cover as the flying element before the modal mounts so motion
    // measures its (already centered) position as the flight origin.
    setFlyingId(book.id);
    // Shallow URL update — Next syncs usePathname without an RSC fetch.
    window.history.pushState(null, "", `/books/${book.slug}`);
  }, []);

  const closeBook = useCallback(() => {
    if (openedViaPush.current) {
      openedViaPush.current = false;
      window.history.back();
    } else {
      // Opened by a direct visit: navigate back to the shelf.
      router.push("/books");
    }
  }, [router]);

  return (
    <>
      <div className="py-12">
        <h1 className="text-4xl font-bold mb-4">Books</h1>
        <p className="text-lg text-muted-foreground">
          A collection of books I&apos;ve read, written, or recommend.
        </p>
      </div>

      <div className="full-bleed py-16">
        <BookCarousel books={books} activeSlug={slug} onActivate={openBook} flyingId={flyingId} />
      </div>

      <AnimatePresence onExitComplete={() => setFlyingId(null)}>
        {activeBook && (
          <BookDetailModal
            key={activeBook.id}
            book={activeBook}
            onClose={closeBook}
          />
        )}
      </AnimatePresence>
    </>
  );
}
