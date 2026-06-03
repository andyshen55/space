"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useKeenSlider, KeenSliderPlugin } from "keen-slider/react";
import { motion } from "motion/react";
import Image from "next/image";
import { Book } from "@/data/books";
import "keen-slider/keen-slider.min.css";

interface BookCarouselProps {
  books: Book[];
  // Slug of the book currently open (from the URL), or null on the bare shelf.
  activeSlug: string | null;
  // Called once a clicked book has been centered (or immediately if it already
  // was). The parent opens the book by updating the URL.
  onActivate: (book: Book) => void;
  // Id of the one book that flies to/from the modal. Only this cover gets a
  // `layoutId`; giving every cover one makes them all animate on close because
  // keen-slider scrolls them via transforms outside motion's render cycle.
  flyingId: string | null;
}

// keen-slider <Link> as a motion component so the cover can carry layoutId /
// hover variants while still being a real, crawlable anchor.
const MotionLink = motion.create(Link);

// ease-in-out cubic: accelerate from rest, decelerate into center
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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

export function BookCarousel({
  books,
  activeSlug,
  onActivate,
  flyingId,
}: BookCarouselProps) {
  // Book queued to open once the carousel finishes centering it on click.
  const pendingActivate = useRef<Book | null>(null);
  const activeIndex = activeSlug
    ? books.findIndex((b) => b.slug === activeSlug)
    : -1;

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      mode: "free-snap",
      // Center the active book on direct loads of /books/[slug].
      initial: activeIndex >= 0 ? activeIndex : 0,
      // origin "center" makes the active slide sit in the middle, so moveToIdx
      // centers a clicked book before it opens.
      slides: {
        perView: 6,
        spacing: 18,
        origin: "center",
      },
      breakpoints: {
        "(max-width: 1200px)": {
          slides: { perView: 3, spacing: 16, origin: "center" },
        },
        "(max-width: 600px)": {
          slides: { perView: 2, spacing: 14, origin: "center" },
        },
      },
      // Fires when any slider animation settles — including the centering move
      // kicked off on click. Open the queued book once it's centered.
      animationEnded() {
        if (pendingActivate.current) {
          const book = pendingActivate.current;
          pendingActivate.current = null;
          onActivate(book);
        }
      },
    },
    [WheelControls]
  );

  // Center a slide by index, taking the shortest path around the loop. Returns
  // true if a move was started (false if it was already centered).
  const centerIdx = useCallback(
    (idx: number) => {
      const slider = instanceRef.current;
      const details = slider?.track.details;
      if (!slider || !details || details.rel === idx) return false;
      const len = books.length;
      let diff = idx - details.rel;
      if (diff > len / 2) diff -= len;
      if (diff < -len / 2) diff += len;
      slider.moveToIdx(details.abs + diff, true, {
        duration: 450,
        easing: easeInOutCubic,
      });
      return true;
    },
    [instanceRef, books.length]
  );

  // When the open book changes from outside a click (direct load, browser
  // back/forward), bring it to center.
  useEffect(() => {
    if (activeIndex >= 0) centerIdx(activeIndex);
  }, [activeIndex, centerIdx]);

  const handleBookClick = useCallback(
    (e: React.MouseEvent, book: Book, idx: number) => {
      // Let modified clicks (new tab / new window) use the real href.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (centerIdx(idx)) {
        // Open once centering settles (see animationEnded).
        pendingActivate.current = book;
      } else {
        onActivate(book);
      }
    },
    [centerIdx, onActivate]
  );

  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider relative z-10 pb-[30px]">
        {books.map((book, idx) => (
          <BookSlide
            key={book.id}
            book={book}
            isFlying={book.id === flyingId}
            onClick={(e) => handleBookClick(e, book, idx)}
          />
        ))}
      </div>
      <Shelf />
    </div>
  );
}

function BookSlide({
  book,
  isFlying,
  onClick,
}: {
  book: Book;
  isFlying: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="keen-slider__slide flex items-end justify-center h-[360px]">
      <MotionLink
        href={`/books/${book.slug}`}
        onClick={onClick}
        aria-label={book.title}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        // Only the flying cover is a shared-layout node — see flyingId in BooksView.
        layoutId={isFlying ? `book-${book.id}` : undefined}
        // Match the modal: no opacity crossfade so the cover stays fully opaque
        // as it flies back to the shelf on close.
        layoutCrossfade={false}
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
      </MotionLink>
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
