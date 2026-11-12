import {
  BedDouble,
  BusFront,
  Compass,
  Plus,
  Sun,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ItineraryBadgeKind, ItineraryDay } from "@/data/tours";
import { getItineraryBadges, itineraryBadgeKindLabels } from "@/lib/itinerary";

type BadgeTone = ItineraryBadgeKind;

type DisplayBadge = {
  label: string;
  icon: LucideIcon;
  tone: BadgeTone;
};

const kindIcons: Record<BadgeTone, LucideIcon> = {
  meal: UtensilsCrossed,
  stay: BedDouble,
  travel: BusFront,
  experience: Compass,
  leisure: Sun,
};


const toneStyles: Record<BadgeTone, string> = {
  meal: "border-gold-200 bg-gold-50 text-gold-800",
  stay: "border-blue-200 bg-blue-50 text-blue-800",
  travel: "border-navy-200 bg-navy-50 text-navy-800",
  experience: "border-stone-200 bg-white text-stone-700",
  leisure: "border-sand-300 bg-sand-100 text-stone-600",
};

function badgesFor(day: ItineraryDay): DisplayBadge[] {
  return getItineraryBadges(day)
    .slice(0, 8)
    .map((badge) => ({
      label: badge.label,
      icon: kindIcons[badge.kind] ?? Compass,
      tone: badge.kind,
    }));
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
                      {badges.map((badge, badgeIndex) => (
                        <span
                          key={`${badge.label}-${badgeIndex}`}
                          title={itineraryBadgeKindLabels[badge.tone]}
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
