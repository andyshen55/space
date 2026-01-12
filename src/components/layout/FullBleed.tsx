import { cn } from "@/lib/utils";

interface FullBleedProps {
  children: React.ReactNode;
  className?: string;
}

export function FullBleed({ children, className }: FullBleedProps) {
  return <div className={cn("full-bleed", className)}>{children}</div>;
}
