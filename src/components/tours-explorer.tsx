"use client";

import { useMemo, useState } from "react";
import { Filter, RotateCcw, SearchX, SlidersHorizontal } from "lucide-react";
import { TourCard } from "@/components/tour-card";
import type { Destination } from "@/data/destinations";
import type { Experience } from "@/data/experiences";
import type { Tour } from "@/data/tours";
import { cn } from "@/lib/utils";

const months = [
  "Any month",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const regions = ["All", "India", "International"] as const;

export function ToursExplorer({
  tours,
  destinations,
  experiences,
  initialDestination = "",
  initialExperience = "",
  initialMonth = "",
}: {
  tours: Tour[];
  destinations: Destination[];
  experiences: Experience[];
  initialDestination?: string;
  initialExperience?: string;
  initialMonth?: string;
}) {
  const [destination, setDestination] = useState(initialDestination);
  const [experience, setExperience] = useState(initialExperience);
  const [region, setRegion] = useState<(typeof regions)[number]>("All");
  const [month, setMonth] = useState(
    months.includes(initialMonth) ? initialMonth : "Any month",
  );
  const [sort, setSort] = useState("recommended");

  const filtered = useMemo(() => {
    let list = [...tours];

    if (destination) {
      list = list.filter((tour) => tour.destinationSlug === destination);
    }
    if (region !== "All") {
      list = list.filter((tour) => tour.region === region);
    }
    if (experience) {
      list = list.filter((tour) => tour.experiences.includes(experience));
    }
    if (month !== "Any month") {
      list = list.filter(
        (tour) =>
          tour.departure.includes(month) || /every|daily/i.test(tour.departure),
      );
    }

    if (sort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort(
        (a, b) =>
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          b.rating - a.rating,
      );
    }

    return list;
  }, [destination, experience, month, region, sort, tours]);

  const hasFilters =
    Boolean(destination) ||
    Boolean(experience) ||
    region !== "All" ||
    month !== "Any month";

  function resetFilters() {
    setDestination("");
    setExperience("");
    setRegion("All");
    setMonth("Any month");
    setSort("recommended");
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="rounded-[30px] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_-38px_rgba(6,42,38,0.5)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-stone-500">
            <SlidersHorizontal className="h-4 w-4 text-saffron-600" />
            Filter your journey
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-full border border-stone-200 bg-cream-50 px-4 py-2 text-xs font-bold text-forest-950 outline-none focus:border-saffron-500"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegion(item)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition",
                region === item
                  ? "border-forest-950 bg-forest-950 text-cream-50"
                  : "border-stone-200 bg-cream-50 text-stone-600 hover:border-saffron-400 hover:text-saffron-700",
              )}
            >
              {item === "All" ? "All journeys" : item}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExperience("")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition",
              !experience
                ? "border-saffron-500 bg-saffron-50 text-saffron-800"
                : "border-stone-200 text-stone-500 hover:border-stone-300",
            )}
          >
            All experiences
          </button>
          {experiences.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setExperience(item.slug)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition",
                experience === item.slug
                  ? "border-saffron-500 bg-saffron-50 text-saffron-800"
                  : "border-stone-200 text-stone-500 hover:border-stone-300",
              )}
            >
              {item.shortTitle}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 border-t border-dashed border-stone-200 pt-5 sm:grid-cols-[1fr_1fr_auto]">
          <label>
            <span className="field-label">Destination</span>
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="field py-2.5"
            >
              <option value="">All destinations</option>
              {destinations.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Departure month</span>
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="field py-2.5"
            >
              {months.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters && sort === "recommended"}
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 px-5 text-xs font-extrabold uppercase tracking-wider text-stone-600 transition hover:border-saffron-400 hover:text-saffron-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-saffron-700">
            <Filter className="h-3.5 w-3.5" />
            {filtered.length} {filtered.length === 1 ? "journey" : "journeys"} found
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-forest-950 sm:text-3xl">
            {destination
              ? `Journeys to ${destinations.find((item) => item.slug === destination)?.name ?? "your destination"}`
              : "All Hidden Miles journeys"}
          </h2>
        </div>
        {month !== "Any month" ? (
          <p className="rounded-full bg-cream-200 px-4 py-2 text-[11px] font-bold text-forest-900">
            Looking for {month} departures
          </p>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tour, index) => (
            <TourCard key={tour.slug} tour={tour} priority={index < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[30px] border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream-200 text-saffron-700">
            <SearchX className="h-6 w-6" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-semibold text-forest-950">
            Nothing matches those filters — yet.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
            Try a different month or experience, or let our team build something
            entirely around you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={resetFilters} className="btn-outline">
              <RotateCcw className="h-4 w-4" />
              Clear filters
            </button>
            <a href="/contact" className="btn-primary">
              Build my holiday
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
