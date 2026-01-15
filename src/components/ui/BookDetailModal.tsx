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
  const [isAnimatingFlip, setIsAnimatingFlip] = useState(false);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pointerStartX = useRef(0);
  const bookContainerRef = useRef<HTMLDivElement>(null);

  const bookWidth = isMobile ? 280 : 320;
  const bookHeight = isMobile ? 420 : 480;
  const bookDepth = 40;
  const duration = isMobile ? 0.4 : 0.6;

  // Handle click to flip with animation state
  const handleBookClick = () => {
    setIsAnimatingFlip(true);
    setIsFlipped(!isFlipped);
    setRotationX(0);
    setRotationY(0);

    // Re-enable mouse tracking after flip animation
    setTimeout(() => {
      setIsAnimatingFlip(false);
    }, duration * 1000);
  };

  // Track pointer movement for swipe detection
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const swipeDistance = e.clientX - pointerStartX.current;
    // Flip on swipe if distance > 50px
    if (Math.abs(swipeDistance) > 50) {
      setIsAnimatingFlip(true);
      setIsFlipped(!isFlipped);
      setRotationX(0);
      setRotationY(0);

      setTimeout(() => {
        setIsAnimatingFlip(false);
      }, duration * 1000);
    }
  };

  // Mouse tracking for 3D rotation effect (works even when flipped)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bookContainerRef.current || isAnimatingFlip || isMobile) return;

    const rect = bookContainerRef.current.getBoundingClientRect();

    // Calculate position relative to book center (0-1 range, centered at 0.5)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Normalize to -1 to 1 range centered at 0
    const normalizedX = (x - 0.5) * 2;
    const normalizedY = (y - 0.5) * 2;

    // Calculate rotation angles (expanded from 15 to 45 degrees)
    // X position rotates around Y axis (rotateY)
    // Y position rotates around X axis (rotateX)
    const maxRotationY = 45;
    const maxRotationX = 30;
    const newRotationY = normalizedX * maxRotationY;
    const newRotationX = -normalizedY * maxRotationX;

    setRotationX(newRotationX);
    setRotationY(newRotationY);
  };

  // Reset rotation when mouse leaves
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
                willChange: "transform",
              }}
              animate={{
                rotateY: isFlipped ? -180 + rotationY : rotationY,
                rotateX: rotationX,
              }}
              transition={{
                rotateY: isAnimatingFlip
                  ? { duration, ease: "easeInOut" }
                  : { type: "spring", stiffness: 300, damping: 30 },
                rotateX: isAnimatingFlip
                  ? { duration: duration * 0.5, ease: "easeInOut" }
                  : { type: "spring", stiffness: 300, damping: 30 },
              }}
              onClick={handleBookClick}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
            >
              {/* Front Cover */}
              <div
                style={{
                  position: "absolute",
                  width: bookWidth,
                  height: bookHeight,
                  left: "50%",
                  top: "50%",
                  backfaceVisibility: "hidden",
                  transform: `translate(-50%, -50%) translateZ(${bookDepth / 2}px)`,
                }}
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow: `
                      0 8px 16px rgba(0,0,0,0.2),
                      0 16px 32px rgba(0,0,0,0.15),
                      0 24px 48px rgba(0,0,0,0.1),
                      inset -2px 0 8px rgba(0,0,0,0.1)
                    `,
                  }}
                >
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    width={bookWidth}
                    height={bookHeight}
                    className="w-full h-full object-cover"
                    priority
                  />
                  {/* Subtle Light Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Back Cover */}
              <div
                style={{
                  position: "absolute",
                  width: bookWidth,
                  height: bookHeight,
                  left: "50%",
                  top: "50%",
                  backfaceVisibility: "hidden",
                  transform: `translate(-50%, -50%) rotateY(180deg) translateZ(${bookDepth / 2}px)`,
                }}
              >
                <div
                  className="w-full h-full overflow-hidden flex flex-col p-6 md:p-8"
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

              {/* Left Spine */}
              <div
                style={{
                  position: "absolute",
                  width: bookDepth,
                  height: bookHeight,
                  left: "50%",
                  top: "50%",
                  backfaceVisibility: "hidden",
                  pointerEvents: "none",
                  transform: `translate(-50%, -50%) rotateY(-90deg) translateZ(${bookWidth / 2}px)`,
                  background: "linear-gradient(180deg, hsl(30 20% 35%) 0%, hsl(30 25% 30%) 50%, hsl(30 20% 25%) 100%)",
                  boxShadow: `
                    inset 2px 0 4px rgba(0,0,0,0.3),
                    inset -2px 0 4px rgba(0,0,0,0.2)
                  `,
                }}
              />

              {/* Right Spine */}
              {!isMobile && (
                <div
                  style={{
                    position: "absolute",
                    width: bookDepth,
                    height: bookHeight,
                    left: "50%",
                    top: "50%",
                    backfaceVisibility: "hidden",
                    pointerEvents: "none",
                    transform: `translate(-50%, -50%) rotateY(90deg) translateZ(${bookWidth / 2}px)`,
                    background: `repeating-linear-gradient(
                      90deg,
                      #fafaf8,
                      #fafaf8 1px,
                      #f5f5f0 1px,
                      #f5f5f0 2px
                    )`,
                    boxShadow: "inset 0 0 4px rgba(0,0,0,0.15)",
                  }}
                />
              )}

              {/* Top Edge */}
              <div
                style={{
                  position: "absolute",
                  width: bookWidth,
                  height: bookDepth,
                  left: "50%",
                  top: "50%",
                  backfaceVisibility: "hidden",
                  pointerEvents: "none",
                  transform: `translate(-50%, -50%) rotateX(90deg) translateZ(${bookHeight / 2}px)`,
                  background: "linear-gradient(90deg, #f8f8f0 0%, #ffffff 50%, #f8f8f0 100%)",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              />

              {/* Bottom Edge */}
              <div
                style={{
                  position: "absolute",
                  width: bookWidth,
                  height: bookDepth,
                  left: "50%",
                  top: "50%",
                  backfaceVisibility: "hidden",
                  pointerEvents: "none",
                  transform: `translate(-50%, -50%) rotateX(-90deg) translateZ(${bookHeight / 2}px)`,
                  background: "linear-gradient(90deg, #f8f8f0 0%, #ffffff 50%, #f8f8f0 100%)",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              />
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
