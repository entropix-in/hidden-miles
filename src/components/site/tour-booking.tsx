"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
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

  const selected = departures.find((departure) => departure._id === selectedId);
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
      <div
        id="book"
        className="scroll-mt-32 rounded-[28px] border border-sand-300 bg-paper p-8 text-center md:p-12"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-gold-400">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="type-h3 mt-5 text-ink">Booking request received.</h2>
        <p className="type-body mx-auto mt-2 max-w-lg text-navy-700">
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
          className="btn btn-outline mt-6"
        >
          Make another booking
        </button>
      </div>
    );
  }

  return (
    <div
      id="book"
      className="scroll-mt-32 rounded-[28px] border border-sand-300 bg-paper p-7 md:p-9"
    >
      <p className="type-label text-gold-600">Complete your booking</p>
      <h2 className="type-h3 mt-2 text-ink">Choose your departure</h2>
      <p className="type-small mt-2 text-navy-500">
        Pick a date and tell us who&apos;s coming. We&apos;ll hold the seats while
        we confirm.
      </p>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {departures.length ? (
            <div className="grid gap-3">
              {departures.map((departure) => {
                const soldOut = departure.seatsLeft <= 0;
                const low = !soldOut && departure.seatsLeft <= 5;

                return (
                  <label
                    key={departure._id}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-[16px] border-[1.5px] p-4 transition",
                      soldOut
                        ? "cursor-not-allowed border-sand-300 bg-sand-100 opacity-70"
                        : "border-sand-300 bg-paper hover:border-navy-300",
                      selectedId === departure._id &&
                        !soldOut &&
                        "border-ink bg-sand-100",
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
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-ink">
                        {formatRange(departure.startDate, nights)}
                      </span>
                      <span className="mt-0.5 block text-[13px] font-medium text-navy-500">
                        {formatINR(departure.price)} per person
                        {departure.note ? ` · ${departure.note}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-bold text-ink">
                        {formatINR(departure.price)}
                      </span>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em]",
                          soldOut
                            ? "bg-danger-soft text-danger"
                            : low
                              ? "bg-gold-100 text-gold-700"
                              : "bg-success-soft text-success",
                        )}
                      >
                        {soldOut ? "Sold out" : `${departure.seatsLeft} seats left`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[16px] border border-dashed border-sand-300 bg-sand-100 p-6">
              <p className="type-title text-ink">New dates are being finalised.</p>
              <p className="type-small mt-2 text-navy-700">
                Send a booking request and our team will share the next available
                departures and a personalised quote.
              </p>
            </div>
          )}

          <div className="mt-5">
            <label htmlFor="booking-travellers" className="field-label">
              Travellers
            </label>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-sand-300 bg-paper">
                <button
                  type="button"
                  onClick={() => setTravellers((current) => Math.max(1, current - 1))}
                  className="grid h-10 w-10 place-items-center text-lg font-bold text-ink transition hover:text-gold-600"
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
                  className="h-10 w-12 border-x border-sand-300 bg-paper text-center text-sm font-bold text-ink outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setTravellers((current) => Math.min(maxTravellers, current + 1))
                  }
                  className="grid h-10 w-10 place-items-center text-lg font-bold text-ink transition hover:text-gold-600"
                  aria-label="Add one traveller"
                >
                  +
                </button>
              </div>
              <span className="text-[13px] font-medium text-navy-500">
                {selected ? `${selected.seatsLeft} seats left` : "Group size on request"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[20px] bg-sand-100 p-5">
          <p className="type-label text-navy-500">Lead traveller</p>
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
              <label htmlFor="booking-notes" className="field-label">
                Anything we should know?
              </label>
              <textarea
                id="booking-notes"
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                rows={2}
                placeholder="Dietary needs, rooms, celebrations…"
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

          <div className="mt-5 flex items-end justify-between gap-3 border-t border-dashed border-sand-300 pt-4">
            <div>
              <p className="text-[13px] font-medium text-navy-400">Total</p>
              <p className="type-title text-ink">
                {selected ? formatINR(total) : `From ${formatINR(basePrice)}`}
              </p>
              <p className="text-xs font-medium text-navy-400">
                {selected
                  ? `${formatINR(selected.price)} × ${effectiveTravellers}`
                  : "per person · final quote on request"}
              </p>
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn btn-primary shrink-0 disabled:opacity-70"
            >
              {status === "sending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {status === "sending" ? "Reserving" : "Book now"}
              {status !== "sending" ? <span className="btn-dot">→</span> : null}
            </button>
          </div>

          {status === "error" ? (
            <p className="mt-3 text-sm font-semibold text-danger">
              {error} You can also call us on +91 98204 12345.
            </p>
          ) : null}

          <p className="mt-3 text-xs leading-5 text-navy-400">
            No payment now. Our team confirms availability within one working day.
          </p>
        </form>
      </div>
    </div>
  );
}
