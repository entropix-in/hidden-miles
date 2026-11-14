"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Rating } from "@/components/site/rating";
import type { Testimonial } from "@/data/site";
import { cn } from "@/lib/utils";

const avatarColours = ["bg-blue-500", "bg-gold-600", "bg-navy-500", "bg-danger"];

function initials(name: string) {
  return name
    .split(" ")
    .filter((word) => /[A-Za-z]/.test(word[0] ?? ""))
    .map((word) => word[0])
    .join("")
    .slice(0, 2);
}

export function TestimonialCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [index, setIndex] = useState(0);

  if (!testimonials.length) return null;

  const total = testimonials.length;
  const active = testimonials[index % total];

  function goTo(next: number) {
    setIndex(((next % total) + total) % total);
  }

  return (
    <figure
      className="flex flex-col gap-6 self-center rounded-[28px] bg-paper p-8 text-ink lg:p-11"
      aria-roledescription="carousel"
      aria-label="Guest reviews"
    >
      <span className="type-display h-10 leading-none text-gold-400">“</span>

      <div aria-live="polite" aria-atomic="true">
        <blockquote className="font-display text-[24px] leading-9 text-ink">
          {active.quote}
        </blockquote>

        <div className="mt-6 flex items-center gap-3.5">
          <span
            className={cn(
              "grid h-[52px] w-[52px] place-items-center rounded-full text-sm font-bold text-white",
              avatarColours[index % avatarColours.length],
            )}
            aria-hidden="true"
          >
            {initials(active.name)}
          </span>
          <span>
            <span className="block text-[15px] font-bold text-ink">
              {active.name}
            </span>
            <span className="block text-sm font-medium text-navy-500">
              {[active.tour, active.city].filter(Boolean).join(" · ")}
            </span>
          </span>
        </div>

        <span className="sr-only">
          Review {index + 1} of {total}
        </span>
      </div>

      <div className="route-line" />

      <div className="flex items-center justify-between gap-4">
        <Rating score="4.9" count="12,400+" />

        {total > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous review"
              className="grid h-11 w-11 place-items-center rounded-full bg-sand-200 text-ink transition hover:bg-sand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next review"
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold-400 transition hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
