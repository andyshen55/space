import { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { books } from "@/data/books";
import { courses } from "@/data/courses";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString();

  const routes = ["", "/teaching", "/books"].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // One entry per book so crawlers discover every /books/[slug] page.
  const bookRoutes = books.map((book) => ({
    url: `${siteConfig.url}/books/${book.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // One entry per course so crawlers discover every /teaching/[slug] page.
  const courseRoutes = courses.map((course) => ({
    url: `${siteConfig.url}/teaching/${course.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...routes, ...bookRoutes, ...courseRoutes];
}
