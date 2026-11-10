"use client";

import { useMemo, useState } from "react";
import {
  Filter,
  RotateCcw,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { TourCard } from "@/components/site/tour-card";
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
type Region = (typeof regions)[number];

const durationOptions = [
  { value: "any", label: "Any duration", min: 0, max: 999 },
  { value: "short", label: "Up to 6 days", min: 0, max: 6 },
  { value: "mid", label: "7 – 9 days", min: 7, max: 9 },
  { value: "long", label: "10 – 12 days", min: 10, max: 12 },
  { value: "xl", label: "13+ days", min: 13, max: 999 },
] as const;
type DurationValue = (typeof durationOptions)[number]["value"];

const priceOptions = [
  { value: "any", label: "Any budget", min: 0, max: Number.MAX_SAFE_INTEGER },
  { value: "under50", label: "Under ₹50k", min: 0, max: 49999 },
  { value: "50to100", label: "₹50k – ₹1L", min: 50000, max: 100000 },
  { value: "100to200", label: "₹1L – ₹2L", min: 100001, max: 200000 },
  {
    value: "above200",
    label: "₹2L+",
    min: 200001,
    max: Number.MAX_SAFE_INTEGER,
  },
] as const;
type PriceValue = (typeof priceOptions)[number]["value"];

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: lowest first" },
  { value: "price-high", label: "Price: highest first" },
  { value: "duration-short", label: "Duration: shortest first" },
  { value: "duration-long", label: "Duration: longest first" },
  { value: "savings", label: "Biggest deals" },
  { value: "rating", label: "Highest rated" },
];

