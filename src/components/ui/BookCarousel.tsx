"use client";

import { useState } from "react";
import { useKeenSlider, KeenSliderPlugin } from "keen-slider/react";
import { motion, AnimatePresence } from "motion/react";
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
        perView: 6,
        spacing: 18,
      },
      breakpoints: {
        "(max-width: 1200px)": {
          slides: { perView: 3, spacing: 16 },
        },
        "(max-width: 600px)": {
          slides: { perView: 2, spacing: 14 },
        },
      },
    },
    [WheelControls]
  );

  return (
    <>
      <div className="relative">
        <div ref={sliderRef} className="keen-slider relative z-10 pb-[30px]">
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
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal
            key={selectedBook.id}
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </AnimatePresence>
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
    <div className="keen-slider__slide flex items-end justify-center h-[360px]">
      <motion.button
        onClick={onClick}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        layoutId={`book-${book.id}`}
        style={{ perspective: 700 }}
        className="relative isolate block max-w-full cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {/* Page block revealed as the cover opens. Kept fully transparent at
            rest and only faded in while hovering — so when the book is closed
            there is no cream layer that a GPU-composited 3D rotation could
            leave behind as a stray sliver. */}
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          variants={{
            rest: { opacity: 0, transition: { delay: 0.2, duration: 0.05 } },
            hover: { opacity: 1, transition: { duration: 0.05 } },
          }}
          style={{
            background:
              "linear-gradient(90deg, #efe9da 0%, #fbf9f3 14%, #fdfcf8 100%)",
            boxShadow: "inset 7px 0 9px -6px rgba(0,0,0,0.45)",
          }}
        >
          {/* Page-edge lines on the fore-edge */}
          <div
            className="absolute inset-y-[3px] right-0 w-[3px]"
            style={{
              background:
                "repeating-linear-gradient(180deg,#e7e1cf,#e7e1cf 1px,#cfc8b3 1px,#cfc8b3 2px)",
            }}
          />
        </motion.div>

        {/* Front cover, hinged on the left spine — swings open slightly on hover.
            backface-visibility + will-change keep this subtree on a stable GPU
            layer so the 3D rotation never strands a leftover paint tile. */}
        <motion.div
          variants={{ rest: { rotateY: 0 }, hover: { rotateY: -32 } }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{
            position: "relative",
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          <Image
            src={book.coverImage}
            alt={book.title}
            width={book.coverWidth}
            height={book.coverHeight}
            className="block h-auto max-h-[320px] w-auto max-w-full select-none"
            draggable={false}
            sizes="(max-width: 600px) 45vw, (max-width: 1200px) 30vw, 15vw"
            style={{
              // Outer drop shadow off the right edge (outset renders on an <img>).
              boxShadow: "6px 0 8px -3px rgba(0,0,0,0.32)",
            }}
          />
          {/* Inner edge shadows on the cover itself — left (spine) and bottom.
              Inset box-shadow doesn't show through an <img>, so it lives on this
              overlay layered above the cover. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow:
                "inset 7px 0 9px -6px rgba(0,0,0,0.45), inset 0 -7px 9px -6px rgba(0,0,0,0.40)",
            }}
          />
          {/* Shading on the inner cover as it lifts off the page */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, transparent 40%)",
            }}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}

function Shelf() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-0 h-[30px] w-full"
      aria-hidden="true"
    >
      {/* Ambient occlusion just above the surface — grounds the row of books */}
      <div className="absolute -top-4 inset-x-0 h-4 bg-gradient-to-t from-black/25 to-transparent" />

      {/* Wooden front board */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg,#8a572f 0%,#79491f 30%,#5d3717 70%,#3f2410 100%)",
          boxShadow:
            "0 12px 18px -6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {/* Wood grain */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background:
              "repeating-linear-gradient(180deg, rgba(255,235,200,0.10) 0px, rgba(0,0,0,0.10) 2px, rgba(255,235,200,0.06) 4px, rgba(0,0,0,0.08) 7px)",
          }}
        />
        {/* Dark shadow line right at the seating edge */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-b from-black/45 to-transparent" />
        {/* Front-edge highlight catching the light */}
        <div className="absolute top-[2px] inset-x-0 h-[2px] bg-white/15" />
      </div>
    </div>
  );
}
