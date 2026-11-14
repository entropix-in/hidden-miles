"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Headset,
  LayoutGrid,
  List,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { TourCard, TourListCard } from "@/components/site/tour-card";
import type { Destination } from "@/data/destinations";
import type { Experience } from "@/data/experiences";
import type { Tour } from "@/data/tours";
import { cn, formatINR } from "@/lib/utils";

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

const PAGE_SIZE = 6;

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: lowest first" },
  { value: "price-high", label: "Price: highest first" },
  { value: "duration-short", label: "Duration: shortest first" },
  { value: "rating", label: "Highest rated" },
];

function DualRange({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  minLabel,
  maxLabel,
}: {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  const percent = (value: number) => ((value - min) / (max - min)) * 100;

  return (
    <div className="relative mt-4 h-[22px]">
      <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-sand-200" />
      <span
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink"
        style={{
          left: `${percent(valueMin)}%`,
          right: `${100 - percent(valueMax)}%`,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(event) =>
          onChangeMin(
            Math.min(Number(event.target.value), valueMax - (step ?? 1)),
          )
        }
        aria-label={minLabel}
        className="range-input"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(event) =>
          onChangeMax(
            Math.max(Number(event.target.value), valueMin + (step ?? 1)),
          )
        }
        aria-label={maxLabel}
        className="range-input"
      />
    </div>
  );
}

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
  const [durationMin, setDurationMin] = useState(5);
  const [durationMax, setDurationMax] = useState(16);
  const [sort, setSort] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [pagination, setPagination] = useState<{
    key: string;
    page: number;
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const filterKey = [
    destination,
    experience,
    region,
    month,
    priceMin,
    priceMax,
    durationMin,
    durationMax,
    sort,
    query,
    view,
  ].join("|");
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(
    pagination?.key === filterKey ? pagination.page : 1,
    totalPages,
  );
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageTours = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function goToPage(next: number) {
    setPagination({
      key: filterKey,
      page: Math.min(totalPages, Math.max(1, next)),
    });
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

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
    setDurationMin(5);
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
            <label htmlFor={`${idPrefix}-destination`} className="type-label mb-3 block text-navy-500">
              Destination
            </label>
            <div className="relative">
              <select
                id={`${idPrefix}-destination`}
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="field appearance-none border-transparent bg-sand-100 py-3 pr-10"
              >
                <option value="">All destinations</option>
                {destinations.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
            </div>
          </section>

          <div className="hr-dashed" />

          <section>
            <label htmlFor={`${idPrefix}-month`} className="type-label mb-3 block text-navy-500">
              Departure month
            </label>
            <div className="relative">
              <select
                id={`${idPrefix}-month`}
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="field appearance-none border-transparent bg-sand-100 py-3 pr-10"
              >
                {months.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
            </div>
          </section>

          <div className="hr-dashed" />

          <section>
            <p className="type-label text-navy-500">Budget per person</p>
            <DualRange
              min={25000}
              max={300000}
              step={5000}
              valueMin={priceMin}
              valueMax={priceMax}
              onChangeMin={setPriceMin}
              onChangeMax={setPriceMax}
              minLabel="Minimum budget"
              maxLabel="Maximum budget"
            />
            <div className="mt-1 flex justify-between text-[13px] font-medium text-navy-500">
              <span>{formatINR(priceMin)}</span>
              <span>{formatINR(priceMax)}</span>
            </div>
          </section>

          <div className="hr-dashed" />

          <section>
            <p className="type-label text-navy-500">Duration</p>
            <DualRange
              min={5}
              max={16}
              valueMin={durationMin}
              valueMax={durationMax}
              onChangeMin={setDurationMin}
              onChangeMax={setDurationMax}
              minLabel="Minimum duration"
              maxLabel="Maximum duration"
            />
            <div className="mt-1 flex justify-between text-[13px] font-medium text-navy-500">
              <span>{durationMin} days</span>
              <span>{durationMax} days</span>
            </div>
          </section>

          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="btn btn-ink w-full"
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

        <div ref={resultsRef} className="min-w-0 scroll-mt-28">
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

              <div className="relative flex items-center gap-1.5 rounded-full border border-sand-300 bg-paper py-2.5 pl-4 pr-3">
                <label
                  htmlFor="tour-sort"
                  className="text-[13px] font-medium text-navy-500"
                >
                  Sort by
                </label>
                <select
                  id="tour-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="appearance-none bg-transparent pr-5 text-sm font-bold text-ink outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-navy-500" />
              </div>

              <div className="flex items-center gap-1 rounded-full bg-sand-200 p-1">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  aria-pressed={view === "grid"}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold transition",
                    view === "grid"
                      ? "bg-ink text-paper"
                      : "text-navy-700 hover:text-ink",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  aria-pressed={view === "list"}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold transition",
                    view === "list"
                      ? "bg-ink text-paper"
                      : "text-navy-700 hover:text-ink",
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
              </div>
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
              <div
                className={cn(
                  "mt-7 gap-7",
                  view === "grid" ? "grid sm:grid-cols-2" : "grid grid-cols-1",
                )}
              >
                {pageTours.map((tour, index) =>
                  view === "grid" ? (
                    <TourCard
                      key={tour.slug}
                      tour={tour}
                      priority={index < 2}
                    />
                  ) : (
                    <TourListCard
                      key={tour.slug}
                      tour={tour}
                      priority={index < 2}
                    />
                  ),
                )}
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

          {filtered.length ? (
            <>
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

              <nav
                aria-label="Tours pagination"
                className="mt-8 flex flex-wrap items-center justify-center gap-2"
              >
                {totalPages > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-sand-300 bg-paper text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:text-navy-300 disabled:hover:border-sand-300"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                      (pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => goToPage(pageNumber)}
                          aria-label={`Page ${pageNumber}`}
                          aria-current={
                            pageNumber === currentPage ? "page" : undefined
                          }
                          className={cn(
                            "grid h-11 w-11 cursor-pointer place-items-center rounded-full border text-sm font-bold transition",
                            pageNumber === currentPage
                              ? "border-ink bg-ink text-gold-400"
                              : "border-sand-300 bg-paper text-ink hover:border-ink",
                          )}
                        >
                          {pageNumber}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                      className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-sand-300 bg-paper text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:text-navy-300 disabled:hover:border-sand-300"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
                <span
                  className="ml-2 text-[13px] font-medium text-navy-500"
                  aria-live="polite"
                >
                  Showing {filtered.length ? pageStart + 1 : 0}–
                  {Math.min(pageStart + PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                  {totalPages > 1
                    ? ` · Page ${currentPage} of ${totalPages}`
                    : ""}
                </span>
              </nav>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
