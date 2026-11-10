"use client";

import { useMemo, useState } from "react";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/data/site";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

export function TestimonialsExplorer({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const tours = useMemo(
    () =>
      Array.from(
        new Set(
          testimonials
            .map((testimonial) => testimonial.tour.trim())
            .filter(Boolean),
        ),
      ).sort(),
    [testimonials],
  );

  const [tour, setTour] = useState("All stories");
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = [...testimonials];

    if (tour !== "All stories") {
      list = list.filter((testimonial) => testimonial.tour === tour);
    }

    if (sort === "oldest") {
      list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    } else if (sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }

    return list;
  }, [sort, testimonials, tour]);

  const shown = filtered.slice(0, visible);

  function chooseTour(next: string) {
    setTour(next);
    setVisible(PAGE_SIZE);
  }

  return (
    <section className="container-page py-12 sm:py-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => chooseTour("All stories")}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider transition",
              tour === "All stories"
                ? "border-navy-950 bg-navy-950 text-sand-50"
                : "border-stone-200 bg-white text-stone-600 hover:border-blue-400 hover:text-blue-700",
            )}
          >
            All stories
            <span className="ml-1.5 opacity-60">{testimonials.length}</span>
          </button>

          {tours.map((item) => {
            const count = testimonials.filter(
              (testimonial) => testimonial.tour === item,
            ).length;

            return (
              <button
                key={item}
                type="button"
                onClick={() => chooseTour(item)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] font-bold transition",
                  tour === item
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-stone-200 bg-white text-stone-500 hover:border-blue-300 hover:text-blue-700",
                )}
              >
                {item}
                <span className="ml-1.5 opacity-50">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label
            htmlFor="testimonial-sort"
            className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400"
          >
            Sort by
          </label>
          <select
            id="testimonial-sort"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-[11px] font-bold text-navy-950 outline-none focus:border-blue-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>
      </div>

      <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
        Showing {shown.length} of {filtered.length}{" "}
        {filtered.length === 1 ? "story" : "stories"}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((testimonial) => (
          <article
            key={`${testimonial.name}-${testimonial.tour}-${testimonial.createdAt ?? 0}`}
            className="flex h-full flex-col rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_14px_50px_-38px_rgba(11,39,53,0.45)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-0.5 text-gold-500">
                {Array.from({
                  length: Math.min(5, Math.max(1, testimonial.rating)),
                }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
              <Quote className="h-8 w-8 text-sand-300" />
            </div>

            <blockquote className="mt-4 flex-1 text-[14px] leading-7 text-stone-600">
              “{testimonial.quote}”
            </blockquote>

            {testimonial.tour ? (
              <span className="mt-5 inline-flex w-fit rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                {testimonial.tour}
              </span>
            ) : null}

            <footer className="mt-5 flex items-center gap-3 border-t border-dashed border-stone-200 pt-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-950 font-display text-sm font-semibold text-blue-300">
                {testimonial.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold text-navy-950">
                  {testimonial.name}
                </p>
                <p className="truncate text-[11px] font-semibold text-stone-400">
                  {testimonial.city || "Traveller"}
                </p>
              </div>
              {testimonial.createdAt ? (
                <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                  }).format(new Date(testimonial.createdAt))}
                </span>
              ) : null}
            </footer>
          </article>
        ))}
      </div>

      {visible < filtered.length ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((current) => current + PAGE_SIZE)}
            className="btn-outline"
          >
            Load more stories
          </button>
        </div>
      ) : null}
    </section>
  );
}
