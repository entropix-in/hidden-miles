import { MountainSnow } from "lucide-react";
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
  text = "HIDDEN MILES · WANDER WELL · OFFBEAT JOURNEYS · ",
  tone = "gold",
  className,
}: {
  size?: number;
  text?: string;
  /** gold: the brand seal. paper: an ink passport stamp for light, busy compositions. */
  tone?: "gold" | "paper";
  className?: string;
}) {
  const id = pathId(text + tone, size);
  const paper = tone === "paper";

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center rounded-full shadow-[0_12px_32px_-14px_rgba(11,39,53,0.5)]",
        paper ? "bg-paper" : "bg-gold-400",
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
        {paper ? (
          <g fill="none" stroke="var(--color-ink)" strokeWidth="1.25">
            <circle cx="70" cy="70" r="63" />
            <circle cx="70" cy="70" r="38" />
          </g>
        ) : null}
        <text
          fill="var(--color-ink)"
          fontSize="10"
          fontWeight="600"
          fontFamily="var(--font-sans)"
        >
          {/* Fit the ring exactly (2π·50) so the phrase never overruns its own start. */}
          <textPath
            href={`#${id}`}
            startOffset="0"
            textLength="314"
            lengthAdjust="spacing"
          >
            {text}
          </textPath>
        </text>
      </svg>
      {paper ? (
        <MountainSnow
          className="relative text-ink"
          style={{ width: size * 0.26, height: size * 0.26 }}
          strokeWidth={1.5}
        />
      ) : (
        <span
          className="grid place-items-center rounded-full bg-ink font-semibold text-gold-400"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            fontSize: size * 0.2,
          }}
        >
          H
        </span>
      )}
    </span>
  );
}
