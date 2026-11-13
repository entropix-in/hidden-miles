import Link from "next/link";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  dark = false,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  dark?: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-2.5", className)}
    >
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2.5">
            {index ? (
              <span
                aria-hidden="true"
                className={cn(
                  "text-sm",
                  dark ? "text-white/30" : "text-sand-300",
                )}
              >
                /
              </span>
            ) : null}
            {last || !item.href ? (
              <span
                className={cn(
                  "text-[13px] font-bold",
                  dark ? "text-paper" : "text-ink",
                )}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "text-[13px] font-medium transition",
                  dark
                    ? "text-navy-200 hover:text-paper"
                    : "text-navy-500 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
