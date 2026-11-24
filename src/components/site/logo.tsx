import Image from "next/image";
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
  const dimension = Math.round(56 * scale);

  return (
    <Link
      href="/"
      aria-label="Hidden Miles home"
      className={cn("group inline-flex shrink-0 items-center gap-3", className)}
    >
      <Image
        src="/logo.png"
        alt=""
        width={dimension}
        height={dimension}
        priority={compact}
        className="transition duration-500 group-hover:rotate-[-3deg]"
        style={{ width: dimension, height: dimension }}
      />
      <span
        className={cn(
          "whitespace-nowrap font-display font-semibold leading-none tracking-[-0.02em]",
          light ? "text-paper" : "text-ink",
        )}
        style={{ fontSize: Math.round(22 * scale) }}
      >
        Hidden Miles
      </span>
    </Link>
  );
}
