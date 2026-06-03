"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Book } from "@/data/books";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { BookSpread } from "./BookSpread";

interface BookDetailModalProps {
  book: Book;
  // Called once the close animation has finished playing in place. The parent
  // (BookModalRoute) then unmounts this modal via AnimatePresence, which lets the
  // shared `layoutId` cover fly back to the shelf and finally navigates back.
  onClose: () => void;
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const duration = isMobile ? 0.6 : 0.75;

  // Open the book into a two-page spread once it has flown in from the shelf
  useEffect(() => {
    const t = setTimeout(() => setIsOpen(true), 280);
    return () => clearTimeout(t);
  }, []);

  // Close the cover in place, then hand off to the parent to unmount (fly back).
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setIsOpen(false);
    setTimeout(onClose, duration * 1000 + 40);
  }, [isClosing, onClose, duration]);

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-4"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <BookSpread book={book} isOpen={isOpen} interactive />
      </div>

      {/* Hint + close button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: isClosing ? 0 : 1, y: isClosing ? 16 : 0 }}
        transition={{ delay: isClosing ? 0 : 0.5, duration: 0.35 }}
        className="mt-8 flex flex-col items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-medium text-white/70">
          {isMobile ? "Tap outside to close" : "Click outside or press Esc to close"}
        </p>
        <button
          onClick={handleClose}
          className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
