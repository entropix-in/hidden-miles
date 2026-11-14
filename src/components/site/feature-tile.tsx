import { cn } from "@/lib/utils";

export function FeatureTile({
  icon,
  title,
  description,
  number,
  dark = false,
  roomy = false,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  number?: string;
  dark?: boolean;
  roomy?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[20px] border",
        roomy ? "p-8" : "p-7",
        dark
          ? "border-white/10 bg-white/[0.04]"
          : "border-sand-300 bg-paper",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className={cn(
            "grid h-[52px] w-[52px] place-items-center rounded-[16px]",
            dark ? "bg-gold-400 text-ink" : "bg-sand-200 text-ink",
          )}
        >
          {icon}
        </span>
        {number ? (
          <span
            className={cn(
              "type-h4 font-display italic",
              dark ? "text-white/20" : "text-sand-300",
            )}
          >
            {number}
          </span>
        ) : null}
      </div>
      <div>
        <h3
          className={cn(
            "type-title",
            dark ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "type-small",
            roomy ? "mt-4" : "mt-1.5",
            dark ? "text-navy-200" : "text-navy-500",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
