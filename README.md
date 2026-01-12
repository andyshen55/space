# Personal Portfolio Website

A modern, production-ready portfolio built with Next.js 14 (App Router) and TailwindCSS.

## Features

- **Pages**: Home (hero + bio), Teaching (video embeds), Books (carousel)
- **Full-bleed Layout**: Josh Comeau's CSS Grid pattern for breakout sections
- **Dark Mode**: Toggle with persistence via `next-themes`
- **SEO Optimized**: Metadata, Open Graph, sitemap, robots.txt
- **Accessible**: ARIA labels, keyboard navigation, semantic HTML
- **Performance**: `next/image` optimization, lazy loading

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Content

#### Profile Image
Place your profile image at `public/images/profile.jpg`

#### Book Covers
Place book cover images in `public/images/books/`

#### Update Data Files
Edit the following files with your content:
- `src/data/site.ts` - Site metadata, bio, social links
- `src/data/books.ts` - Your book data
- `src/data/teaching.ts` - Your teaching resources with video URLs

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

### Option 1: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: Via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy

### Environment Variables (Optional)

Add in Vercel dashboard:
- `NEXT_PUBLIC_SITE_URL` - Your production URL (e.g., `https://yoursite.com`)

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   ├── teaching/          # Teaching page
│   ├── books/             # Books page
│   └── globals.css        # Global styles + full-bleed
├── components/
│   ├── layout/            # Layout components
│   ├── ui/                # UI components
│   └── home/              # Home page components
├── data/                  # Data files
└── lib/                   # Utilities
```

## Customization

### Colors
Edit `tailwind.config.ts` and `src/app/globals.css` to customize the color scheme.

### Typography
Update the `fontFamily` in `tailwind.config.ts`.

### Full-Bleed Sections
Wrap any section with `<FullBleed>` to make it span the full viewport width:

```tsx
import { FullBleed } from "@/components/layout/FullBleed";

<FullBleed className="bg-muted py-16">
  <div className="wrapper">
    {/* Your content */}
  </div>
</FullBleed>
```

## License

MIT
