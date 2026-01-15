"use client";

import { useState } from "react";
import { useKeenSlider, KeenSliderPlugin } from "keen-slider/react";
import { motion } from "motion/react";
import Image from "next/image";
import { Book } from "@/data/books";
import { BookDetailModal } from "./BookDetailModal";
import "keen-slider/keen-slider.min.css";

interface BookCarouselProps {
  books: Book[];
}

// WheelControls plugin - converts mouse wheel events to drag events for horizontal scrolling
const WheelControls: KeenSliderPlugin = (slider) => {
  let touchTimeout: ReturnType<typeof setTimeout>;
  let position: { x: number; y: number };
  let wheelActive: boolean;

  function dispatch(e: WheelEvent, name: string) {
    position.x -= e.deltaX;
    position.y -= e.deltaY;
    slider.container.dispatchEvent(
      new CustomEvent(name, {
        detail: { x: position.x, y: position.y },
      })
    );
  }

  function wheelStart(e: WheelEvent) {
    position = { x: e.pageX, y: e.pageY };
    dispatch(e, "ksDragStart");
  }

  function wheel(e: WheelEvent) {
    dispatch(e, "ksDrag");
  }

  function wheelEnd(e: WheelEvent) {
    dispatch(e, "ksDragEnd");
  }

  function eventWheel(e: WheelEvent) {
    e.preventDefault();
    if (!wheelActive) {
      wheelStart(e);
      wheelActive = true;
    }
    wheel(e);
    clearTimeout(touchTimeout);
    touchTimeout = setTimeout(() => {
      wheelActive = false;
      wheelEnd(e);
    }, 50);
  }

  slider.on("created", () => {
    slider.container.addEventListener("wheel", eventWheel, {
      passive: false,
    });
  });
};

export function BookCarousel({ books }: BookCarouselProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      mode: "free-snap",
      slides: {
        perView: 8,
        spacing: 15,
      },
      breakpoints: {
        "(max-width: 1200px)": {
          slides: { perView: 4, spacing: 12 },
        },
        "(max-width: 600px)": {
          slides: { perView: 3, spacing: 10 },
        },
      },
    },
    [WheelControls]
  );

  return (
    <>
      <div className="relative">
        <div ref={sliderRef} className="keen-slider pb-16">
          {books.map((book) => (
            <BookSlide
              key={book.id}
              book={book}
              onClick={() => setSelectedBook(book)}
            />
          ))}
        </div>
        <Shelf />
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  );
}

function BookSlide({
  book,
  onClick,
}: {
  book: Book;
  onClick?: () => void;
}) {
  return (
    <div className="keen-slider__slide flex items-end justify-center h-[300px]">
      <motion.button
        onClick={onClick}
        className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent rounded"
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.95 }}
        layoutId={`book-${book.id}`}
      >
        <Image
          src={book.coverImage}
          alt={book.title}
          width={150}
          height={225}
          className="w-auto h-auto max-h-[280px] object-contain
            transition-opacity duration-200 group-hover:opacity-50
            select-none"
          draggable={false}
          sizes="(max-width: 600px) 120px, (max-width: 1200px) 150px, 180px"
        />
      </motion.button>
    </div>
  );
}

function Shelf() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 w-full h-16 shadow-2xl"
      aria-hidden="true"
    >
      <Image
        src="/books/shelf_full.jpeg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
    </div>
  );
}
