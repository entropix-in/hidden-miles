import { cn } from "@/lib/utils";

function pathId(text: string, size: number) {
  let hash = size;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return `stamp-${hash.toString(36)}`;
}

export function Stamp({
  size = 140,
  text = "HIDDEN MILES · SINCE 1984 · WANDER WELL · ",
  className,
}: {
  size?: number;
  text?: string;
  className?: string;
}) {
  const id = pathId(text, size);

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center rounded-full bg-gold-400 shadow-[0_12px_32px_-14px_rgba(11,39,53,0.5)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 140"
        width={size}
        height={size}
        className="absolute inset-0"
      >
        <defs>
          <path
            id={id}
            d="M 70,70 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
            fill="none"
          />
        </defs>
        <text
          fill="var(--color-ink)"
          fontSize="10.2"
          fontWeight="800"
          letterSpacing="2.1"
          fontFamily="var(--font-sans)"
        >
          <textPath href={`#${id}`} startOffset="0">
            {text}
          </textPath>
        </text>
      </svg>
      <span
        className="grid place-items-center rounded-full bg-ink font-display text-gold-400"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          fontSize: size * 0.2,
        }}
      >
        H
      </span>
    </span>
  );
}
