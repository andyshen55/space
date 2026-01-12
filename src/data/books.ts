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
    title: "Between the World and Me",
    author: "Ta-Nehisi Coates",
    coverImage: "/books/between-the-world-and-me.jpeg",
  },
  {
    id: "2",
    title: "East of Eden",
    author: "John Steinbeck",
    coverImage: "/books/east-of-eden.jpeg",
  },
  {
    id: "3",
    title: "Hard-Boiled Wonderland and the End of the World",
    author: "Haruki Murakami",
    coverImage: "/books/hard-boiled-wonderland-and-the-end-of-the-world.jpeg",
  },
  {
    id: "4",
    title: "Kafka on the Shore",
    author: "Haruki Murakami",
    coverImage: "/books/kafka-on-the-shore.jpeg",
  },
  {
    id: "5",
    title: "Stories of Your Life and Others",
    author: "Ted Chiang",
    coverImage: "/books/stories-of-your-life-and-others.jpeg",
  },
  {
    id: "6",
    title: "The Brothers Karamazov",
    author: "Fyodor Dostoevsky",
    coverImage: "/books/the-brothers-karamazov.jpeg",
  },
  {
    id: "7",
    title: "The Gene: An Intimate History",
    author: "Siddhartha Mukherjee",
    coverImage: "/books/the-gene.jpeg",
  },
  {
    id: "8",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    coverImage: "/books/the-seven-husbands-of-evelyn-hugo.jpeg",
  },
  {
    id: "9",
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    coverImage: "/books/the-way-of-kings.jpeg",
  },
  {
    id: "10",
    title: "When Breath Becomes Air",
    author: "Paul Kalanithi",
    coverImage: "/books/when-breath-becomes-air.jpeg",
  },
];
