import { cn } from "@/lib/utils";

function contourPath(
  index: number,
  width: number,
  height: number,
  cx: number,
  cy: number,
  seed: number,
) {
  const radius = 60 + index * 52;
  const points: string[] = [];

  for (let step = 0; step < 73; step += 1) {
    const angle = (step / 72) * Math.PI * 2;
    const wobble =
      radius *
      (1 +
        0.12 * Math.sin(3 * angle + seed + index * 0.4) +
        0.06 * Math.cos(5 * angle - index * 0.7));
    const x = width * cx + wobble * Math.cos(angle) * 1.35;
    const y = height * cy + wobble * Math.sin(angle);
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  return `M${points.join(" L")} Z`;
}

export function Contours({
  className,
  color = "rgba(255,255,255,0.06)",
  strokeWidth = 1.2,
  count = 9,
  cx = 0.78,
  cy = 0.35,
  seed = 1,
}: {
  className?: string;
  color?: string;
  strokeWidth?: number;
  count?: number;
  cx?: number;
  cy?: number;
  seed?: number;
}) {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <path
          key={index}
          d={contourPath(index, 1440, 900, cx, cy, seed)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      ))}
    </svg>
  );
}
