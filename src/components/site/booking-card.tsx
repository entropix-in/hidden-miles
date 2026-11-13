"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Phone, ShieldCheck } from "lucide-react";
import type { TourDeparture } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

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

  const dates = (departures.length ? departures : fallback).slice(0, 4);
  const [selectedId, setSelectedId] = useState(dates[0]?._id ?? "");
  const [city, setCity] = useState(cities[0].name);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  const selected = dates.find((date) => date._id === selectedId) ?? dates[0];
  const cityOption = cities.find((item) => item.name === city) ?? cities[0];
  const adultPrice = (selected?.price ?? basePrice) + cityOption.delta;
  const childPrice = Math.round(adultPrice * 0.75);
  const total = adultPrice * adults + childPrice * children;
  const due = Math.round(total * 0.25);

  return (
    <div className="rounded-[28px] border border-sand-300 bg-paper p-8 shadow-[0_24px_56px_-36px_rgba(11,39,53,0.28)]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
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
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-[32px] font-extrabold leading-none tracking-[-0.03em] text-ink">
            {formatINR(adultPrice)}
          </span>
          <span className="type-small text-navy-500">per person</span>
        </p>
        <p className="mt-2 text-[13px] font-medium text-navy-400">
          Twin sharing · taxes included
        </p>
      </div>

      <div className="route-line my-6" />

      <div className="flex items-center justify-between gap-3">
        <p className="type-label text-navy-500">Departure date</p>
        <span className="text-[13px] font-bold text-blue-700">
          All {departures.length || dates.length} →
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {dates.map((date) => {
          const sold = date.seatsLeft <= 0;
          const low = !sold && date.seatsLeft <= 5;
          const active = selected?._id === date._id;

          return (
            <button
              key={date._id}
              type="button"
              disabled={sold}
              onClick={() => setSelectedId(date._id)}
              className={cn(
                "rounded-[14px] border-[1.5px] px-3.5 py-3 text-left transition",
                active
                  ? "border-ink bg-ink text-paper"
                  : sold
                    ? "border-sand-300 bg-sand-100 text-navy-400"
                    : "border-sand-300 bg-paper text-ink hover:border-navy-300",
              )}
            >
              <span
                className={cn(
                  "block text-[13px] font-bold",
                  sold && "line-through",
                )}
              >
                {dateFormatter.format(new Date(`${date.startDate}T00:00:00Z`))}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[13px] font-medium",
                  active ? "text-navy-200" : sold ? "text-navy-400" : "text-navy-600",
                )}
              >
                {sold ? "Sold out" : formatINR(date.price)}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-xs font-bold",
                  active
                    ? "text-gold-400"
                    : sold
                      ? "text-navy-400"
                      : low
                        ? "text-danger"
                        : "text-success",
                )}
              >
                {sold ? "Waitlist" : `${date.seatsLeft} seats left`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <label htmlFor="departure-city" className="type-label block text-navy-500">
          Departure city
        </label>
        <select
          id="departure-city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="field mt-2 py-3 font-bold"
        >
          {cities.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} · {item.note}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <p className="type-label text-navy-500">Travellers</p>
        <div className="mt-2 grid gap-2">
          {[
            { label: "Adults", sub: "12+ years", value: adults, set: setAdults, min: 1 },
            { label: "Children", sub: "5 – 11 years", value: children, set: setChildren, min: 0 },
          ].map((traveller) => (
            <div
              key={traveller.label}
              className="flex items-center justify-between rounded-[14px] bg-sand-100 px-4 py-2.5"
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
                  onClick={() => traveller.set(Math.max(traveller.min, traveller.value - 1))}
                  className="grid h-[34px] w-[34px] place-items-center rounded-full border border-sand-300 bg-paper text-ink transition hover:border-navy-300"
                  aria-label={`Remove one ${traveller.label.toLowerCase()}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-bold text-ink">
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

      <div className="mt-5 space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-navy-700">
            {adults} adult{adults === 1 ? "" : "s"} × {formatINR(adultPrice)}
          </span>
          <span className="font-bold text-ink">{formatINR(adultPrice * adults)}</span>
        </div>
        {children ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-navy-700">
              {children} child{children === 1 ? "" : "ren"} × {formatINR(childPrice)}
            </span>
            <span className="font-bold text-ink">{formatINR(childPrice * children)}</span>
          </div>
        ) : null}
        <div className="route-line" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-ink">
            Pay now to reserve (25%)
          </span>
          <span className="text-sm font-bold text-ink">{formatINR(due)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-navy-500">
            Total for {adults + children} travellers
          </span>
          <span className="type-title text-ink">{formatINR(total)}</span>
        </div>
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
          <p key={point} className="flex items-center gap-2 text-[13px] font-medium text-navy-700">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {point}
          </p>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-[14px] bg-sand-100 p-3.5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-500 text-xs font-bold text-white">
          NK
        </span>
        <span className="flex-1">
          <span className="block text-[13px] font-bold text-ink">
            Talk to Nisha, {tourTitle.split(" ")[0]} expert
          </span>
          <span className="block text-xs font-medium text-navy-500">
            Usually replies in 5 min
          </span>
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-gold-400">
          <Phone className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
