export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string; // Path to image in /public/images/
  description?: string;
  link?: string; // Optional purchase/info link
}

export const books: Book[] = [
  {
    id: "1",
    title: "Book Title 1",
    author: "Author Name",
    coverImage: "/images/books/book1.jpg",
    description: "A brief description of the book.",
    link: "https://example.com/book1",
  },
  {
    id: "2",
    title: "Book Title 2",
    author: "Author Name",
    coverImage: "/images/books/book2.jpg",
    description: "A brief description of the book.",
    link: "https://example.com/book2",
  },
  {
    id: "3",
    title: "Book Title 3",
    author: "Author Name",
    coverImage: "/images/books/book3.jpg",
    description: "A brief description of the book.",
    link: "https://example.com/book3",
  },
  // Add more books as needed
];
