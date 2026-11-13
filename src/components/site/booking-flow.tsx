"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Clock,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Rating } from "@/components/site/rating";
import { Stamp } from "@/components/site/stamp";
import { site } from "@/data/site";
import type { TourDeparture } from "@/lib/types";
import { cn, formatINR, imageUrl } from "@/lib/utils";

const STEPS = ["Trip details", "Lead traveller", "Add-ons", "Payment"];

const CITIES = [
  { name: "Mumbai", note: "Flight + tour · meet at the airport", delta: 0 },
  { name: "Delhi", note: "Flight + tour · meet at the airport", delta: -2400 },
  { name: "Bengaluru", note: "Flight + tour · meet at the airport", delta: 3800 },
  { name: "Pune", note: "Flight via Mumbai", delta: 1900 },
  { name: "Join at destination", note: "Tour only · book your own flights", delta: -9500 },
];

const ADDONS = [
  {
    id: "insurance",
    title: "Travel insurance",
    description: "Medical cover up to ₹5 lakh, trip cancellation and lost baggage.",
    price: 1450,
    icon: "☂",
  },
  {
    id: "gondola",
    title: "Gondola phase 2",
    description: "Ride on to the peak. Usually sells out on the day.",
    price: 1800,
    icon: "⛰",
  },
  {
    id: "houseboat",
    title: "Extra night on the houseboat",
    description: "Arrive a day early and settle in slowly.",
    price: 6200,
    icon: "⛵",
  },
  {
    id: "room",
    title: "Private room upgrade",
    description: "A room to yourselves instead of sharing.",
    price: 9500,
    icon: "✦",
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const longDateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function BookingFlow({
  tour,
  departures,
}: {
  tour: {
    slug: string;
    title: string;
    image: string;
    price: number;
    oldPrice?: number;
    nights: number;
    days: number;
    rating: number;
    reviews: number;
    destinationName: string;
  };
  departures: TourDeparture[];
}) {
  const fallback = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, index) => {
        const start = new Date();
        start.setUTCDate(start.getUTCDate() + 10 + index * 3);
        const seats = [6, 18, 3, 12, 0, 9][index % 6] ?? 10;
        return {
          _id: `fallback-${index}`,
          tourSlug: tour.slug,
          startDate: start.toISOString().slice(0, 10),
          price: tour.price,
          capacity: 26,
          booked: 26 - seats,
          seatsLeft: seats,
          note: undefined,
          createdAt: 0,
        } satisfies TourDeparture;
      }),
    [tour.price, tour.slug],
  );

  const dates = departures.length ? departures : fallback;
  const [step, setStep] = useState(0);
  const [dateId, setDateId] = useState(
    dates.find((date) => date.seatsLeft > 0)?._id ?? dates[0]?._id ?? "",
  );
  const [city, setCity] = useState(CITIES[0].name);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [lead, setLead] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "Indian",
    requests: "",
    updates: true,
  });
  const [addons, setAddons] = useState<string[]>(["insurance", "gondola"]);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [plan, setPlan] = useState("25");
  const [method, setMethod] = useState("UPI");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [bookingRef, setBookingRef] = useState("");

  const selectedDate = dates.find((date) => date._id === dateId) ?? dates[0];
  const cityOption = CITIES.find((item) => item.name === city) ?? CITIES[0];
  const travellers = adults + children;
  const adultPrice = (selectedDate?.price ?? tour.price) + cityOption.delta;
  const childPrice = Math.round(adultPrice * 0.75);
  const addonTotal =
    ADDONS.filter((addon) => addons.includes(addon.id)).reduce(
      (sum, addon) => sum + addon.price * travellers,
      0,
    );
  const baseTotal = adultPrice * adults + childPrice * children;
  const promoSaving = promoApplied ? Math.min(11200, Math.round(baseTotal * 0.1)) : 0;
  const subtotal = baseTotal + addonTotal - promoSaving;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;
  const due = Math.round(total * 0.25);
  const fullPayment = Math.round(total * 0.98);
  const emi = Math.round(total / 6);
  const payNow =
    plan === "full" ? fullPayment : plan === "emi" ? emi : due;
  const balance = total - due;

  function toggleAddon(id: string) {
    setAddons((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function submitBooking() {
    setStatus("sending");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          notes: `City: ${city}. Add-ons: ${addons.join(", ")}. ${lead.requests}`,
          tourSlug: tour.slug,
          tourTitle: tour.title,
          departureId: selectedDate?._id?.startsWith("fallback")
            ? ""
            : selectedDate?._id,
          travellers,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setBookingRef(
        `HM-26-${Math.floor(10000 + Math.random() * 89999)}`,
      );
      setStep(4);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  if (step === 4) {
    return (
      <>
        <div className="on-ink relative overflow-hidden bg-ink">
          <div className="container-page flex flex-col items-center gap-6 py-20 text-center md:py-24">
            <Stamp size={140} text="BOOKED · SEE YOU THERE · WANDER WELL · " />
            <h1 className="type-h1 text-paper">
              You&apos;re going to {tour.destinationName}!
            </h1>
            <p className="type-lead max-w-2xl text-navy-200">
              Booking {bookingRef} is confirmed for {travellers}{" "}
              {travellers === 1 ? "traveller" : "travellers"}. Tickets and a
              welcome pack are on their way to {lead.email || "your inbox"}.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/" className="btn btn-primary btn-lg">
                Back to home
                <span className="btn-dot">→</span>
              </Link>
              <Link href="/tours" className="btn btn-ghost btn-lg">
                Browse more tours
              </Link>
            </div>
          </div>
        </div>

        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_440px]">
          <div>
            <p className="type-label text-gold-600">What happens next</p>
            <h2 className="type-h3 mt-2 text-ink">Your countdown to departure</h2>
            <div className="mt-8 space-y-0">
              {[
                ["Today", "Payment received", "Confirmation and invoice sent to your email.", true],
                ["Within 48 hours", "Meet your tour leader", "They will add you to the group's WhatsApp and say hello.", false],
                ["30 days before", "Balance due", `Plus ID details for all ${travellers} travellers.`, false],
                ["7 days before", "Final trip pack", "Tickets, hotel list, packing guide and emergency contacts.", false],
                ["Departure day", "Group meets at the airport", "Look for the Hidden Miles flag. We'll be there.", false],
              ].map(([when, title, description, done], index) => (
                <div key={title as string} className="grid grid-cols-[40px_1fr] gap-5">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold",
                        done
                          ? "bg-gold-400 text-ink"
                          : "border border-sand-300 bg-paper text-navy-500",
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    {index < 4 ? (
                      <span className="my-1 h-10 border-l-[1.5px] border-dashed border-sand-300" />
                    ) : null}
                  </div>
                  <div className={index < 4 ? "pb-8" : ""}>
                    <p className="type-label text-gold-600">{when}</p>
                    <p className="type-title mt-1 text-ink">{title}</p>
                    <p className="type-small mt-1 text-navy-700">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-sand-300 bg-paper p-7">
            <div className="relative aspect-[376/180] overflow-hidden rounded-[20px] bg-ink">
              <Image
                src={imageUrl(tour.image, 800)}
                alt={tour.title}
                fill
                sizes="376px"
                className="object-cover"
              />
            </div>
            <h2 className="type-h4 mt-4 text-ink">{tour.title}</h2>
            <dl className="mt-4 space-y-3">
              {[
                ["Booking ref", bookingRef],
                ["Departure", selectedDate ? longDateFormatter.format(new Date(`${selectedDate.startDate}T00:00:00Z`)) : "—"],
                ["From", city],
                ["Travellers", `${adults} adults · ${children} children`],
                ["Paid", `${formatINR(payNow)} of ${formatINR(total)}`],
              ].map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <dt className="text-[13px] font-medium text-navy-500">{key}</dt>
                  <dd className="text-[13px] font-bold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <Link href="/" className="btn btn-outline mt-6 w-full">
              Add dates to calendar
              <span className="btn-dot">→</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-sand-100">
      <CheckoutHeader step={step} />

      <div className="container-page grid gap-10 py-10 md:py-16 xl:grid-cols-[1fr_420px] xl:items-start">
        <div>
          <p className="type-label text-gold-600">Step {step + 1} of 4</p>
          <h1 className="type-h2 mt-3 text-ink">
            {step === 0
              ? "Plan your group departure."
              : step === 1
                ? "Who's leading the group?"
                : step === 2
                  ? "Make it even easier."
                  : "Almost there."}
          </h1>
          <p className="type-body mt-3 max-w-xl text-navy-700">
            {step === 0
              ? "Pick a start date, where you'll join from and who's coming. Prices update as you go."
              : step === 1
                ? "We only need the lead traveller's details now. We'll collect ID details for everyone 30 days before departure."
                : step === 2
                  ? "Optional extras chosen by past travellers on this tour. Added for all travellers."
                  : `Pay ${formatINR(due)} now to confirm your seats. The balance is due 30 days before departure.`}
          </p>

          {step === 3 ? (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-sand-300 bg-paper px-5 py-3.5">
              <Clock className="h-4 w-4 text-gold-600" />
              <span className="text-sm font-bold text-ink">
                We&apos;re holding {travellers} seats for you
              </span>
              <span className="ml-auto text-sm font-bold text-danger">
                18:42 left
              </span>
            </div>
          ) : null}

          <div className="mt-7 space-y-6">
            {step === 0 ? (
              <>
                <SectionCard
                  title="1. Choose a departure date"
                  subtitle="Every departure is an escorted group of up to 26 travellers."
                >
                  <div className="flex flex-wrap gap-2">
                    {["Dec – Jan", "Feb – Mar", "Apr – May", "Jun – Aug"].map(
                      (month, index) => (
                        <span
                          key={month}
                          className={`chip ${index === 0 ? "chip-active" : ""}`}
                        >
                          {month}
                        </span>
                      ),
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {dates.slice(0, 18).map((date) => {
                      const sold = date.seatsLeft <= 0;
                      const low = !sold && date.seatsLeft <= 5;
                      const active = dateId === date._id;
                      return (
                        <button
                          key={date._id}
                          type="button"
                          disabled={sold}
                          onClick={() => setDateId(date._id)}
                          className={cn(
                            "rounded-[12px] border-[1.5px] px-3 py-2.5 text-left transition",
                            active
                              ? "border-ink bg-ink text-paper"
                              : sold
                                ? "border-sand-300 bg-sand-100 text-navy-400"
                                : "border-sand-300 bg-paper text-ink hover:border-navy-300",
                          )}
                        >
                          <span className={cn("block text-[13px] font-bold", sold && "line-through")}>
                            {dateFormatter.format(new Date(`${date.startDate}T00:00:00Z`))}
                          </span>
                          <span className={cn("mt-0.5 block text-[12px] font-medium", active ? "text-navy-200" : "text-navy-500")}>
                            {sold ? "Sold out" : formatINR(date.price)}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block text-[11px] font-bold",
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
                </SectionCard>

                <SectionCard
                  title="2. Departure city"
                  subtitle="Where will you start? Flights from your city are included in the price."
                >
                  <div className="grid gap-2.5">
                    {CITIES.map((option) => (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setCity(option.name)}
                        className={cn(
                          "flex items-center gap-4 rounded-[16px] border-[1.5px] px-5 py-4 text-left transition",
                          city === option.name
                            ? "border-blue-500 bg-blue-50"
                            : "border-sand-300 bg-paper hover:border-navy-300",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2",
                            city === option.name
                              ? "border-blue-500"
                              : "border-sand-300",
                          )}
                        >
                          {city === option.name ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          ) : null}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-bold text-ink">
                            {option.name}
                          </span>
                          <span className="block text-[13px] font-medium text-navy-500">
                            {option.note}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "text-sm font-bold",
                            option.delta < 0 ? "text-success" : "text-ink",
                          )}
                        >
                          {option.delta === 0
                            ? "Included"
                            : `${option.delta > 0 ? "+" : "–"} ${formatINR(Math.abs(option.delta))}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  title="3. Who's travelling?"
                  subtitle="Children's prices apply to ages 5–11. Under 5 travel free on a parent's lap."
                >
                  <div className="grid gap-3">
                    <Counter
                      label="Adults"
                      sub={`12 years and above · ${formatINR(adultPrice)} each`}
                      value={adults}
                      min={1}
                      onChange={setAdults}
                    />
                    <Counter
                      label="Children"
                      sub={`5 – 11 years · ${formatINR(childPrice)} each`}
                      value={children}
                      min={0}
                      onChange={setChildren}
                    />
                    <Counter
                      label="Infants"
                      sub="Under 5 · free"
                      value={0}
                      min={0}
                      onChange={() => undefined}
                    />
                  </div>
                  <p className="mt-4 rounded-[14px] bg-blue-50 px-4 py-3 text-[13px] font-medium text-blue-700">
                    ⓘ Travelling as 6 or more? You&apos;ll get a group discount of
                    5% at payment.
                  </p>
                </SectionCard>

                <StepActions
                  backHref={`/tours/${tour.slug}`}
                  backLabel="← Back to tour"
                  next={() => setStep(1)}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <SectionCard
                  title="Lead traveller"
                  subtitle="Tickets, invoices and trip updates go to this person."
                >
                  <div className="grid gap-4">
                    <div>
                      <label htmlFor="lead-name" className="field-label">
                        Full name
                      </label>
                      <input
                        id="lead-name"
                        value={lead.name}
                        onChange={(event) =>
                          setLead((current) => ({ ...current, name: event.target.value }))
                        }
                        placeholder="As on government ID"
                        autoComplete="name"
                        className="field"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="lead-email" className="field-label">
                          Email
                        </label>
                        <input
                          id="lead-email"
                          type="email"
                          value={lead.email}
                          onChange={(event) =>
                            setLead((current) => ({ ...current, email: event.target.value }))
                          }
                          placeholder="you@email.com"
                          autoComplete="email"
                          className="field"
                        />
                      </div>
                      <div>
                        <label htmlFor="lead-phone" className="field-label">
                          Phone
                        </label>
                        <input
                          id="lead-phone"
                          value={lead.phone}
                          onChange={(event) =>
                            setLead((current) => ({ ...current, phone: event.target.value }))
                          }
                          placeholder="+91"
                          autoComplete="tel"
                          className="field"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="field-label">Nationality</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {["Indian", "Other nationality"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setLead((current) => ({ ...current, nationality: option }))
                            }
                            className={cn(
                              "flex items-center gap-3 rounded-[14px] border-[1.5px] px-4 py-3.5 text-left text-sm font-bold",
                              lead.nationality === option
                                ? "border-blue-500 bg-blue-50 text-ink"
                                : "border-sand-300 bg-paper text-navy-700",
                            )}
                          >
                            <span
                              className={cn(
                                "grid h-[22px] w-[22px] place-items-center rounded-[6px] border-[1.5px]",
                                lead.nationality === option
                                  ? "border-blue-500 bg-blue-500 text-white"
                                  : "border-sand-300",
                              )}
                            >
                              {lead.nationality === option ? (
                                <Check className="h-3 w-3" />
                              ) : null}
                            </span>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Anything we should know?"
                  subtitle="Dietary needs, mobility, celebrations — optional."
                >
                  <label htmlFor="lead-requests" className="sr-only">
                    Special requests
                  </label>
                  <textarea
                    id="lead-requests"
                    rows={4}
                    value={lead.requests}
                    onChange={(event) =>
                      setLead((current) => ({ ...current, requests: event.target.value }))
                    }
                    placeholder="e.g. vegetarian meals, ground-floor room, anniversary on day 3…"
                    className="field resize-none"
                  />
                </SectionCard>

                <label className="flex items-center gap-3 text-[13px] font-medium text-navy-700">
                  <input
                    type="checkbox"
                    checked={lead.updates}
                    onChange={(event) =>
                      setLead((current) => ({ ...current, updates: event.target.checked }))
                    }
                    className="h-[22px] w-[22px] rounded-[6px] accent-ink"
                  />
                  Send me trip updates on WhatsApp.
                </label>

                <StepActions
                  back={() => setStep(0)}
                  backLabel="← Back to trip details"
                  next={() => {
                    if (!lead.name || !lead.email || !lead.phone) return;
                    setStep(2);
                  }}
                  nextLabel="Continue to add-ons"
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <SectionCard title="Recommended for this tour">
                  <div className="grid gap-3">
                    {ADDONS.map((addon) => {
                      const active = addons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon.id)}
                          className={cn(
                            "flex items-center gap-5 rounded-[20px] border p-5 text-left transition",
                            active
                              ? "border-ink bg-paper"
                              : "border-sand-300 bg-paper",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[16px] text-xl",
                              active
                                ? "bg-gold-100 text-gold-600"
                                : "bg-sand-200 text-ink",
                            )}
                          >
                            {addon.icon}
                          </span>
                          <span className="flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-ink">
                                {addon.title}
                              </span>
                              {active ? (
                                <span className="badge badge-success">Popular</span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-[13px] font-medium text-navy-500">
                              {addon.description}
                            </span>
                          </span>
                          <span className="text-right">
                            <span className="block text-sm font-bold text-ink">
                              {formatINR(addon.price)}
                            </span>
                            <span className="block text-xs font-medium text-navy-400">
                              per person
                            </span>
                          </span>
                          <span
                            className={cn(
                              "relative h-7 w-12 shrink-0 rounded-full transition",
                              active ? "bg-ink" : "bg-sand-300",
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-1 h-5 w-5 rounded-full transition",
                                active ? "left-6 bg-gold-400" : "left-1 bg-paper",
                              )}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </SectionCard>

                <SectionCard title="Have a promo code?">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[200px] flex-1">
                      <label htmlFor="promo-code" className="field-label">
                        Code
                      </label>
                      <input
                        id="promo-code"
                        value={promo}
                        onChange={(event) => setPromo(event.target.value.toUpperCase())}
                        placeholder="EARLYBIRD"
                        className="field"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromoApplied(promo.trim().length > 0)}
                      className="btn btn-outline"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied ? (
                    <p className="mt-4 rounded-[12px] bg-success-soft px-4 py-3 text-sm font-bold text-success">
                      ✓ {promo} applied — you save ₹11,200
                    </p>
                  ) : null}
                </SectionCard>

                <StepActions
                  back={() => setStep(1)}
                  backLabel="← Back to lead traveller"
                  next={() => setStep(3)}
                  nextLabel="Continue to payment"
                />
              </>
            ) : null}

            {step === 3 ? (
              <>
                <SectionCard title="How much would you like to pay?">
                  <div className="grid gap-2.5">
                    {[
                      {
                        id: "25",
                        title: "Reserve with 25%",
                        description: `${formatINR(due)} today · ${formatINR(balance)} later`,
                        price: due,
                      },
                      {
                        id: "full",
                        title: "Pay in full",
                        description: "One payment, nothing to remember — and 2% off.",
                        price: fullPayment,
                      },
                      {
                        id: "emi",
                        title: "No-cost EMI",
                        description: "6 months on major credit cards.",
                        price: emi,
                      },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPlan(option.id)}
                        className={cn(
                          "flex items-center gap-4 rounded-[16px] border-[1.5px] p-5 text-left transition",
                          plan === option.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-sand-300 bg-paper hover:border-navy-300",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2",
                            plan === option.id ? "border-blue-500" : "border-sand-300",
                          )}
                        >
                          {plan === option.id ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          ) : null}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-bold text-ink">
                            {option.title}
                          </span>
                          <span className="block text-[13px] font-medium text-navy-500">
                            {option.description}
                          </span>
                        </span>
                        <span className="text-sm font-bold text-ink">
                          {formatINR(option.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Payment method">
                  <div className="flex flex-wrap gap-2">
                    {["UPI", "Card", "Net banking", "Wallet"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setMethod(item)}
                        className={cn(
                          "rounded-[14px] border-[1.5px] px-5 py-3 text-sm font-bold transition",
                          method === item
                            ? "border-ink bg-ink text-paper"
                            : "border-sand-300 bg-paper text-ink",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col items-center gap-6 rounded-[20px] bg-sand-100 p-6 sm:flex-row">
                    <div className="grid h-[148px] w-[148px] shrink-0 grid-cols-7 gap-0.5 rounded-[16px] border border-sand-300 bg-paper p-4">
                      {Array.from({ length: 49 }).map((_, index) => (
                        <span
                          key={index}
                          className={cn(
                            "rounded-[2px]",
                            (index * 7 + index) % 3 === 0 ||
                              [0, 1, 2, 7, 14, 6, 13, 20, 42, 43, 44, 35, 28].includes(
                                index,
                              )
                              ? "bg-ink"
                              : "bg-transparent",
                          )}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="type-title text-ink">Scan with any UPI app</p>
                      <p className="type-small mt-2 text-navy-700">
                        GPay, PhonePe, Paytm or your bank app. The page updates as
                        soon as the payment goes through.
                      </p>
                      <div className="mt-4 flex flex-wrap items-end gap-2">
                        <div className="min-w-[180px] flex-1">
                          <label htmlFor="upi-id" className="field-label">
                            Or enter your UPI ID
                          </label>
                          <input
                            id="upi-id"
                            placeholder="you@okhdfc"
                            className="field"
                          />
                        </div>
                        <button type="button" className="btn btn-outline">
                          Verify
                        </button>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Billing & GST"
                  subtitle="Optional — add your GSTIN to claim input credit."
                >
                  <input
                    placeholder="GSTIN"
                    aria-label="GSTIN"
                    className="field max-w-xs"
                  />
                </SectionCard>

                <label className="flex items-start gap-3 text-[13px] font-medium text-navy-700">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) => setAgree(event.target.checked)}
                    className="mt-0.5 h-[22px] w-[22px] rounded-[6px] accent-ink"
                  />
                  I agree to the booking terms, cancellation policy and privacy
                  policy.
                </label>

                {status === "error" ? (
                  <p className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
                    We could not complete that payment. Please try again or call{" "}
                    {site.phone}.
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-bold text-navy-700"
                  >
                    ← Back to add-ons
                  </button>
                  <button
                    type="button"
                    disabled={!agree || status === "sending"}
                    onClick={submitBooking}
                    className="btn btn-primary btn-lg disabled:opacity-50"
                  >
                    {status === "sending" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Pay {formatINR(payNow)} securely
                    <span className="btn-dot">→</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-5 pb-4 text-[13px] font-bold text-navy-500">
                  <span>🔒 256-bit SSL</span>
                  <span>PCI-DSS compliant</span>
                  <span>Razorpay secured</span>
                  <span>IATA accredited</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-[28px] border border-sand-300 bg-paper p-7 shadow-[0_16px_40px_-32px_rgba(11,39,53,0.3)]">
            <div className="flex items-center gap-4">
              <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[16px] bg-ink">
                <Image
                  src={imageUrl(tour.image, 300)}
                  alt={tour.title}
                  fill
                  sizes="88px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="type-h4 text-ink">{tour.title}</p>
                <p className="type-small mt-1 text-navy-500">
                  {tour.days} days · Group tour
                </p>
                <Rating score={tour.rating.toFixed(1)} count={tour.reviews} className="mt-1" />
              </div>
            </div>

            <div className="route-line my-5" />

            <dl className="space-y-2.5">
              {[
                ["Departure", selectedDate ? longDateFormatter.format(new Date(`${selectedDate.startDate}T00:00:00Z`)) : "—"],
                ["From", city],
                ["Travellers", `${adults} adults · ${children} children`],
              ].map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <dt className="text-[13px] font-medium text-navy-500">{key}</dt>
                  <dd className="text-[13px] font-bold text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="route-line my-5" />

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-4 text-[13px]">
                <span className="text-navy-700">
                  Adults · {formatINR(adultPrice)} × {adults}
                </span>
                <span className="font-bold text-ink">{formatINR(adultPrice * adults)}</span>
              </div>
              {children ? (
                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-navy-700">
                    Children · {formatINR(childPrice)} × {children}
                  </span>
                  <span className="font-bold text-ink">{formatINR(childPrice * children)}</span>
                </div>
              ) : null}
              {addonTotal ? (
                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-navy-700">Add-ons</span>
                  <span className="font-bold text-ink">{formatINR(addonTotal)}</span>
                </div>
              ) : null}
              {promoApplied ? (
                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-success">
                    {promo || "Promo"} saving
                  </span>
                  <span className="font-bold text-success">
                    – {formatINR(promoSaving)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 text-[13px]">
                <span className="text-navy-700">GST (5%)</span>
                <span className="font-bold text-ink">{formatINR(gst)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-sand-300 pt-5">
              <div>
                <p className="type-title text-ink">Total</p>
                <p className="text-xs font-medium text-navy-500">
                  {travellers} travellers · incl. taxes
                </p>
              </div>
              <p className="text-2xl font-extrabold tracking-[-0.02em] text-ink">
                {formatINR(total)}
              </p>
            </div>

            {step === 3 ? (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-[14px] bg-gold-100 px-4 py-3">
                <span className="text-sm font-bold text-ink">Due today (25%)</span>
                <span className="type-title text-ink">{formatINR(payNow)}</span>
              </div>
            ) : null}

            <div className="mt-5 space-y-2.5">
              {[
                "Free date change up to 30 days before travel",
                "Full refund if we cancel — no questions",
                "Your seats are held for 20 minutes",
              ].map((point) => (
                <p key={point} className="flex items-start gap-2 text-[12px] font-medium text-navy-700">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  {point}
                </p>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckoutHeader({ step }: { step: number }) {
  return (
    <div className="border-b border-sand-300 bg-paper">
      <div className="container-page flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <Logo compact />
        <div className="flex flex-wrap items-center gap-2.5">
          {STEPS.map((label, index) => {
            const done = index < step;
            const current = index === step;
            return (
              <div key={label} className="flex items-center gap-2.5">
                {index ? (
                  <span
                    className={cn(
                      "h-px w-5 border-t-[1.5px] border-dashed",
                      index <= step ? "border-gold-600" : "border-sand-300",
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full text-xs font-bold",
                    done
                      ? "bg-gold-400 text-ink"
                      : current
                        ? "bg-ink text-gold-400"
                        : "border border-sand-300 bg-paper text-navy-500",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-[13px] font-bold sm:block",
                    done || current ? "text-ink" : "text-navy-500",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-right">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-success">
            <Lock className="h-3.5 w-3.5" /> Secure checkout
          </p>
          <p className="text-[13px] font-medium text-navy-700">
            Help: {site.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-sand-300 bg-paper p-7 md:p-9">
      <h2 className="type-h4 text-ink">{title}</h2>
      {subtitle ? (
        <p className="type-small mt-1.5 text-navy-500">{subtitle}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Counter({
  label,
  sub,
  value,
  min,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] border border-sand-300 bg-paper px-5 py-4">
      <div>
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="text-[13px] font-medium text-navy-500">{sub}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-sand-300 text-ink"
          aria-label={`Remove one ${label.toLowerCase()}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-5 text-center text-sm font-bold text-ink">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="grid h-10 w-10 place-items-center rounded-full bg-ink text-gold-400"
          aria-label={`Add one ${label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StepActions({
  back,
  backHref,
  backLabel,
  next,
  nextLabel = "Continue",
}: {
  back?: () => void;
  backHref?: string;
  backLabel: string;
  next: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {backHref ? (
        <Link href={backHref} className="text-sm font-bold text-navy-700">
          {backLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={back}
          className="text-sm font-bold text-navy-700"
        >
          {backLabel}
        </button>
      )}
      <button type="button" onClick={next} className="btn btn-ink btn-lg">
        {nextLabel}
        <span className="btn-dot">→</span>
      </button>
    </div>
  );
}
