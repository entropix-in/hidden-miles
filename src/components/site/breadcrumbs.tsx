import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  light = false,
}: {
  items: Array<{ label: string; href?: string }>;
  light?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm font-bold uppercase tracking-wider",
        light ? "text-sand-200/70" : "text-stone-500",
      )}
    >
      <Link
        href="/"
        className={cn(
          "transition",
          light ? "hover:text-blue-300" : "hover:text-blue-700",
        )}
      >
        Home
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight
            className={cn(
              "h-3 w-3",
              light ? "text-sand-200/40" : "text-stone-300",
            )}
          />
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                "transition",
                light ? "hover:text-blue-300" : "hover:text-blue-700",
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span className={light ? "text-sand-50" : "text-navy-950"}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
