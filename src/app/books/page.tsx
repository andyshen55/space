import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Books",
  description: "Recommended books and publications.",
};

// The shelf and modal are rendered by the layout (BooksView) so they persist
// across /books and /books/[slug]. The bare shelf needs nothing more here.
export default function BooksPage() {
  return null;
}
