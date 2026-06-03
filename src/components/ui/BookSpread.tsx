"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Book } from "@/data/books";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface BookSpreadProps {
  book: Book;
  // Controlled open state: false = closed cover, true = opened two-page spread.
  isOpen: boolean;
  // Enable mouse-tracked tilt while open (desktop only). Off for non-interactive use.
  interactive?: boolean;
}

/**
 * The 3D open-book spread. Shared between the in-app modal (BookDetailModal) and
 * the standalone /books/[slug] page so both render identical markup.
 *
 * The outer `layoutId` element is the shared-layout target that flies between the
 * shelf cover (in BookCarousel) and this spread. Open/close is driven by the
 * `isOpen` prop so the consumer controls timing.
 */
export function BookSpread({ book, isOpen, interactive = false }: BookSpreadProps) {
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sceneRef = useRef<HTMLDivElement>(null);

  // Rendered client-side, so window is available for viewport-relative sizing.
  const [vw] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [vh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 768
  );

  // Mobile: one big page sized to the viewport. Desktop: fixed two-page spread.
  const pageWidth = isMobile ? Math.min(340, vw - 40) : 300;
  const pageHeight = isMobile
    ? Math.min(Math.round(pageWidth * 1.5), vh - 170)
    : 450;
  // Desktop slides the spread right to stay centered; mobile keeps the single page centered.
  const openShiftX = isMobile ? 0 : pageWidth / 2;
  const duration = isMobile ? 0.6 : 0.75;

  // Subtle mouse-tracked tilt while the spread is open (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneRef.current || !isOpen || !interactive || isMobile) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltY(nx * 12);
    setTiltX(-ny * 8);
  };

  const handleMouseLeave = () => {
    setTiltX(0);
    setTiltY(0);
  };

  const pageFace: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    overflow: "hidden",
  };

  return (
    // Perspective stage for the 3D book
    <div style={{ perspective: isMobile ? "1400px" : "2200px" }}>
      {/* layoutId element flies between the shelf and the spread (cover-sized) */}
      <motion.div
        layoutId={`book-${book.id}`}
        style={{
          width: pageWidth,
          height: pageHeight,
          position: "relative",
        }}
        // Keep the cover fully opaque during the shared-layout flight. By default
        // motion crossfades opacity between the shelf element and this one, which
        // makes the book look semi-transparent while it travels.
        layoutCrossfade={false}
      >
        {/* Scene: holds the right page + opening cover leaf, shifts to re-center the spread */}
        <motion.div
          ref={sceneRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
          }}
          animate={{
            x: isOpen ? openShiftX : 0,
            rotateX: tiltX,
            rotateY: tiltY,
          }}
          transition={{
            x: { duration, ease: [0.33, 0, 0.2, 1] },
            rotateX: { type: "spring", stiffness: 120, damping: 16 },
            rotateY: { type: "spring", stiffness: 120, damping: 16 },
          }}
        >
          {/* RIGHT PAGE — revealed underneath the cover (right half of the spread) */}
          <div
            style={{
              position: "absolute",
              width: pageWidth,
              height: pageHeight,
              left: 0,
              top: 0,
              transformStyle: "preserve-3d",
              background: "linear-gradient(180deg, #fdfcf7 0%, #f6f3e9 100%)",
              boxShadow:
                "0 18px 40px rgba(0,0,0,0.35), 0 6px 14px rgba(0,0,0,0.2)",
            }}
          >
            <PageContent variant={isMobile ? "single" : "right"} book={book} />
            {/* Gutter shadow near the spine (left edge) */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-12"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.06) 45%, transparent 100%)",
              }}
            />
            {/* Stacked-pages edge on the right */}
            <div
              className="pointer-events-none absolute inset-y-1 -right-[3px] w-[3px]"
              style={{
                background:
                  "repeating-linear-gradient(180deg,#e9e4d4,#e9e4d4 1px,#cfc9b6 1px,#cfc9b6 2px)",
              }}
            />
          </div>

          {/* LEFT LEAF — the cover that opens (front = cover art, back = left page) */}
          <motion.div
            style={{
              position: "absolute",
              width: pageWidth,
              height: pageHeight,
              left: 0,
              top: 0,
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
            }}
            animate={{ rotateY: isOpen ? -180 : 0 }}
            transition={{ duration, ease: [0.45, 0.05, 0.2, 1] }}
          >
            {/* FRONT FACE — book cover (visible when closed) */}
            <div style={{ ...pageFace, transform: "translateZ(1px)" }}>
              <Image
                src={book.coverImage}
                alt={book.title}
                width={pageWidth}
                height={pageHeight}
                className="h-full w-full object-cover"
                priority
                draggable={false}
              />
              {/* Spine binding hint on the left edge */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-3"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.08) 60%, transparent 100%)",
                }}
              />
              {/* Glossy highlight */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10" />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow:
                    "0 18px 40px rgba(0,0,0,0.4), 0 6px 14px rgba(0,0,0,0.25)",
                }}
              />
            </div>

            {/* BACK FACE — inside-cover / left page (visible when open) */}
            <div
              style={{
                ...pageFace,
                transform: "rotateY(180deg) translateZ(1px)",
                background: "linear-gradient(180deg, #fdfcf7 0%, #f6f3e9 100%)",
              }}
            >
              {/* Desktop: left page shows title + author. Mobile: plain inside cover. */}
              {!isMobile && <PageContent variant="left" book={book} />}
              {/* Gutter shadow near the spine (right edge) */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-12"
                style={{
                  background:
                    "linear-gradient(270deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.06) 45%, transparent 100%)",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Page content. Desktop spread: "left" = title + author, "right" = description + notes.
// Mobile: "single" = everything on one scrollable page.
export function PageContent({
  variant,
  book,
}: {
  variant: "left" | "right" | "single";
  book: Book;
}) {
  // Desktop left page — title + author, centered like a title page
  if (variant === "left") {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-8 text-center"
        style={{ fontFamily: '"Georgia", serif' }}
      >
        <h2 className="mb-3 text-2xl font-bold leading-tight text-gray-800">
          {book.title}
        </h2>
        <div className="mb-3 h-px w-10 bg-gray-300" />
        <p className="text-sm italic text-gray-500">{book.author}</p>
      </div>
    );
  }

  // Desktop right page — description + reading notes
  if (variant === "right") {
    return (
      <div
        className="flex h-full flex-col p-8"
        style={{ fontFamily: '"Georgia", serif' }}
      >
        <p className="mb-4 text-sm leading-relaxed text-gray-700">
          {book.description}
        </p>
        <div className="mb-3 border-b border-gray-300 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Reading Notes
          </h3>
        </div>
        <p className="flex-1 overflow-y-auto text-sm leading-relaxed text-gray-700">
          {book.notes || "No notes yet."}
        </p>
      </div>
    );
  }

  // Mobile single page — everything, scrollable
  return (
    <div
      className="flex h-full flex-col overflow-y-auto p-6"
      style={{ fontFamily: '"Georgia", serif' }}
    >
      <h2 className="mb-1 text-xl font-bold leading-tight text-gray-800">
        {book.title}
      </h2>
      <p className="mb-4 text-sm italic text-gray-500">{book.author}</p>
      <p className="mb-4 text-sm leading-relaxed text-gray-700">
        {book.description}
      </p>
      <div className="mb-3 border-b border-gray-300 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Reading Notes
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">
        {book.notes || "No notes yet."}
      </p>
    </div>
  );
}
