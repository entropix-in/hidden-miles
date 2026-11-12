import {
  BedDouble,
  BusFront,
  Coffee,
  Compass,
  Footprints,
  Mountain,
  Plus,
  Ship,
  Sun,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ItineraryDay } from "@/data/tours";

type BadgeTone = "meal" | "stay" | "travel" | "experience" | "leisure";

type BadgeRule = {
  pattern: RegExp;
  label: string;
  icon: LucideIcon;
  tone: BadgeTone;
};

const badgeRules: BadgeRule[] = [
  { pattern: /breakfast/i, label: "Breakfast", icon: Coffee, tone: "meal" },
  { pattern: /lunch|sadya/i, label: "Lunch", icon: UtensilsCrossed, tone: "meal" },
  {
    pattern: /dinner|wazwan|seafood/i,
    label: "Dinner",
    icon: Wine,
    tone: "meal",
  },
  {
    pattern: /meals? (?:included|cooked|on board)|on board/i,
    label: "Meals included",
    icon: UtensilsCrossed,
    tone: "meal",
  },
  {
    pattern: /tea (?:estate|tasting|garden)/i,
    label: "Tea tasting",
    icon: Coffee,
    tone: "meal",
  },
  { pattern: /houseboat/i, label: "Houseboat stay", icon: Ship, tone: "stay" },
  {
    pattern: /hotel|resort|homestay|heritage stay|overnight/i,
    label: "Overnight stay",
    icon: BedDouble,
    tone: "stay",
  },
  {
    pattern: /transfer|airport|flight|train|coach|inter-city/i,
    label: "Transfer",
    icon: BusFront,
    tone: "travel",
  },
  {
    pattern: /gondola|cable car/i,
    label: "Gondola ride",
    icon: Mountain,
    tone: "experience",
  },
  {
    pattern: /shikara/i,
    label: "Shikara ride",
    icon: Ship,
    tone: "experience",
  },
  {
    pattern: /cruise|boat ride|boat safari/i,
    label: "Boat ride",
    icon: Ship,
    tone: "experience",
  },
  {
    pattern: /safari|wildlife/i,
    label: "Wildlife safari",
    icon: Footprints,
    tone: "experience",
  },
  {
    pattern: /walk|trek|hike/i,
    label: "Guided walk",
    icon: Compass,
    tone: "experience",
  },
  {
    pattern: /workshop|performance|temple|monastery|museum|fort|palace/i,
    label: "Culture & sights",
    icon: Compass,
    tone: "experience",
  },
  {
    pattern: /leisure|free time|at your own pace|relaxed/i,
    label: "Free time",
    icon: Sun,
    tone: "leisure",
  },
];

const toneStyles: Record<BadgeTone, string> = {
  meal: "border-gold-200 bg-gold-50 text-gold-800",
  stay: "border-blue-200 bg-blue-50 text-blue-800",
  travel: "border-navy-200 bg-navy-50 text-navy-800",
  experience: "border-stone-200 bg-white text-stone-700",
  leisure: "border-sand-300 bg-sand-100 text-stone-600",
};

function badgesFor(day: ItineraryDay) {
  const text = `${day.title} ${day.description}`;
  const badges: BadgeRule[] = [];

  for (const rule of badgeRules) {
    if (!rule.pattern.test(text)) continue;
    if (badges.some((badge) => badge.label === rule.label)) continue;
    // A houseboat already covers the stay badge for that day.
    if (
      rule.label === "Overnight stay" &&
      badges.some((badge) => badge.label === "Houseboat stay")
    ) {
      continue;
    }
    badges.push(rule);
    if (badges.length === 4) break;
  }

  if (!badges.length) {
    badges.push({
      pattern: /./,
      label: "Sightseeing",
      icon: Compass,
      tone: "experience",
    });
  }

  return badges;
}

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <ol className="relative mt-8">
      <span
        aria-hidden
        className="absolute bottom-8 left-7 top-8 w-px bg-gradient-to-b from-blue-300 via-stone-300 to-stone-200 sm:left-8"
      />
      {days.map((day, index) => {
        const badges = badgesFor(day);

        return (
          <li
            key={day.day}
            className="relative grid grid-cols-[56px_1fr] items-start gap-4 pb-4 last:pb-0 sm:grid-cols-[64px_1fr] sm:gap-6"
          >
            <div className="relative z-10 flex justify-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-950 text-sand-50 shadow-lg shadow-navy-950/20 ring-4 ring-sand-50 sm:h-16 sm:w-16">
                <span className="text-center leading-none">
                  <span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-300">
                    Day
                  </span>
                  <span className="mt-1 block font-display text-xl font-semibold sm:text-2xl">
                    {day.day}
                  </span>
                </span>
              </span>
            </div>

            <details
              open={index === 0}
              className="group overflow-hidden rounded-3xl border border-stone-200 bg-white transition duration-300 open:border-blue-200 open:shadow-xl open:shadow-navy-950/5"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3 p-5 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold leading-6 text-navy-950">
                    {day.title}
                  </h3>
                  {badges.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {badges.map((badge) => (
                        <span
                          key={badge.label}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${toneStyles[badge.tone]}`}
                        >
                          <badge.icon className="h-3 w-3" strokeWidth={2.5} />
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand-100 text-navy-950 transition duration-300 group-open:rotate-45 group-open:bg-navy-950 group-open:text-blue-300">
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <div className="px-5 pb-5 sm:pl-[68px]">
                <p className="text-sm leading-7 text-stone-600">
                  {day.description}
                </p>
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
