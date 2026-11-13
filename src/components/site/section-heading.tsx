import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Kicker({
  number,
  label,
  dark = false,
  className,
}: {
  number?: string;
  label: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("kicker", dark && "kicker-dark", className)}>
      {number ? (
        <>
          <span className="kicker-num">No. {number}</span>
          <span className="kicker-rule" aria-hidden="true" />
        </>
      ) : null}
      <span className="kicker-label">{label}</span>
    </p>
  );
}

export function SectionHeading({
  number,
  label,
  title,
  accent,
  description,
  href,
  linkLabel,
  right,
  dark = false,
  align = "left",
  className,
}: {
  number?: string;
  label: string;
  title: string;
  accent?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  right?: React.ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-2xl",
          align === "center" && "flex flex-col items-center text-center",
        )}
      >
        <Kicker number={number} label={label} dark={dark} />
        <h2
          className={cn(
            "type-h2 mt-5",
            dark ? "text-paper" : "text-ink",
          )}
        >
          {title}
          {accent ? (
            <>
              <br />
              <span className="accent-line">{accent}</span>
            </>
          ) : null}
        </h2>
        {description ? (
          <p
            className={cn(
              "type-lead mt-5 max-w-xl",
              dark ? "text-navy-200" : "text-navy-700",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {right ??
        (href && linkLabel ? (
          <Link
            href={href}
            className={cn(
              "group inline-flex shrink-0 items-center gap-2 text-sm font-bold transition",
              dark
                ? "text-gold-400 hover:text-gold-300"
                : "text-blue-700 hover:text-blue-800",
            )}
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        ) : null)}
    </div>
  );
}
