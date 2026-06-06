export const siteConfig = {
  name: "Andy Shen",
  title: "Andy Shen",
  description:
    "Math-circle courses, favorite puzzles, and reading notes — by Andy Shen.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com", // TODO: set real domain via NEXT_PUBLIC_SITE_URL
  author: {
    name: "Andy Shen",
    bio: "I teach math to curious kids at the UCLA Olga Radko Endowed Math Circle (ORMC) — building courses that climb from a concrete game or puzzle up to the real mathematics underneath. This site collects those courses, a few puzzles I keep coming back to, and notes on what I'm reading.",
    image: "/images/profile.jpg", // TODO: update with a real profile image path
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Teaching", href: "/teaching" },
    { label: "Books", href: "/books" },
    { label: "Puzzles", href: "/puzzles" },
  ],
  social: {
    twitter: "https://twitter.com/yourusername",
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
  },
};
