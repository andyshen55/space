export interface TeachingResource {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube or Vimeo URL
  links?: { label: string; url: string }[];
}

export const teachingResources: TeachingResource[] = [
  {
    id: "1",
    title: "Introduction to Topic",
    description: "A comprehensive introduction covering the fundamentals.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with your video ID
    links: [
      { label: "Slides", url: "https://example.com/slides1" },
      { label: "Resources", url: "https://example.com/resources1" },
    ],
  },
  {
    id: "2",
    title: "Advanced Concepts",
    description: "Deep dive into advanced topics and techniques.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with your video ID
    links: [
      { label: "Slides", url: "https://example.com/slides2" },
      { label: "Code Examples", url: "https://github.com/yourusername/examples" },
    ],
  },
  // Add more teaching resources as needed
];
