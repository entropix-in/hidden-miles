"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Minus, Phone, Plus, ShieldCheck } from "lucide-react";
import type { TourDeparture } from "@/lib/types";
import { site } from "@/data/site";
import { cn, formatINR } from "@/lib/utils";
import { Select } from "@/components/ui/select";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const cities = [
  { name: "Mumbai", note: "Flight included", delta: 0 },
  { name: "Delhi", note: "Flight included", delta: -2400 },
  { name: "Bengaluru", note: "Flight included", delta: 3800 },
  { name: "Pune", note: "Flight via Mumbai", delta: 1900 },
  { name: "Join in Srinagar", note: "Tour only", delta: -9500 },
];

const VISIBLE_DATES = 4;

export function BookingCard({
  tourSlug,
  basePrice,
  oldPrice,
  departures,
  tourTitle,
}: {
  tourSlug: string;
  basePrice: number;
  oldPrice?: number;
  departures: TourDeparture[];
  tourTitle: string;
}) {
  const fallback = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, index) => {
        const start = new Date();
        start.setUTCDate(start.getUTCDate() + 14 + index * 7);
        const seats = [6, 18, 3, 12][index] ?? 10;
        return {
          _id: `fallback-${index}`,
          tourSlug: "",
          startDate: start.toISOString().slice(0, 10),
          price: basePrice,
          capacity: 24,
          booked: 24 - seats,
          seatsLeft: seats,
          note: seats <= 5 ? "filling fast" : "available",
          createdAt: 0,
        } satisfies TourDeparture;
      }),
    [basePrice],
  );

  const allDates = departures.length ? departures : fallback;
  const [selectedId, setSelectedId] = useState(allDates[0]?._id ?? "");
  const [showAllDates, setShowAllDates] = useState(false);
  const [city, setCity] = useState(cities[0].name);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  const visibleDates = showAllDates
    ? allDates
    : allDates.slice(0, VISIBLE_DATES);
  const hasMoreDates = allDates.length > VISIBLE_DATES;

  const selected = allDates.find((date) => date._id === selectedId) ?? allDates[0];
  const cityOption = cities.find((item) => item.name === city) ?? cities[0];
  const adultPrice = (selected?.price ?? basePrice) + cityOption.delta;
  const childPrice = Math.round(adultPrice * 0.75);
  const total = adultPrice * adults + childPrice * children;
  const due = Math.round(total * 0.25);

  const cityHint =
    cityOption.note === "Flight included"
      ? cityOption.delta === 0
        ? "Base fare · return flights included"
        : `${cityOption.delta > 0 ? "Add" : "Less"} ${formatINR(Math.abs(cityOption.delta))} · return flights included`
      : "Land-only package · no flights included";

  return (
    <div className="rounded-[28px] border border-sand-300 bg-paper p-7 shadow-[0_24px_56px_-36px_rgba(11,39,53,0.28)] sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {oldPrice ? (
          <span className="text-sm font-medium text-navy-400 line-through">
            {formatINR(oldPrice)}
          </span>
        ) : null}
        {oldPrice && oldPrice > basePrice ? (
          <span className="badge badge-success">
            Save {formatINR(oldPrice - basePrice)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[32px] font-extrabold leading-none tracking-[-0.03em] text-ink">
          {formatINR(adultPrice)}
        </span>
        <span className="type-small text-navy-500">per person</span>
      </p>
      <p className="mt-2 text-[13px] font-medium text-navy-400">
        Twin sharing · taxes included
      </p>

      <div className="route-line my-6" />

      <div className="flex items-baseline justify-between gap-3">
        <p className="type-label text-navy-500">Departure date</p>
        <span className="text-[12px] font-semibold text-navy-400">
          {allDates.length} {allDates.length === 1 ? "date" : "dates"}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Departure date"
        className="mt-3 grid gap-2"
      >
        {visibleDates.map((date) => {
          const sold = date.seatsLeft <= 0;
          const low = !sold && date.seatsLeft <= 5;
          const active = selected?._id === date._id;

          return (
            <button
              key={date._id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={sold}
              onClick={() => setSelectedId(date._id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-3 text-left transition",
                active
                  ? "border-ink bg-ink text-paper shadow-[0_12px_28px_-18px_rgba(11,39,53,0.7)]"
                  : sold
                    ? "cursor-not-allowed border-sand-300 bg-sand-100 text-navy-400"
                    : "border-sand-300 bg-paper text-ink hover:border-navy-300 hover:bg-sand-100",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px] transition",
                  active
                    ? "border-gold-400 bg-gold-400 text-ink"
                    : "border-sand-300 bg-paper text-transparent",
                )}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-[13.5px] font-bold",
                    sold && "line-through",
                  )}
                >
                  {dateFormatter.format(new Date(`${date.startDate}T00:00:00Z`))}
                </span>
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em]",
                    active
                      ? "bg-white/10 text-gold-200"
                      : sold
                        ? "bg-sand-200 text-navy-400"
                        : low
                          ? "bg-gold-100 text-gold-700"
                          : "bg-success-soft text-success",
                  )}
                >
                  {sold
                    ? "Sold out"
                    : low
                      ? `Only ${date.seatsLeft} left`
                      : `${date.seatsLeft} seats left`}
                </span>
              </span>

              <span
                className={cn(
                  "shrink-0 text-right text-sm font-bold",
                  active ? "text-paper" : sold ? "text-navy-400" : "text-ink",
                )}
              >
                {formatINR(date.price)}
                <span
                  className={cn(
                    "mt-0.5 block text-[10px] font-medium normal-case tracking-normal",
                    active ? "text-navy-200" : "text-navy-400",
                  )}
                >
                  per person
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {hasMoreDates ? (
        <button
          type="button"
          onClick={() => setShowAllDates((current) => !current)}
          className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-sand-300 bg-paper px-3 py-2 text-[13px] font-bold text-navy-700 transition hover:border-navy-300 hover:text-ink"
          aria-expanded={showAllDates}
        >
          {showAllDates
            ? "Show fewer dates"
            : `View all ${allDates.length} departures`}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              showAllDates && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      ) : null}

      <div className="mt-6">
        <label
          htmlFor="departure-city"
          className="type-label block text-navy-500"
        >
          Departure city
        </label>
        <Select
          id="departure-city"
          value={city}
          onValueChange={setCity}
          className="mt-2 py-3 font-bold"
        >
          {cities.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} · {item.note}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-xs font-medium text-navy-500">{cityHint}</p>
      </div>

      <div className="mt-6">
        <p className="type-label text-navy-500">Travellers</p>
        <div className="mt-2 grid gap-2">
          {[
            { label: "Adults", sub: "12+ years", value: adults, set: setAdults, min: 1 },
            { label: "Children", sub: "5 – 11 years", value: children, set: setChildren, min: 0 },
          ].map((traveller) => (
            <div
              key={traveller.label}
              className="flex items-center justify-between rounded-[14px] border border-sand-300 bg-paper px-4 py-2.5"
            >
              <span>
                <span className="block text-sm font-bold text-ink">
                  {traveller.label}
                </span>
                <span className="block text-xs font-medium text-navy-500">
                  {traveller.sub}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    traveller.set(Math.max(traveller.min, traveller.value - 1))
                  }
                  className="grid h-[34px] w-[34px] place-items-center rounded-full border border-sand-300 bg-paper text-ink transition hover:border-navy-300 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={traveller.value <= traveller.min}
                  aria-label={`Remove one ${traveller.label.toLowerCase()}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-bold tabular-nums text-ink">
                  {traveller.value}
                </span>
                <button
                  type="button"
                  onClick={() => traveller.set(traveller.value + 1)}
                  className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ink text-gold-400 transition hover:bg-navy-800"
                  aria-label={`Add one ${traveller.label.toLowerCase()}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[16px] border border-sand-300 bg-sand-50 p-4">
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-navy-700">
              {adults} adult{adults === 1 ? "" : "s"} × {formatINR(adultPrice)}
            </span>
            <span className="font-bold tabular-nums text-ink">
              {formatINR(adultPrice * adults)}
            </span>
          </div>
          {children ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-navy-700">
                {children} child{children === 1 ? "" : "ren"} ×{" "}
                {formatINR(childPrice)}
              </span>
              <span className="font-bold tabular-nums text-ink">
                {formatINR(childPrice * children)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="route-line my-3.5" />

        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-bold text-ink">
            Total for {adults + children}{" "}
            {adults + children === 1 ? "traveller" : "travellers"}
          </span>
          <span className="type-title tabular-nums text-ink">
            {formatINR(total)}
          </span>
        </div>
        <p className="mt-1.5 text-xs font-medium text-navy-500">
          Pay {formatINR(due)} now to reserve · balance due 30 days before travel
        </p>
      </div>

      <Link
        href={`/tours/${tourSlug}/book`}
        className="btn btn-primary btn-lg mt-5 w-full"
      >
        Reserve my seats
        <span className="btn-dot">→</span>
      </Link>
      <Link href="/contact" className="btn btn-outline mt-2 w-full">
        Ask a question
      </Link>

      <div className="mt-5 space-y-2">
        {[
          "Free date change up to 30 days before",
          "Balance due 30 days before travel",
          "Secure payment · UPI, cards, EMI",
        ].map((point) => (
          <p
            key={point}
            className="flex items-center gap-2 text-[13px] font-medium text-navy-700"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
            {point}
          </p>
        ))}
      </div>

      <a
        href={site.phoneHref}
        className="mt-5 flex items-center gap-3 rounded-[14px] border border-sand-300 bg-sand-50 p-3.5 transition hover:border-navy-300 hover:bg-sand-100"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-500 text-xs font-bold text-white">
          NK
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-ink">
            Talk to Nisha, {tourTitle.split(" ")[0]} expert
          </span>
          <span className="block text-xs font-medium text-navy-500">
            {site.phone} · usually replies in 5 min
          </span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-gold-400">
          <Phone className="h-4 w-4" />
        </span>
      </a>
    </div>
  );
}
