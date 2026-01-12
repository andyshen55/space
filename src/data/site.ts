export const siteConfig = {
  name: "Your Name",
  title: "Your Name - Portfolio",
  description: "Personal portfolio showcasing my work, teaching resources, and publications.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com",
  author: {
    name: "Your Name",
    bio: "A short bio about yourself. Replace this with your actual bio text.",
    image: "/images/profile.jpg", // Update with your profile image path
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Teaching", href: "/teaching" },
    { label: "Books", href: "/books" },
  ],
  social: {
    twitter: "https://twitter.com/yourusername",
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
  },
};
