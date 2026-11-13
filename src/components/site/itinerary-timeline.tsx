import { Plus } from "lucide-react";
import type { ItineraryDay } from "@/data/tours";
import { getItineraryBadges } from "@/lib/itinerary";
import { cn } from "@/lib/utils";

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <ol className="mt-8">
      {days.map((day, index) => {
        const badges = getItineraryBadges(day).slice(0, 6);
        const last = index === days.length - 1;

        return (
          <li
            key={day.day}
            className="grid grid-cols-[48px_1fr] gap-5 sm:gap-6"
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold",
                  index === 0
                    ? "bg-ink text-gold-400"
                    : "border-[1.5px] border-sand-300 bg-paper text-navy-700",
                )}
              >
                {String(day.day).padStart(2, "0")}
              </span>
              {!last ? (
                <span className="my-1 min-h-8 w-0 flex-1 border-l-[1.5px] border-dashed border-sand-300" />
              ) : null}
            </div>

            <details
              open={index === 0}
              className="group pb-7 [&::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span>
                  <span className="type-label block text-gold-600">
                    Day {day.day}
                  </span>
                  <span className="type-title mt-1.5 block text-ink">
                    {day.title}
                  </span>
                </span>
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand-100 text-ink transition group-open:rotate-45 group-open:bg-ink group-open:text-gold-400">
                  <Plus className="h-4 w-4" />
                </span>
              </summary>

              <div className="mt-3">
                <p className="type-body text-navy-700">{day.description}</p>
                {badges.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span
                        key={badge.label}
                        className="rounded-full border border-sand-300 bg-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-navy-700"
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
