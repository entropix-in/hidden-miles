import { cn } from "@/lib/utils";

/** Onion dome sitting on a baseline, `w` wide and `h` tall, centred on `cx`. */
function dome(cx: number, base: number, w: number, h: number) {
  const r = w / 2;
  return `M${cx - r} ${base} C${cx - r} ${base - h * 0.6} ${cx - r * 0.5} ${base - h * 0.85} ${cx} ${base - h} C${cx + r * 0.5} ${base - h * 0.85} ${cx + r} ${base - h * 0.6} ${cx + r} ${base} Z`;
}

/** Slim minaret with a pointed cap. */
function minaret(x: number, top: number, base: number, w = 6) {
  return `M${x} ${base} L${x} ${top} L${x + w} ${top} L${x + w} ${base} Z M${x - 2} ${top} L${x + w / 2} ${top - 9} L${x + w + 2} ${top} Z`;
}

const monuments = [
  // Qutub-style tapered tower
  "M34 180 L38 70 L46 70 L50 180 Z M36 70 L42 58 L48 70 Z",
  // Taj Mahal: plinth, hall, great dome, chhatris, minarets
  "M100 150 H240 V180 H100 Z",
  "M125 118 H215 V150 H125 Z",
  dome(170, 118, 60, 42),
  "M169 62 H171 V78 H169 Z",
  dome(138, 118, 20, 16),
  dome(202, 118, 20, 16),
  minaret(104, 96, 150),
  minaret(230, 96, 150),
  // Temple shikhara and mandapa
  "M290 180 V140 H300 C304 110 312 92 320 70 C328 92 336 110 340 140 H350 V180 Z M319 58 H321 V72 H319 Z",
  "M350 180 V152 C356 142 366 142 372 152 V180 Z",
  // Mosque
  "M420 150 H530 V180 H420 Z",
  dome(475, 150, 60, 34),
  minaret(424, 118, 150, 5),
  minaret(521, 118, 150, 5),
  // Palace with chhatris
  "M570 144 H690 V180 H570 Z",
  dome(595, 144, 24, 18),
  dome(630, 144, 24, 18),
  dome(665, 144, 24, 18),
];

/** A faint, misty line of Indian monuments that sits behind the hero. */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 180"
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      // Mist: fade out at both ends and into the ground.
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 18%, #000 72%, transparent), linear-gradient(to bottom, #000 45%, transparent)",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <path
        d="M0 180 V150 Q60 128 130 140 T260 132 T400 140 T560 130 T720 144 V180 Z"
        fill="var(--color-navy-100)"
        opacity="0.6"
      />
      <g fill="var(--color-navy-200)" opacity="0.45">
        {monuments.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
    </svg>
  );
}
