import Link from "next/link";
import { Sunrise } from "lucide-react";
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
      aria-label="Safarnest home"
      className={cn("group flex items-center gap-3", className)}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-saffron-600 text-white shadow-lg shadow-saffron-950/20 transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-saffron-500">
        <Sunrise className="h-6 w-6" strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-[26px] font-semibold tracking-tight",
            light ? "text-cream-50" : "text-forest-950",
          )}
        >
          Safarnest
        </span>
        <span
          className={cn(
            "mt-1 block text-[9px] font-extrabold uppercase tracking-[0.3em]",
            light ? "text-cream-200/75" : "text-saffron-700",
          )}
        >
          Holidays & Experiences
        </span>
      </span>
    </Link>
  );
}
