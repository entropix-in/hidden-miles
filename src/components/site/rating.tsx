import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  score,
  count,
  dark = false,
  className,
}: {
  score: string | number;
  count?: string | number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Star
        className={cn(
          "h-3.5 w-3.5 fill-gold-400 text-gold-400",
          dark && "fill-gold-400",
        )}
      />
      <span
        className={cn(
          "text-sm font-bold",
          dark ? "text-paper" : "text-ink",
        )}
      >
        {score}
      </span>
      {count ? (
        <span
          className={cn(
            "text-sm font-medium",
            dark ? "text-navy-200" : "text-navy-400",
          )}
        >
          ({count})
        </span>
      ) : null}
    </span>
  );
}
