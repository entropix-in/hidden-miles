import { cn } from "@/lib/utils";

export function FeatureTile({
  icon,
  title,
  description,
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
        roomy ? "p-7" : "p-6",
        dark
          ? "border-white/10 bg-white/[0.04]"
          : "border-sand-300 bg-paper",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-[14px]",
            dark ? "bg-gold-400 text-ink" : "bg-sand-200 text-ink",
          )}
        >
          {icon}
        </span>
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
            "mt-1.5",
            dark ? "text-navy-200" : "text-navy-500",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
