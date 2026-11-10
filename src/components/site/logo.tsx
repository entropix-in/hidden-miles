import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Hidden Miles home"
      className={cn("group flex items-center gap-3", className)}
    >
      <span className="relative h-12 w-12 shrink-0 transition duration-500 group-hover:scale-[1.04]">
        <Image
          src="/logo.png"
          alt=""
          fill
          priority
          sizes="48px"
          className="object-contain drop-shadow-sm"
        />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-[26px] font-semibold tracking-tight",
            light ? "text-sand-50" : "text-navy-950",
          )}
        >
          Hidden Miles
        </span>
        <span
          className={cn(
            "mt-1 block text-[9px] font-extrabold uppercase tracking-[0.28em]",
            light ? "text-sand-200/75" : "text-blue-700",
          )}
        >
          Offbeat journeys
        </span>
      </span>
    </Link>
  );
}
