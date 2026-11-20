"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { Check, Minus, Phone, Plus, ShieldCheck, X } from "lucide-react";
import type { TourDeparture } from "@/lib/types";
import { fallbackDepartures } from "@/lib/tour-departures";
import { site } from "@/data/site";
import { cn, formatINR } from "@/lib/utils";
import type { TourCity } from "@/lib/tour-cities";
import { Select } from "@/components/ui/select";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function seatLabel(seatsLeft: number) {
  if (seatsLeft <= 0) return "Sold out";
  if (seatsLeft <= 5) return `Only ${seatsLeft} left`;
  return `${seatsLeft} seats left`;
}

export function BookingCard({
  tourSlug,
  basePrice,
  oldPrice,
  departures,
  cities,
}: {
  tourSlug: string;
  basePrice: number;
  oldPrice?: number;
  departures: TourDeparture[];
  tourTitle: string;
  cities: TourCity[];
}) {
  const fallback = useMemo(
    () => fallbackDepartures(basePrice, tourSlug),
    [basePrice, tourSlug],
  );

  const allDates = departures.length ? departures : fallback;
  const [selectedId, setSelectedId] = useState(
    allDates.find((date) => date.seatsLeft > 0)?._id ?? allDates[0]?._id ?? "",
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [city, setCity] = useState(cities[0]?.name ?? "");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  const selected = allDates.find((date) => date._id === selectedId) ?? allDates[0];
  const cityOption =
    cities.find((item) => item.name === city) ??
    cities[0] ?? { name: "", note: "", priceDelta: 0 };
  const adultPrice = (selected?.price ?? basePrice) + cityOption.priceDelta;
  const childPrice = Math.round(adultPrice * 0.75);
  const total = adultPrice * adults + childPrice * children;

  const landOnly = /tour only|no flight|land-only/i.test(cityOption.note);
  const cityHint = landOnly
    ? "Land-only package · no flights included"
    : cityOption.priceDelta === 0
      ? null
      : `${cityOption.priceDelta > 0 ? "Add" : "Less"} ${formatINR(Math.abs(cityOption.priceDelta))} · return flights included`;

  const bookingParams = new URLSearchParams();
  if (selected) bookingParams.set("date", selected.startDate);
  if (cityOption.name) bookingParams.set("city", cityOption.name);
  bookingParams.set("adults", String(adults));
  bookingParams.set("children", String(children));
  const bookingHref = `/tours/${tourSlug}/book?${bookingParams.toString()}`;

  return (
    <div className="rounded-[28px] border border-sand-300 bg-paper p-7 shadow-[0_24px_56px_-36px_rgba(11,39,53,0.28)] sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {oldPrice ? (
          <span className="text-sm font-medium text-navy-500 line-through">
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

      <div className="mt-6 flex items-baseline justify-between gap-3">
        <p className="type-label text-navy-500">Departure date</p>
        {allDates.length ? (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-[12px] font-bold text-navy-700 underline decoration-sand-300 decoration-1.5 underline-offset-4 transition hover:text-ink hover:decoration-ink"
          >
            Change
          </button>
        ) : null}
      </div>

      {selected ? (
        <div className="mt-3 flex items-center gap-3 rounded-[14px] border-[1.5px] border-ink bg-ink px-3.5 py-3 text-paper shadow-[0_12px_28px_-18px_rgba(11,39,53,0.7)]">
          <span
            aria-hidden="true"
            className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px] border-gold-400 bg-gold-400 text-ink"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-bold">
              {dateFormatter.format(
                new Date(`${selected.startDate}T00:00:00Z`),
              )}
            </span>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold",
                selected.seatsLeft <= 0
                  ? "bg-sand-200 text-navy-500"
                  : "bg-gold-400 text-ink",
              )}
            >
              {seatLabel(selected.seatsLeft)}
            </span>
          </span>
        </div>
      ) : (
        <p className="mt-3 rounded-[16px] border border-dashed border-sand-300 bg-sand-100 px-4 py-3 text-[13px] font-medium text-navy-700">
          New dates are being finalised. Ask us for the next departure.
        </p>
      )}

      <Dialog.Root open={pickerOpen} onOpenChange={setPickerOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-[2px]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-[81] max-h-[85dvh] w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[24px] border border-sand-300 bg-paper p-5 shadow-[0_40px_80px_-40px_rgba(11,39,53,0.55)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="type-title text-ink">
                  Choose a departure
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[13px] font-medium text-navy-500">
                  {allDates.length} departure
                  {allDates.length === 1 ? "" : "s"} · prices per person
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-sand-300 bg-paper text-ink transition hover:border-navy-300 hover:bg-sand-100"
                aria-label="Close date picker"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Dialog.Close>
            </div>

            <div
              role="radiogroup"
              aria-label="Departure date"
              className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {allDates.map((date) => {
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
                    onClick={() => {
                      setSelectedId(date._id);
                      setPickerOpen(false);
                    }}
                    className={cn(
                      "rounded-[12px] border-[1.5px] px-3 py-2.5 text-left transition",
                      active
                        ? "border-ink bg-ink text-paper"
                        : sold
                          ? "border-sand-300 bg-sand-100 text-navy-500"
                          : "border-sand-300 bg-paper text-ink hover:border-navy-300",
                    )}
                  >
                    <span
                      className={cn(
                        "block text-[13px] font-bold",
                        sold && "line-through",
                      )}
                    >
                      {dateFormatter.format(
                        new Date(`${date.startDate}T00:00:00Z`),
                      )}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[12px] font-medium",
                        active ? "text-navy-200" : "text-navy-500",
                      )}
                    >
                      {sold ? "Sold out" : formatINR(date.price)}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-xs font-bold",
                        active
                          ? "text-gold-400"
                          : sold
                            ? "text-navy-500"
                            : low
                              ? "text-danger"
                              : "text-success",
                      )}
                    >
                      {sold ? "Waitlist" : seatLabel(date.seatsLeft)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

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
        {cityHint ? (
          <p className="mt-1.5 text-xs font-medium text-navy-500">{cityHint}</p>
        ) : null}
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
            Tour price, {adults + children}{" "}
            {adults + children === 1 ? "traveller" : "travellers"}
          </span>
          <span className="type-title tabular-nums text-ink">
            {formatINR(total)}
          </span>
        </div>
      </div>

      <Link
        href={bookingHref}
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
            Talk to Nisha, our expert
          </span>
          <span className="block text-xs font-medium text-navy-500">
            {site.phone}
          </span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-gold-400">
          <Phone className="h-4 w-4" />
        </span>
      </a>
    </div>
  );
}

/**
 * Keeps the booking card docked to the bottom of the viewport on desktop.
 * The sticky top offset is the card's own height, so the card stays pinned to
 * the bottom edge while the itinerary scrolls and releases at the end of the
 * column.
 */
export function BookingCardDock({ children }: { children: ReactNode }) {
  const node = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    const element = node.current;
    if (!element) return;

    const update = () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        setTop(null);
        return;
      }
      setTop(Math.round(window.innerHeight - element.offsetHeight - 24));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={node} className="lg:sticky" style={top === null ? undefined : { top }}>
      {children}
    </div>
  );
}