type ActiveFilter = {
  key: string;
  label: string;
  clear: () => void;
};

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
  const [region, setRegion] = useState<Region>("All");
  const [duration, setDuration] = useState<DurationValue>("any");
  const [price, setPrice] = useState<PriceValue>("any");
  const [month, setMonth] = useState(
    months.includes(initialMonth) ? initialMonth : "Any month",
  );
  const [sort, setSort] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

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

    const durationRange = durationOptions.find((item) => item.value === duration);
    if (durationRange && duration !== "any") {
      list = list.filter(
        (tour) => tour.days >= durationRange.min && tour.days <= durationRange.max,
      );
    }

    const priceRange = priceOptions.find((item) => item.value === price);
    if (priceRange && price !== "any") {
      list = list.filter(
        (tour) => tour.price >= priceRange.min && tour.price <= priceRange.max,
      );
    }

    switch (sort) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "duration-short":
        list.sort((a, b) => a.days - b.days);
        break;
      case "duration-long":
        list.sort((a, b) => b.days - a.days);
        break;
      case "savings":
        list.sort(
          (a, b) =>
            ((b.oldPrice ?? b.price) - b.price) -
            ((a.oldPrice ?? a.price) - a.price),
        );
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort(
          (a, b) =>
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            b.rating - a.rating,
        );
    }

    return list;
  }, [
    destination,
    duration,
    experience,
    month,
    price,
    region,
    sort,
    tours,
  ]);

  const activeFilters: ActiveFilter[] = [];

  if (region !== "All") {
    activeFilters.push({
      key: "region",
      label: region,
      clear: () => setRegion("All"),
    });
  }
  if (destination) {
    activeFilters.push({
      key: "destination",
      label:
        destinations.find((item) => item.slug === destination)?.name ??
        destination,
      clear: () => setDestination(""),
    });
  }
  if (experience) {
    activeFilters.push({
      key: "experience",
      label:
        experiences.find((item) => item.slug === experience)?.shortTitle ??
        experience,
      clear: () => setExperience(""),
    });
  }
  if (duration !== "any") {
    activeFilters.push({
      key: "duration",
      label:
        durationOptions.find((item) => item.value === duration)?.label ??
        "Duration",
      clear: () => setDuration("any"),
    });
  }
  if (price !== "any") {
    activeFilters.push({
      key: "price",
      label:
        priceOptions.find((item) => item.value === price)?.label ?? "Budget",
      clear: () => setPrice("any"),
    });
  }
  if (month !== "Any month") {
    activeFilters.push({
      key: "month",
      label: `${month} departures`,
      clear: () => setMonth("Any month"),
    });
  }

  const hasFilters = activeFilters.length > 0;

  function resetFilters() {
    setDestination("");
    setExperience("");
    setRegion("All");
    setDuration("any");
    setPrice("any");
    setMonth("Any month");
    setSort("recommended");
  }

  function renderFilterPanel(prefix: string) {
    return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_-38px_rgba(11,39,53,0.5)]">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-stone-500">
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          Filters
        </p>
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasFilters && sort === "recommended"}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-500 transition hover:bg-sand-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="mt-4 divide-y divide-dashed divide-stone-200">
        <section className="pb-4">
          <p className="field-label">Region</p>
          <div className="flex flex-wrap gap-1.5">
            {regions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRegion(item)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider transition",
                  region === item
                    ? "border-navy-950 bg-navy-950 text-sand-50"
                    : "border-stone-200 bg-sand-50 text-stone-600 hover:border-blue-400 hover:text-blue-700",
                )}
              >
                {item === "All" ? "All" : item}
              </button>
            ))}
          </div>
        </section>

        <section className="py-4">
          <label htmlFor={`${prefix}-destination`}>
            <span className="field-label">Destination</span>
            <select
              id={`${prefix}-destination`}
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
        </section>

        <section className="py-4">
          <p className="field-label">Travel style</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setExperience("")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-bold transition",
                !experience
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-stone-200 text-stone-500 hover:border-stone-300",
              )}
            >
              All
            </button>
            {experiences.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setExperience(item.slug)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-bold transition",
                  experience === item.slug
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-stone-200 text-stone-500 hover:border-stone-300",
                )}
              >
                {item.shortTitle}
              </button>
            ))}
          </div>
        </section>

        <section className="py-4">
          <p className="field-label">Duration</p>
          <div className="grid grid-cols-2 gap-1.5">
            {durationOptions
              .filter((item) => item.value !== "any")
              .map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setDuration(duration === item.value ? "any" : item.value)
                  }
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-[11px] font-bold transition",
                    duration === item.value
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-stone-200 text-stone-500 hover:border-stone-300",
                  )}
                >
                  {item.label}
                </button>
              ))}
          </div>
        </section>

        <section className="py-4">
          <p className="field-label">Budget</p>
          <div className="grid grid-cols-2 gap-1.5">
            {priceOptions
              .filter((item) => item.value !== "any")
              .map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setPrice(price === item.value ? "any" : item.value)
                  }
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-[11px] font-bold transition",
                    price === item.value
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-stone-200 text-stone-500 hover:border-stone-300",
                  )}
                >
                  {item.label}
                </button>
              ))}
          </div>
        </section>

        <section className="pt-4">
          <label htmlFor={`${prefix}-month`}>
            <span className="field-label">Departure month</span>
            <select
              id={`${prefix}-month`}
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
        </section>
      </div>

      <button
        type="button"
        onClick={() => setFiltersOpen(false)}
        className="btn-primary mt-5 w-full lg:hidden"
      >
        Show {filtered.length} {filtered.length === 1 ? "journey" : "journeys"}
      </button>
    </div>
    );
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
            <Filter className="h-3.5 w-3.5" />
            {filtered.length} {filtered.length === 1 ? "journey" : "journeys"}{" "}
            found
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950 sm:text-3xl">
            {destination
              ? `Journeys to ${
                  destinations.find((item) => item.slug === destination)?.name ??
                  "your destination"
                }`
              : "All Hidden Miles journeys"}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-navy-950 transition hover:border-blue-400 hover:text-blue-700 lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilters.length ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                {activeFilters.length}
              </span>
            ) : null}
          </button>

          <label
            htmlFor="sort"
            className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400"
          >
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-[11px] font-bold text-navy-950 outline-none focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="hidden lg:sticky lg:top-28 lg:block">
          {renderFilterPanel("desktop")}
        </aside>

        <div className="min-w-0">
          {filtersOpen ? (
            <div className="mb-4 lg:hidden">
              {renderFilterPanel("mobile")}
            </div>
          ) : null}

          {activeFilters.length ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.clear}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-800 transition hover:bg-blue-100"
                >
                  {filter.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 underline decoration-dotted underline-offset-4 transition hover:text-blue-700"
              >
                Clear all
              </button>
            </div>
          ) : null}

          {filtered.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tour, index) => (
                <TourCard key={tour.slug} tour={tour} priority={index < 3} />
              ))}
            </div>
          ) : (
            <div className="rounded-[30px] border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-200 text-blue-700">
                <SearchX className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-navy-950">
                Nothing matches those filters — yet.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                Try a different budget, duration or month, or let our team build
                something entirely around you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-outline"
                >
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
      </div>
    </div>
  );
}
