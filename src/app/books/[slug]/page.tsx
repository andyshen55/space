import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { books, getBookBySlug } from "@/data/books";
import { siteConfig } from "@/data/site";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

// Statically generate a page for every book at build time (SSG, crawlable).
export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return {};

  const url = `${siteConfig.url}/books/${book.slug}`;
  const title = `${book.title} — ${book.author}`;

  return {
    title: book.title,
    description: book.description,
    alternates: { canonical: url },
    openGraph: {
      type: "book",
      url,
      title,
      description: book.description,
      images: [
        {
          url: book.coverImage,
          width: book.coverWidth,
          height: book.coverHeight,
          alt: book.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: book.description,
      images: [book.coverImage],
    },
  };
}

// The visible book (shelf + open spread) is rendered by the layout's BooksView,
// driven by the URL. This page supplies the per-book metadata above, triggers a
// 404 for unknown slugs, and renders a semantic, crawler-friendly summary of the
// book so the page has clean indexable text even without JS.
export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) notFound();

  // schema.org Book markup, with the reading notes modeled as a Review by the
  // site author. JSON.stringify drops the undefined branches when a book has no
  // link/notes.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    description: book.description,
    image: `${siteConfig.url}${book.coverImage}`,
    url: `${siteConfig.url}/books/${book.slug}`,
    ...(book.link ? { sameAs: book.link } : {}),
    ...(book.notes
      ? {
          review: {
            "@type": "Review",
            reviewBody: book.notes,
            author: { "@type": "Person", name: siteConfig.author.name },
            ...(book.rating
              ? {
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: book.rating,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="sr-only">
        <h1>
          {book.title} by {book.author}
        </h1>
        <p>{book.description}</p>
        <h2>Reading Notes</h2>
        <p>{book.notes}</p>
        {book.link && (
          <a href={book.link} target="_blank" rel="noopener noreferrer">
            More about {book.title}
          </a>
        )}
      </article>
    </>
  );
}
