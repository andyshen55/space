import { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { books } from "@/data/books";

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

  return [...routes, ...bookRoutes];
}
