"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Send,
  Ticket,
  Users,
} from "lucide-react";
import type { TourDeparture } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatRange(startDate: string, nights: number) {
  const end = new Date(`${startDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + Math.max(1, nights));
  return `${formatDate(startDate)} – ${dateFormatter.format(end)}`;
}

export function TourBooking({
  tourSlug,
  tourTitle,
  basePrice,
  nights,
  departures,
}: {
  tourSlug: string;
  tourTitle: string;
  basePrice: number;
  nights: number;
  departures: TourDeparture[];
}) {
  const bookable = useMemo(
    () => departures.filter((departure) => departure.seatsLeft > 0),
    [departures],
  );
  const [selectedId, setSelectedId] = useState(bookable[0]?._id ?? "");
  const [travellers, setTravellers] = useState(2);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    company: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  const selected = departures.find(
    (departure) => departure._id === selectedId,
  );
  const maxTravellers = selected ? Math.max(1, selected.seatsLeft) : 10;
  const effectiveTravellers = Math.min(travellers, maxTravellers);
  const total = selected ? selected.price * effectiveTravellers : 0;

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tourSlug,
          tourTitle,
          departureId: selected?._id ?? "",
          travellers: effectiveTravellers,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "We could not complete that booking.");
      }

      setStatus("done");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not complete that booking. Please call us.",
      );
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <section
        id="book"
        className="scroll-mt-28 rounded-[32px] border border-navy-200 bg-navy-50 p-7 text-center sm:p-10"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy-600 text-white">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-navy-950">
          Booking request received.
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-stone-600">
          Thank you, {form.name.split(" ")[0] || "traveller"}. We have reserved
          your seats on <strong>{tourTitle}</strong>
          {selected ? ` for ${formatDate(selected.startDate)}` : ""} for{" "}
          {effectiveTravellers}{" "}
          {effectiveTravellers === 1 ? "traveller" : "travellers"}. Our team will
          call you within one working day to confirm and collect payment.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setForm((current) => ({ ...current, notes: "" }));
          }}
          className="btn-outline mt-6"
        >
          Make another booking
        </button>
      </section>
    );
  }

  return (
    <section
      id="book"
      className="scroll-mt-28 rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_18px_60px_-45px_rgba(11,39,53,0.6)] sm:p-8"
    >
      <p className="eyebrow">Book this tour</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-medium text-navy-950">
            Dates &amp; prices
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Pick a departure, choose your travellers and we will hold the seats
            while we confirm your booking.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-stone-600">
          <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
          {nights}N / {nights + 1}D
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {departures.length ? (
            <div className="space-y-3">
              {departures.map((departure) => {
                const soldOut = departure.seatsLeft <= 0;
                const low = !soldOut && departure.seatsLeft <= 5;

                return (
                  <label
                    key={departure._id}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition",
                      soldOut
                        ? "cursor-not-allowed border-stone-200 bg-stone-50 opacity-70"
                        : "border-stone-200 hover:border-blue-300",
                      "has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:shadow-md has-[:checked]:shadow-blue-900/5",
                    )}
                  >
                    <input
                      type="radio"
                      name="departure"
                      value={departure._id}
                      checked={selectedId === departure._id}
                      disabled={soldOut}
                      onChange={() => {
                        setSelectedId(departure._id);
                        setTravellers((current) =>
                          Math.min(current, Math.max(1, departure.seatsLeft)),
                        );
                      }}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-full",
                        selectedId === departure._id && !soldOut
                          ? "bg-blue-600 text-white"
                          : "bg-sand-100 text-navy-950",
                      )}
                    >
                      <Ticket className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-navy-950">
                        {formatRange(departure.startDate, nights)}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold text-stone-500">
                        {formatINR(departure.price)} per person
                        {departure.note ? ` · ${departure.note}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-lg font-semibold text-navy-950">
                        {formatINR(departure.price)}
                      </span>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em]",
                          soldOut
                            ? "bg-red-100 text-red-700"
                            : low
                              ? "bg-gold-100 text-gold-800"
                              : "bg-navy-100 text-navy-800",
                        )}
                      >
                        {soldOut
                          ? "Sold out"
                          : `${departure.seatsLeft} seats left`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-sand-50 p-6">
              <p className="font-display text-xl font-semibold text-navy-950">
                New dates are being finalised.
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Send a booking request and our team will share the next
                available departures and a personalised quote. You can also
                call us on +91 98204 12345.
              </p>
            </div>
          )}

          {departures.length && !bookable.length ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              All listed departures are sold out. Send a request and we will
              add a new date for you.
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-stone-200 bg-sand-50/70 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-stone-500">
              Your booking
            </p>
            {selected ? (
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                {formatDate(selected.startDate)}
              </span>
            ) : (
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                Request a date
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            <div>
              <label htmlFor="booking-name" className="field-label">
                Full name
              </label>
              <input
                id="booking-name"
                required
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="field"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="booking-phone" className="field-label">
                  Phone
                </label>
                <input
                  id="booking-phone"
                  required
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="+91 98765 43210"
                  inputMode="tel"
                  autoComplete="tel"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="booking-email" className="field-label">
                  Email
                </label>
                <input
                  id="booking-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="booking-travellers" className="field-label">
                Travellers
              </label>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-stone-200 bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setTravellers((current) => Math.max(1, current - 1))
                    }
                    className="grid h-10 w-10 place-items-center text-lg font-bold text-navy-950 transition hover:text-blue-700"
                    aria-label="Remove one traveller"
                  >
                    −
                  </button>
                  <input
                    id="booking-travellers"
                    type="number"
                    min="1"
                    max={maxTravellers}
                    value={effectiveTravellers}
                    onChange={(event) =>
                      setTravellers(
                        Math.min(
                          maxTravellers,
                          Math.max(1, Number(event.target.value) || 1),
                        ),
                      )
                    }
                    className="h-10 w-12 border-x border-stone-200 bg-white text-center text-sm font-extrabold text-navy-950 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setTravellers((current) =>
                        Math.min(maxTravellers, current + 1),
                      )
                    }
                    className="grid h-10 w-10 place-items-center text-lg font-bold text-navy-950 transition hover:text-blue-700"
                    aria-label="Add one traveller"
                  >
                    +
                  </button>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-stone-500">
                  <Users className="h-4 w-4 text-blue-600" />
                  {selected ? `${selected.seatsLeft} seats left` : "Group size on request"}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="booking-notes" className="field-label">
                Anything we should know?
              </label>
              <textarea
                id="booking-notes"
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                rows={2}
                placeholder="Preferred date, dietary needs, rooms…"
                className="field resize-none"
              />
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="booking-company">Company</label>
              <input
                id="booking-company"
                tabIndex={-1}
                autoComplete="off"
                value={form.company}
                onChange={(event) => update("company", event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-dashed border-stone-300 pt-4">
            <span className="text-sm font-bold uppercase tracking-wider text-stone-400">
              Total
            </span>
            <span className="text-right">
              <span className="block font-display text-2xl font-semibold text-navy-950">
                {selected ? formatINR(total) : `From ${formatINR(basePrice)}`}
              </span>
              <span className="text-sm font-semibold text-stone-400">
                {selected
                  ? `${formatINR(selected.price)} × ${effectiveTravellers} ${
                      effectiveTravellers === 1 ? "traveller" : "travellers"
                    }`
                  : "per person · final quote on request"}
              </span>
            </span>
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-primary mt-4 w-full disabled:opacity-70"
          >
            {status === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {status === "sending" ? "Reserving your seats" : "Book now"}
          </button>

          {status === "error" ? (
            <p className="mt-3 text-center text-sm font-semibold text-red-600">
              {error} You can also call us on +91 98204 12345.
            </p>
          ) : null}

          <p className="mt-3 text-center text-sm leading-5 text-stone-400">
            No payment now. Our team confirms availability and payment options
            within one working day.
          </p>
        </form>
      </div>
    </section>
  );
}
