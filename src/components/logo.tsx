import Link from "next/link";
import { cn } from "@/lib/utils";

function HiddenMilesMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Hidden Miles logo"
      className={className}
    >
      <rect width="48" height="48" rx="14" fill="#062a26" />
      <path
        d="M10.5 35c5.6-1.4 7.7-7 10.7-12 2.2-3.7 5.2-6.9 9.6-8.2"
        fill="none"
        stroke="#fff8ed"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.1 5.4"
      />
      <circle cx="11" cy="35" r="3.6" fill="#fb7c12" />
      <circle cx="35" cy="13.5" r="6.6" fill="#fb7c12" />
      <path
        d="M35 3.3v2.6M35 21.1v2.6M24.4 13.5h2.6M43 13.5h2.6"
        stroke="#fff8ed"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M31.6 15.8l2.2-2.4 2.4 2.7"
        fill="none"
        stroke="#062a26"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl shadow-lg shadow-forest-950/20 transition duration-500 group-hover:rotate-[-6deg]">
        <HiddenMilesMark className="h-11 w-11" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-[26px] font-semibold tracking-tight",
            light ? "text-cream-50" : "text-forest-950",
          )}
        >
          Hidden Miles
        </span>
        <span
          className={cn(
            "mt-1 block text-[9px] font-extrabold uppercase tracking-[0.28em]",
            light ? "text-cream-200/75" : "text-saffron-700",
          )}
        >
          Offbeat journeys
        </span>
      </span>
    </Link>
  );
}
