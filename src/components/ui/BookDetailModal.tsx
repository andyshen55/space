"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Book } from "@/data/books";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pointerStartX = useRef(0);
  const bookContainerRef = useRef<HTMLDivElement>(null);

  const bookWidth = isMobile ? 280 : 320;
  const bookHeight = isMobile ? 420 : 480;
  const duration = isMobile ? 0.4 : 0.6;

  // Handle click to flip (also reset rotation)
  const handleBookClick = () => {
    setIsFlipped(!isFlipped);
    setRotationX(0);
    setRotationY(0);
  };

  // Track pointer movement for swipe detection
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const swipeDistance = e.clientX - pointerStartX.current;
    // Flip on swipe if distance > 50px
    if (Math.abs(swipeDistance) > 50) {
      setIsFlipped(!isFlipped);
    }
  };

  // Mouse tracking for 3D rotation effect (only when book is not flipped)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bookContainerRef.current || isFlipped || isMobile) return;

    const rect = bookContainerRef.current.getBoundingClientRect();

    // Calculate position relative to book center (0-1 range, centered at 0.5)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Normalize to -1 to 1 range centered at 0
    const normalizedX = (x - 0.5) * 2;
    const normalizedY = (y - 0.5) * 2;

    // Calculate rotation angles (max 15 degrees)
    // X position rotates around Y axis (rotateY)
    // Y position rotates around X axis (rotateX)
    const maxRotation = 15;
    const newRotationY = normalizedX * maxRotation;
    const newRotationX = -normalizedY * maxRotation;

    setRotationX(newRotationX);
    setRotationY(newRotationY);
  };

  // Reset rotation when mouse leaves or book is flipped
  const handleMouseLeave = () => {
    setRotationX(0);
    setRotationY(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        {/* Book Container - No opacity change, only scale */}
        <motion.div
          layoutId={`book-${book.id}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration,
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative"
        >
          {/* 3D Perspective Container - responds to mouse movement */}
          <div
            ref={bookContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: "1200px" }}
          >
            {/* 3D Book Wrapper - flips on click, rotates with mouse */}
            <motion.div
              style={{
                width: bookWidth,
                height: bookHeight,
                transformStyle: "preserve-3d",
                position: "relative",
              }}
              animate={{
                rotateY: isFlipped ? -180 : rotationY,
                rotateX: isFlipped ? 0 : rotationX,
              }}
              transition={{
                rotateY: isFlipped ? { duration, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 30, duration: 0 },
                rotateX: isFlipped ? { duration: 0.3 } : { type: "spring", stiffness: 300, damping: 30, duration: 0 },
              }}
              onClick={handleBookClick}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
            >
              {/* Front Face - Book Cover */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                }}
              >
                {/* Book Cover Container with 3D Effect */}
                <div
                  className="relative w-full h-full"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateY(-5deg) rotateX(2deg)",
                    boxShadow: `
                      0 8px 16px rgba(0,0,0,0.2),
                      0 16px 32px rgba(0,0,0,0.15),
                      0 24px 48px rgba(0,0,0,0.1),
                      inset -2px 0 8px rgba(0,0,0,0.1)
                    `,
                  }}
                >
                  {/* Book Cover Image */}
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    width={bookWidth}
                    height={bookHeight}
                    className="w-full h-full object-cover rounded-lg"
                    priority
                  />

                  {/* Book Spine - Right Edge */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-black/40 to-transparent"
                    style={{
                      transform: "rotateY(90deg)",
                      transformOrigin: "right",
                      boxShadow: "-2px 0 4px rgba(0,0,0,0.3)",
                    }}
                  />

                  {/* Subtle Light Reflection */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Back Face - Notes */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  transform: "rotateY(180deg)",
                }}
              >
                <div
                  className="w-full h-full rounded-lg overflow-hidden flex flex-col p-6 md:p-8"
                  style={{
                    background: "linear-gradient(135deg, #f5f5f0 0%, #e8e8e0 100%)",
                    boxShadow: `
                      0 8px 16px rgba(0,0,0,0.2),
                      0 16px 32px rgba(0,0,0,0.15),
                      0 24px 48px rgba(0,0,0,0.1)
                    `,
                  }}
                >
                  {/* Notes Header */}
                  <div className="mb-4 pb-4 border-b border-gray-400">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      Reading Notes
                    </h3>
                  </div>

                  {/* Notes Content */}
                  <div className="flex-1 overflow-y-auto">
                    <p
                      className="text-sm leading-relaxed text-gray-700"
                      style={{
                        fontFamily: '"Georgia", serif',
                      }}
                    >
                      {book.notes || "No notes yet."}
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-400 text-center">
                    <p className="text-xs text-gray-500 italic">
                      Flip back to cover
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interaction Hints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-6 text-center space-y-2"
          >
            <p className="text-xs text-muted-foreground font-medium">
              {isMobile ? "Tap or swipe to flip" : "Click to flip"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mx-auto block px-6 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
