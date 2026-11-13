import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  light = false,
  compact = false,
  size = 1,
  className,
}: {
  light?: boolean;
  compact?: boolean;
  size?: number;
  className?: string;
}) {
  const scale = compact ? 0.82 : size;
  const mark = Math.round(42 * scale);

  return (
    <Link
      href="/"
      aria-label="Hidden Miles home"
      className={cn("group inline-flex shrink-0 items-center gap-3", className)}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-[12px] transition duration-500 group-hover:rotate-[-3deg]",
          light ? "bg-gold-400" : "bg-ink",
        )}
        style={{ width: mark, height: mark }}
      >
        <span
          className={cn(
            "font-display font-semibold leading-none",
            light ? "text-ink" : "text-gold-400",
          )}
          style={{ fontSize: Math.round(22 * scale) }}
        >
          H
        </span>
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block whitespace-nowrap font-display font-semibold leading-none tracking-[-0.02em]",
            light ? "text-paper" : "text-ink",
          )}
          style={{ fontSize: Math.round(22 * scale) }}
        >
          Hidden Miles
        </span>
        <span
          className={cn(
            "mt-1.5 block whitespace-nowrap font-extrabold uppercase leading-none tracking-[0.22em]",
            light ? "text-gold-400" : "text-gold-600",
          )}
          style={{ fontSize: Math.max(8, Math.round(9 * scale)) }}
        >
          Est. 1984 · Mumbai
        </span>
      </span>
    </Link>
  );
}
