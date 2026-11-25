import { Minus, Plus } from "lucide-react";
import type { ItineraryDay } from "@/data/tours";
import { getItineraryBadges } from "@/lib/itinerary";
import { PageContentBlocks } from "./page-content-blocks";
import { cn } from "@/lib/utils";

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <ol className="mt-6">
      {days.map((day, index) => {
        const badges = getItineraryBadges(day);
        const last = index === days.length - 1;

        return (
          <li
            key={day.day}
            className="grid grid-cols-[40px_1fr] gap-4 sm:gap-5"
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold",
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
              className="group min-w-0 pb-6 [&::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="type-title mt-1 block text-ink">
                  {day.title}
                </span>
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand-100 text-ink transition group-open:bg-ink group-open:text-gold-400">
                  <Plus className="h-4 w-4 group-open:hidden" />
                      <Minus className="hidden h-4 w-4 group-open:block" />
                </span>
              </summary>

              <div className="mt-3">
                {!day.contentBlocks?.some((block) => block.type === "text") && day.description && (
                  <p className="type-body text-navy-700">{day.description}</p>
                )}
                <PageContentBlocks blocks={day.contentBlocks} />
                {badges.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span
                        key={`${badge.kind}-${badge.label}`}
                        className="rounded-full border border-sand-300 bg-paper px-3 py-1 text-xs font-semibold text-navy-700"
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
