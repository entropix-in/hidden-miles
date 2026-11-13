"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Headset,
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

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: lowest first" },
  { value: "price-high", label: "Price: highest first" },
  { value: "duration-short", label: "Duration: shortest first" },
  { value: "rating", label: "Highest rated" },
];

export function ToursExplorer({
  tours,
  destinations,
  experiences,
  initialDestination = "",
  initialExperience = "",
  initialMonth = "",
  initialRegion = "All",
  initialQuery = "",
  initialPriceMax = 300000,
}: {
  tours: Tour[];
  destinations: Destination[];
  experiences: Experience[];
  initialDestination?: string;
  initialExperience?: string;
  initialMonth?: string;
  initialRegion?: Region;
  initialQuery?: string;
  initialPriceMax?: number;
}) {
  const [destination, setDestination] = useState(initialDestination);
  const [experience, setExperience] = useState(initialExperience);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [month, setMonth] = useState(
    months.includes(initialMonth) ? initialMonth : "Any month",
  );
  const [priceMin, setPriceMin] = useState(25000);
  const [priceMax, setPriceMax] = useState(initialPriceMax);
  const [durationMin, setDurationMin] = useState(4);
  const [durationMax, setDurationMax] = useState(16);
  const [sort, setSort] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    let list = [...tours];
    const term = query.trim().toLowerCase();

    if (term) {
      list = list.filter((tour) =>
        `${tour.title} ${tour.destinationName} ${tour.summary} ${tour.region}`
          .toLowerCase()
          .includes(term),
      );
    }
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

    list = list.filter(
      (tour) =>
        tour.price >= priceMin &&
        tour.price <= priceMax &&
        tour.days >= durationMin &&
        tour.days <= durationMax,
    );

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
    durationMax,
    durationMin,
    experience,
    month,
    priceMax,
    priceMin,
    query,
    region,
    sort,
    tours,
  ]);

  const activeFilters: Array<{ key: string; label: string; clear: () => void }> = [];
  if (query) {
    activeFilters.push({
      key: "query",
      label: `“${query}”`,
      clear: () => setQuery(""),
    });
  }
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
  if (month !== "Any month") {
    activeFilters.push({
      key: "month",
      label: `${month} departures`,
      clear: () => setMonth("Any month"),
    });
  }
  if (priceMin > 25000 || priceMax < 300000) {
    activeFilters.push({
      key: "price",
      label: `Under ₹${Math.round(priceMax / 1000)}k`,
      clear: () => {
        setPriceMin(25000);
        setPriceMax(300000);
      },
    });
  }

  function resetFilters() {
    setDestination("");
    setExperience("");
    setRegion("All");
    setMonth("Any month");
    setPriceMin(25000);
    setPriceMax(300000);
    setDurationMin(4);
    setDurationMax(16);
    setSort("recommended");
    setQuery("");
  }

  function renderFilterPanel(idPrefix: string) {
    return (
      <div className="rounded-[28px] border border-sand-300 bg-paper p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="type-title text-ink">Filters</p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <p className="type-label mb-3 text-navy-500">Region</p>
            <div className="flex flex-wrap gap-2">
              {regions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRegion(item)}
                  className={cn("chip", region === item && "chip-active")}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <div className="hr-dashed" />

          <section>
            <label htmlFor={`${idPrefix}-destination`} className="type-label mb-3 block text-navy-500">
              Destination
            </label>
            <select
              id={`${idPrefix}-destination`}
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="field py-3"
            >
              <option value="">All destinations</option>
              {destinations.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </section>

          <div className="hr-dashed" />

          <section>
            <p className="type-label mb-3 text-navy-500">Travel style</p>
            <div className="grid gap-3">
              {experiences.map((item) => {
                const count = tours.filter((tour) =>
                  tour.experiences.includes(item.slug),
                ).length;
                const checked = experience === item.slug;

                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() =>
                      setExperience(checked ? "" : item.slug)
                    }
                    className="flex items-center gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-[1.5px] text-[11px] font-bold",
                        checked
                          ? "border-ink bg-ink text-gold-400"
                          : "border-sand-300 bg-paper text-transparent",
                      )}
                    >
                      ✓
                    </span>
                    <span className="flex-1 text-sm font-medium text-ink">
                      {item.shortTitle}
                    </span>
                    <span className="text-[13px] font-medium text-navy-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="hr-dashed" />

          <section>
            <label htmlFor={`${idPrefix}-month`} className="type-label mb-3 block text-navy-500">
              Departure month
            </label>
            <select
              id={`${idPrefix}-month`}
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="field py-3"
            >
              {months.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </section>

          <div className="hr-dashed" />

          <section>
            <div className="flex items-center justify-between">
              <p className="type-label text-navy-500">Budget per person</p>
              <span className="text-[13px] font-bold text-ink">
                ₹{Math.round(priceMin / 1000)}k – ₹{Math.round(priceMax / 1000)}k
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <input
                type="range"
                min={25000}
                max={300000}
                step={5000}
                value={priceMin}
                onChange={(event) =>
                  setPriceMin(Math.min(Number(event.target.value), priceMax - 5000))
                }
                aria-label="Minimum budget"
                className="h-1.5 w-full cursor-pointer accent-ink"
              />
              <input
                type="range"
                min={25000}
                max={300000}
                step={5000}
                value={priceMax}
                onChange={(event) =>
                  setPriceMax(Math.max(Number(event.target.value), priceMin + 5000))
                }
                aria-label="Maximum budget"
                className="h-1.5 w-full cursor-pointer accent-ink"
              />
            </div>
            <div className="mt-1 flex justify-between text-[13px] font-medium text-navy-500">
              <span>₹25,000</span>
              <span>₹3,00,000</span>
            </div>
          </section>

          <div className="hr-dashed" />

          <section>
            <div className="flex items-center justify-between">
              <p className="type-label text-navy-500">Duration</p>
              <span className="text-[13px] font-bold text-ink">
                {durationMin} – {durationMax} days
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <input
                type="range"
                min={4}
                max={16}
                value={durationMin}
                onChange={(event) =>
                  setDurationMin(Math.min(Number(event.target.value), durationMax - 1))
                }
                aria-label="Minimum duration"
                className="h-1.5 w-full cursor-pointer accent-ink"
              />
              <input
                type="range"
                min={4}
                max={16}
                value={durationMax}
                onChange={(event) =>
                  setDurationMax(Math.max(Number(event.target.value), durationMin + 1))
                }
                aria-label="Maximum duration"
                className="h-1.5 w-full cursor-pointer accent-ink"
              />
            </div>
          </section>

          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="btn btn-ink w-full lg:hidden"
          >
            Show {filtered.length} tours
            <span className="btn-dot">→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="container-page pb-16 md:pb-24">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start lg:gap-12">
        <aside className="hidden lg:sticky lg:top-32 lg:block">
          {renderFilterPanel("desktop")}
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="type-h3 text-ink">
                {filtered.length} tours
                {region !== "All" ? ` in ${region}` : ""}
              </h2>
              <p className="type-small mt-1 text-navy-500">
                Showing group tours and family holidays
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="btn btn-light btn-sm lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilters.length ? (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-paper">
                    {activeFilters.length}
                  </span>
                ) : null}
              </button>

              <label
                htmlFor="tour-sort"
                className="rounded-full border border-sand-300 bg-paper px-4 py-2.5 text-[13px] font-medium text-navy-500"
              >
                Sort by
              </label>
              <select
                id="tour-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="-ml-2 rounded-full bg-transparent text-sm font-bold text-ink outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtersOpen ? (
            <div className="mt-4 lg:hidden">
              {renderFilterPanel("mobile")}
            </div>
          ) : null}

          {activeFilters.length ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.clear}
                  className="chip chip-soft"
                >
                  {filter.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-[13px] font-bold text-navy-500 transition hover:text-ink"
              >
                Clear all
              </button>
            </div>
          ) : null}

          {filtered.length ? (
            <>
              <div className="mt-7 grid gap-7 sm:grid-cols-2">
                {filtered.slice(0, 12).map((tour, index) => (
                  <TourCard
                    key={tour.slug}
                    tour={tour}
                    priority={index < 2}
                  />
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-sand-300 text-navy-400">
                  <ArrowLeft className="h-4 w-4" />
                </span>
                {["1", "2", "3"].map((page) => (
                  <span
                    key={page}
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-full border text-sm font-bold",
                      page === "1"
                        ? "border-ink bg-ink text-gold-400"
                        : "border-sand-300 bg-paper text-ink",
                    )}
                  >
                    {page}
                  </span>
                ))}
                <span className="grid h-11 w-11 place-items-center rounded-full border border-sand-300 bg-paper text-ink">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="ml-2 text-[13px] font-medium text-navy-500">
                  Showing 1–{Math.min(filtered.length, 12)} of {filtered.length}
                </span>
              </div>
            </>
          ) : (
            <div className="mt-7 rounded-[28px] border border-dashed border-sand-300 bg-paper px-6 py-16 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-200 text-navy-500">
                <SearchX className="h-6 w-6" />
              </span>
              <h3 className="type-h3 mt-5 text-ink">
                Nothing matches those filters — yet.
              </h3>
              <p className="type-small mx-auto mt-2 max-w-md text-navy-500">
                Try a different budget, duration or month, or let our team build
                something entirely around you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={resetFilters} className="btn btn-outline">
                  Clear filters
                </button>
                <Link href="/contact" className="btn btn-ink">
                  Build my holiday
                  <span className="btn-dot">→</span>
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col items-start gap-5 rounded-[20px] bg-gold-100 px-7 py-6 sm:flex-row sm:items-center">
            <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[16px] bg-gold-400 text-ink">
              <Headset className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className="type-title text-ink">Can&apos;t find the right dates?</p>
              <p className="type-small mt-1 text-navy-700">
                We run private departures for groups of 6 or more — any date, any
                route.
              </p>
            </div>
            <Link href="/contact" className="btn btn-ink btn-sm shrink-0">
              Ask a specialist
              <span className="btn-dot">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
