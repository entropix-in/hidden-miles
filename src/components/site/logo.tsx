import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  light = false,
  compact = false,
  className,
}: {
  light?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Hidden Miles home"
      className={cn("group flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "relative shrink-0 transition duration-500 group-hover:scale-[1.04]",
          compact ? "h-10 w-10" : "h-12 w-12",
        )}
      >
        <Image
          src="/logo.png"
          alt=""
          fill
          priority
          sizes={compact ? "40px" : "48px"}
          className="object-contain drop-shadow-sm"
        />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display font-semibold tracking-tight",
            compact ? "text-[22px]" : "text-[26px]",
            light ? "text-sand-50" : "text-navy-950",
          )}
        >
          Hidden Miles
        </span>
        <span
          className={cn(
            "block text-sm font-extrabold uppercase",
            compact
              ? "mt-0.5 text-[11px] tracking-[0.22em]"
              : "mt-1 tracking-[0.28em]",
            light ? "text-sand-200/75" : "text-blue-700",
          )}
        >
          Offbeat journeys
        </span>
      </span>
    </Link>
  );
}
