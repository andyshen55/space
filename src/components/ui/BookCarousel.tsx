"use client";

import { useRef } from "react";
import Image from "next/image";
import { Book } from "@/data/books";
import { cn } from "@/lib/utils";

interface BookCarouselProps {
  books: Book[];
  className?: string;
}

export function BookCarousel({ books, className }: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        role="region"
        aria-label="Book carousel"
        tabIndex={0}
      >
        {books.map((book) => (
          <article
            key={book.id}
            className="flex-none w-64 snap-start group"
          >
            {book.link ? (
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
              >
                <BookCard book={book} />
              </a>
            ) : (
              <BookCard book={book} />
            )}
          </article>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background/80 backdrop-blur border border-border rounded-full p-2 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Scroll left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background/80 backdrop-blur border border-border rounded-full p-2 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Scroll right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        <Image
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 256px, 256px"
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
    </div>
  );
}
