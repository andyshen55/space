# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Building and production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm lint             # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS with PostCSS
- **Language**: TypeScript (strict mode)
- **Theme Management**: next-themes (system/light/dark toggle)
- **Carousel**: keen-slider (mouse wheel support via custom plugin)
- **Image Optimization**: Next.js Image component with AVIF/WebP formats

## Architecture Overview

### Layout System: Full-Bleed Pattern

This project uses Josh Comeau's CSS Grid pattern for full-bleed sections. The core is in `src/app/globals.css`:

- **`.wrapper`** class: Standard content container with max-width, centered on the page
- **`FullBleed`** component: Wraps sections to break out to full viewport width while keeping inner content constrained

All pages wrap their content in `<main className="flex-1 wrapper">` (set in root layout). To make a section full-bleed, use the `<FullBleed>` component.

### Content Data Files

Content is stored in `src/data/`:

- **`site.ts`**: Centralized config (site name, URL, nav links, social URLs, author bio, SEO defaults)
- **`books.ts`**: Array of book objects with `id`, `title`, `coverImage` path, and metadata
- **`teaching.ts`**: Array of teaching resource objects with video URLs

These files are imported into page components and rendered via map functions. Updates to site metadata, navigation, or content should go here first.

### Page Structure

- **Root layout** (`src/app/layout.tsx`): Sets up ThemeProvider, applies root metadata, renders Header/Footer/main
- **Home** (`src/app/page.tsx`): Uses Hero and Bio components
- **Teaching** (`src/app/teaching/page.tsx`): Imports teaching data, renders VideoEmbed components
- **Books** (`src/app/books/page.tsx`): Renders BookCarousel component

### Key Components

**UI Components** (`src/components/ui/`):
- **`BookCarousel`**: Keen-slider carousel with custom wheel controls plugin, responsive breakpoints (8/4/3 slides per view), and shelf graphic overlay
- **`VideoEmbed`**: Wraps iframe for video embeds with aspect ratio preservation
- **`DarkModeToggle`**: Client-side theme switcher using next-themes

**Layout Components** (`src/components/layout/`):
- **`Header`**: Sticky navigation with active route detection, dark mode toggle
- **`Footer`**: Site-wide footer
- **`FullBleed`**: CSS Grid breakout wrapper

**Home Components** (`src/components/home/`):
- **`Hero`**: Hero section with profile image and bio

### Styling Conventions

- **Color system**: Defined in `tailwind.config.ts` as CSS variables (background, foreground, border, accent, muted, etc.)
- **Utility function**: `cn()` in `src/lib/utils.ts` combines clsx + tailwind-merge for safe class composition
- **Global styles**: `src/app/globals.css` contains reset, full-bleed grid setup, and utility classes

### Image Handling

- Profile image: `public/images/profile.jpg`
- Book covers: `public/images/books/` (referenced in `src/data/books.ts`)
- Other assets: `public/` root
- Next.js Image component is used throughout for automatic optimization (AVIF/WebP)

### SEO and Metadata

- **Dynamic metadata**: Root layout uses `siteConfig` from `src/data/site.ts` for title templates, Open Graph, and Twitter cards
- **Static routes**: `robots.ts` and `sitemap.ts` in `src/app/` for SEO
- **Social preview**: Uses OG image at `${siteConfig.url}/og-image.png`

### Environment Variables

- **`NEXT_PUBLIC_SITE_URL`**: Set in production (optional, defaults to `https://yoursite.com`)
- Must be prefixed with `NEXT_PUBLIC_` to be accessible in client code

## Development Workflow

1. **Update content**: Modify `src/data/site.ts`, `src/data/books.ts`, or `src/data/teaching.ts`
2. **Add sections**: Create new page in `src/app/` or new component in `src/components/`
3. **Style**: Use TailwindCSS classes; update colors in `tailwind.config.ts` if needed
4. **Test dark mode**: Theme toggle persists across page reloads via next-themes
5. **Lint before commit**: `npm lint` catches TypeScript and ESLint issues
