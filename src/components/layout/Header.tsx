"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="wrapper py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded"
          >
            {siteConfig.name}
          </Link>

          <div className="flex items-center gap-6">
            <ul className="flex items-center gap-6">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded px-1",
                      pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <DarkModeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
