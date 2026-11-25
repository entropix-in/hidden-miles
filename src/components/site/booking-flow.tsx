"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Rating } from "@/components/site/rating";
import { Stamp } from "@/components/site/stamp";
import { site } from "@/data/site";
import type { TourDeparture } from "@/lib/types";
import type { TourCity } from "@/lib/tour-cities";
import { fallbackDepartures } from "@/lib/tour-departures";
import { cn, formatINR, imageUrl } from "@/lib/utils";
import { AddonIconView } from "@/components/site/addon-icon";
import type { TourAddon } from "@/lib/addons";
import { addonQuantity, quoteBooking, type DiscountRule } from "@/lib/pricing";

const STEPS = ["Trip details", "Lead traveller", "Add-ons", "Payment"];


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
  addons: tourAddons,
  automaticDiscounts,
  cities,
  initialDate,
  initialCity,
  initialAdults,
  initialChildren,
  initialInfants,
  account,
}: {
  tour: {
    slug: string;
    title: string;
    image: string;
    price: number;
    childPrice?: number;
    infantPrice?: number;
    oldPrice?: number;
    nights: number;
    days: number;
    rating: number;
    reviews: number;
    destinationName: string;
  };
  departures: TourDeparture[];
  addons: TourAddon[];
  automaticDiscounts: DiscountRule[];
  cities: TourCity[];
  initialDate?: string;
  initialCity?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialInfants?: number;
  account: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const fallback = useMemo(
    () => fallbackDepartures(tour.price, tour.slug),
    [tour.price, tour.slug],
  );

  const dates = departures.length ? departures : fallback;
  const [step, setStep] = useState(0);
  const initialSelectedDate = initialDate
    ? dates.find(
        (date) => date.startDate === initialDate && date.seatsLeft > 0,
      )
    : undefined;
  const [dateId, setDateId] = useState(
    initialSelectedDate?._id ??
      dates.find((date) => date.seatsLeft > 0)?._id ??
      dates[0]?._id ??
      "",
  );
  const [city, setCity] = useState(
    cities.find((item) => item.name === initialCity)?.name ??
      cities[0]?.name ??
      "",
  );
  const [adults, setAdults] = useState(
    initialAdults !== undefined
      ? Math.min(10, Math.max(1, Math.round(initialAdults)))
      : 2,
  );
  const [children, setChildren] = useState(
    initialChildren !== undefined
      ? Math.min(10, Math.max(0, Math.round(initialChildren)))
      : 1,
  );
  const [infants, setInfants] = useState(
    initialInfants !== undefined
      ? Math.min(10, Math.max(0, Math.round(initialInfants)))
      : 0,
  );
  const [lead, setLead] = useState({
    name: account.name,
    email: account.email,
    phone: account.phone,
    nationality: "Indian",
    requests: "",
    updates: true,
  });
  const [addons, setAddons] = useState<string[]>(
    () => tourAddons.filter((addon) => addon.preselected).map((addon) => addon.id),
  );
  const [promo, setPromo] = useState("");
  const [promoRule, setPromoRule] = useState<DiscountRule | null>(null);
  const [promoStatus, setPromoStatus] = useState<"idle" | "checking" | "error">("idle");
  const [promoError, setPromoError] = useState("");
  const [plan, setPlan] = useState("25");
  const [method, setMethod] = useState("UPI");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [leadError, setLeadError] = useState("");
  const [bookingRef, setBookingRef] = useState("");

  const selectedDate = dates.find((date) => date._id === dateId) ?? dates[0];
  const cityOption =
    cities.find((item) => item.name === city) ??
    cities[0] ?? { name: "", note: "", priceDelta: 0 };
  const travellers = adults + children + infants;
  const adultPrice =
    (selectedDate?.price ?? tour.price) + cityOption.priceDelta;
  const childPrice = tour.childPrice ?? Math.round(adultPrice * 0.75);
  const infantPrice = tour.infantPrice ?? 0;
  const quote = quoteBooking({
    adultFare: adultPrice,
    childFare: childPrice,
    infantFare: infantPrice,
    adults,
    children,
    infants,
    addons: tourAddons,
    selectedAddonIds: addons,
    discounts: promoRule ? [...automaticDiscounts, promoRule] : automaticDiscounts,
  });
  const { gst, total } = quote;
  const appliedDiscount = quote.discount;
  const promoBeaten = Boolean(promoRule && appliedDiscount && appliedDiscount.rule.id !== promoRule.id);
  const promoBelowMinimum = Boolean(promoRule && travellers < promoRule.minTravellers);
  const due = Math.round(total * 0.25);
  const fullPayment = Math.round(total * 0.98);
  const emi = Math.round(total / 6);
  const payNow =
    plan === "full" ? fullPayment : plan === "emi" ? emi : due;
  const balance = total - due;
  const travellerSummary = [
    `${adults} ${adults === 1 ? "adult" : "adults"}`,
    children ? `${children} ${children === 1 ? "child" : "children"}` : "",
    infants ? `${infants} ${infants === 1 ? "infant" : "infants"}` : "",
  ].filter(Boolean).join(" · ");

  function toggleAddon(id: string) {
    setAddons((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function applyPromo() {
    const code = promo.trim();
    if (!code) return;
    setPromoStatus("checking");
    setPromoError("");
    try {
      const response = await fetch("/api/discounts/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourSlug: tour.slug, code }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; discount?: DiscountRule };
      if (!response.ok || !data.ok || !data.discount) throw new Error(data.error || "That code isn't valid for this tour.");
      setPromoRule(data.discount);
      setPromoStatus("idle");
    } catch (error) {
      setPromoRule(null);
      setPromoError(error instanceof Error ? error.message : "That code isn't valid for this tour.");
      setPromoStatus("error");
    }
  }

  function removePromo() {
    setPromoRule(null);
    setPromo("");
    setPromoStatus("idle");
    setPromoError("");
  }

  async function submitBooking() {
    setStatus("sending");
    setErrorMessage("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          notes: lead.requests,
          city,
          addons: quote.addons.map((addon) => addon.id),
          promoCode: promoRule?.code ?? "",
          tourSlug: tour.slug,
          tourTitle: tour.title,
          departureId: selectedDate?._id?.startsWith("fallback")
            ? ""
            : selectedDate?._id,
          travellers,
          adults,
          children,
          infants,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        requiresAuth?: boolean;
        bookingId?: number;
      };

      if (response.status === 401 || data.requiresAuth) {
        router.push(
          `/login?next=${encodeURIComponent(
            window.location.pathname + window.location.search,
          )}`,
        );
        return;
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "We could not complete that booking.");
      }

      setBookingRef(`HM-${String(data.bookingId ?? "").padStart(5, "0")}`);
      setStep(4);
      setStatus("idle");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "We could not complete that payment. Please try again or call us.",
      );
      setStatus("error");
    }
  }

  if (step === 4) {
    return (
      <>
        <div className="on-ink relative overflow-hidden bg-ink">
          <div className="container-page flex flex-col items-center gap-6 py-12 text-center md:py-16">
            <Stamp size={140} text="BOOKED · SEE YOU THERE · WANDER WELL · " />
            <h1 className="type-h1 text-paper">
              You&apos;re going to {tour.destinationName}
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

        <div className="container-page grid gap-8 py-12 lg:grid-cols-[1fr_440px]">
          <div>
            <p className="type-label text-gold-600">What happens next</p>
            <h2 className="type-h3 mt-2 text-ink">Your countdown to departure</h2>
            <div className="mt-6 space-y-0">
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
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold",
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

          <div className="rounded-[20px] border border-sand-300 bg-paper p-6">
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
                ["Travellers", travellerSummary],
                ["Paid", `${formatINR(payNow)} of ${formatINR(total)}`],
              ].map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <dt className="text-[13px] font-medium text-navy-500">{key}</dt>
                  <dd className="text-[13px] font-semibold text-ink">{value}</dd>
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
      <CheckoutHeader step={step} email={account.email} />

      <div className="container-page grid gap-8 py-6 md:py-10 xl:grid-cols-[1fr_400px] xl:items-start">
        <div>
          <h1 className="type-h1 text-ink">
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
              ? "Pick a date, a starting city and who's coming."
              : step === 1
                ? "We only need the lead traveller's details now. We'll collect ID details for everyone 30 days before departure."
                : step === 2
                  ? "Optional extras for this tour. Switch on anything you want and we will add it to your booking."
                  : `Pay ${formatINR(due)} now to confirm your seats. The balance is due 30 days before departure.`}
          </p>

          {step === 3 ? (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-sand-300 bg-paper px-5 py-3.5">
              <Clock className="h-4 w-4 text-gold-600" />
              <span className="text-sm font-semibold text-ink">
                We&apos;re holding {travellers} seats for you
              </span>
              <span className="ml-auto text-sm font-semibold text-danger">
                18:42 left
              </span>
            </div>
          ) : null}

          <div className="mt-6 space-y-5">
            {step === 0 ? (
              <>
                <SectionCard
                  title="1. Choose a departure date"
                  subtitle="Every departure is an escorted group of up to 26 travellers."
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
                                ? "border-sand-300 bg-sand-100 text-navy-500"
                                : "border-sand-300 bg-paper text-ink hover:border-navy-300",
                          )}
                        >
                          <span className={cn("block text-[13px] font-semibold", sold && "line-through")}>
                            {dateFormatter.format(new Date(`${date.startDate}T00:00:00Z`))}
                          </span>
                          <span className={cn("mt-0.5 block text-[12px] font-medium", active ? "text-navy-200" : "text-navy-500")}>
                            {sold ? "Sold out" : formatINR(date.price)}
                          </span>
                          <span
                            className={cn(
                              "mt-1 block text-xs font-semibold",
                              active
                                ? "text-gold-400"
                                : sold
                                  ? "text-navy-500"
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
                  subtitle="Where will you start? Fares adjust for flights or land-only options."
                >
                  <div className="grid gap-2.5">
                    {cities.map((option) => (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setCity(option.name)}
                        className={cn(
                          "flex items-center gap-4 rounded-[14px] border-[1.5px] px-4 py-3 text-left transition",
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
                          <span className="block text-sm font-semibold text-ink">
                            {option.name}
                          </span>
                          <span className="block text-[13px] font-medium leading-5 text-navy-500">
                            {option.note}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            option.priceDelta < 0 ? "text-success" : "text-ink",
                          )}
                        >
                          {option.priceDelta === 0
                            ? "Included"
                            : `${option.priceDelta > 0 ? "+" : "–"} ${formatINR(Math.abs(option.priceDelta))}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  title="3. Who's travelling?"
                  subtitle={`Adults are 12+. Children are 5–11 at ${formatINR(childPrice)}. ${
                    infantPrice > 0
                      ? `Infants under 5 are ${formatINR(infantPrice)}.`
                      : "Infants under 5 travel free."
                  }`}
                >
                  <div className="grid gap-3">
                    <Counter
                      label="Adults"
                      sub={`12+ yrs · ${formatINR(adultPrice)}`}
                      value={adults}
                      min={1}
                      onChange={setAdults}
                    />
                    <Counter
                      label="Children"
                      sub={`5–11 yrs · ${formatINR(childPrice)}`}
                      value={children}
                      min={0}
                      onChange={setChildren}
                    />
                    <Counter
                      label="Infants"
                      sub={`Under 5 · ${infantPrice > 0 ? formatINR(infantPrice) : "free"}`}
                      value={infants}
                      min={0}
                      onChange={setInfants}
                    />
                  </div>
                  <p className="mt-4 rounded-[14px] bg-blue-50 px-4 py-3 text-[13px] font-medium text-blue-700">
                    ⓘ Travelling as 6 or more? You&apos;ll get a group discount of
                    5% at payment.
                  </p>
                </SectionCard>

                <StepActions
                  backHref={`/tours/${tour.slug}`}
                  backLabel="Back to tour"
                  next={() => setStep(1)}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <SectionCard
                  title="Lead traveller"
                  subtitle={`Signed in as ${account.email}. Tickets, invoices and trip updates go to this person.`}
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
                              "flex items-center gap-3 rounded-[14px] border-[1.5px] px-4 py-3.5 text-left text-sm font-semibold",
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

                {leadError ? (
                  <p className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
                    {leadError}
                  </p>
                ) : null}

                <StepActions
                  back={() => setStep(0)}
                  backLabel="Back to trip details"
                  next={() => {
                    if (
                      !lead.name.trim() ||
                      !lead.email.trim() ||
                      !lead.phone.trim()
                    ) {
                      setLeadError(
                        "Add your name, email and phone so we can confirm your seats.",
                      );
                      return;
                    }
                    setLeadError("");
                    setStep(2);
                  }}
                  nextLabel="Continue to add-ons"
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                {tourAddons.length ? (
                <SectionCard title="Recommended for this tour">
                  <div className="grid gap-3">
                    {tourAddons.map((addon) => {
                      const active = addons.includes(addon.id);
                      const quantity = addonQuantity(addon, adults, children);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          role="switch"
                          aria-checked={active}
                          onClick={() => toggleAddon(addon.id)}
                          className={cn(
                            "flex items-center gap-4 rounded-[20px] border p-4 text-left transition sm:gap-5 sm:p-5",
                            active
                              ? "border-ink bg-paper"
                              : "border-sand-300 bg-paper",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-11 w-11 shrink-0 place-items-center rounded-[14px]",
                              active
                                ? "bg-gold-100 text-gold-600"
                                : "bg-sand-200 text-ink",
                            )}
                          >
                            <AddonIconView icon={addon.icon} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-ink">
                              {addon.title}
                            </span>
                            {addon.description ? (
                              <span className="mt-1 block text-[13px] font-medium text-navy-500">
                                {addon.description}
                              </span>
                            ) : null}
                          </span>
                          <span className="text-right">
                            <span className="block text-sm font-semibold text-ink">
                              {addon.price ? formatINR(addon.price) : "Free"}
                            </span>
                            <span className="block text-xs font-medium text-navy-500">
                              {addon.unit === "booking" ? "per booking" : `per person${quantity > 1 ? ` × ${quantity}` : ""}`}
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
                ) : (
                  <SectionCard title="No extras needed">
                    <p className="type-small text-navy-700">
                      Everything for this tour is already included. Add a promo code below if you have one.
                    </p>
                  </SectionCard>
                )}

                <SectionCard title="Have a promo code?">
                  {promoRule ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-success-soft px-4 py-3">
                      <p className="text-sm font-semibold text-success">
                        {promoBelowMinimum
                          ? `${promoRule.code} needs at least ${promoRule.minTravellers} travellers.`
                          : promoBeaten
                            ? `${promoRule.code} applied, but ${appliedDiscount?.rule.name} saves you more.`
                            : `✓ ${promoRule.code} applied. You save ${formatINR(appliedDiscount?.amount ?? 0)}.`}
                      </p>
                      <button type="button" onClick={removePromo} className="text-sm font-semibold text-navy-700 underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form
                      className="flex flex-wrap items-end gap-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        applyPromo();
                      }}
                    >
                      <div className="min-w-[200px] flex-1">
                        <label htmlFor="promo-code" className="field-label">
                          Code
                        </label>
                        <input
                          id="promo-code"
                          value={promo}
                          onChange={(event) => {
                            setPromo(event.target.value.toUpperCase());
                            if (promoStatus === "error") setPromoStatus("idle");
                          }}
                          placeholder="EARLYBIRD"
                          aria-invalid={promoStatus === "error"}
                          aria-describedby={promoStatus === "error" ? "promo-error" : undefined}
                          className="field"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!promo.trim() || promoStatus === "checking"}
                        className="btn btn-outline disabled:opacity-50"
                      >
                        {promoStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Apply
                      </button>
                    </form>
                  )}
                  {promoStatus === "error" ? (
                    <p id="promo-error" className="mt-4 rounded-[12px] bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
                      {promoError}
                    </p>
                  ) : null}
                  {appliedDiscount && !appliedDiscount.rule.code ? (
                    <p className="mt-4 text-sm font-semibold text-success">
                      ✓ {appliedDiscount.rule.name} is applied automatically.
                    </p>
                  ) : null}
                </SectionCard>

                <StepActions
                  back={() => setStep(1)}
                  backLabel="Back to lead traveller"
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
                          "flex items-center gap-4 rounded-[14px] border-[1.5px] p-4 text-left transition",
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
                          <span className="block text-sm font-semibold text-ink">
                            {option.title}
                          </span>
                          <span className="block text-[13px] font-medium text-navy-500">
                            {option.description}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-ink">
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
                          "rounded-[14px] border-[1.5px] px-5 py-3 text-sm font-semibold transition",
                          method === item
                            ? "border-ink bg-ink text-paper"
                            : "border-sand-300 bg-paper text-ink",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col items-center gap-5 rounded-[20px] bg-sand-100 p-5 sm:flex-row">
                    <div className="grid h-[148px] w-[148px] shrink-0 grid-cols-7 gap-0.5 rounded-[14px] border border-sand-300 bg-paper p-4">
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
                  <p className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
                    {errorMessage ||
                      `We could not complete that payment. Please try again or call ${site.phone}.`}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-semibold text-navy-700"
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

                <div className="flex flex-wrap items-center justify-center gap-5 pb-4 text-[13px] font-semibold text-navy-500">
                  <span>🔒 256-bit SSL</span>
                  <span>PCI-DSS compliant</span>
                  <span>Razorpay secured</span>
                  <span>IATA accredited</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[20px] border border-sand-300 bg-paper p-6 shadow-[0_16px_40px_-32px_rgba(11,39,53,0.3)]">
            <div className="flex items-center gap-4">
              <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[14px] bg-ink">
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
                ["Travellers", travellerSummary],
              ].map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <dt className="text-[13px] font-medium text-navy-500">{key}</dt>
                  <dd className="text-[13px] font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="route-line my-5" />

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-4 text-[13px]">
                <span className="text-navy-700">
                  Adults · {formatINR(adultPrice)} × {adults}
                </span>
                <span className="font-semibold text-ink">{formatINR(adultPrice * adults)}</span>
              </div>
              {children ? (
                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-navy-700">
                    Children · {formatINR(childPrice)} × {children}
                  </span>
                  <span className="font-semibold text-ink">{formatINR(childPrice * children)}</span>
                </div>
              ) : null}
              {infants ? (
                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-navy-700">
                    Infants · {infantPrice > 0 ? formatINR(infantPrice) : "free"} × {infants}
                  </span>
                  <span className="font-semibold text-ink">
                    {infantPrice > 0 ? formatINR(infantPrice * infants) : "Free"}
                  </span>
                </div>
              ) : null}
              {quote.addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-navy-700">
                    {addon.title}{addon.quantity > 1 ? ` × ${addon.quantity}` : ""}
                  </span>
                  <span className="font-semibold text-ink">{addon.total ? formatINR(addon.total) : "Free"}</span>
                </div>
              ))}
              {appliedDiscount ? (
                <div className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-success">
                    {appliedDiscount.rule.code ?? appliedDiscount.rule.name}
                  </span>
                  <span className="font-semibold text-success">
                    – {formatINR(appliedDiscount.amount)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 text-[13px]">
                <span className="text-navy-700">GST (5%)</span>
                <span className="font-semibold text-ink">{formatINR(gst)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-sand-300 pt-5">
              <div>
                <p className="type-title text-ink">Total</p>
                <p className="text-xs font-medium text-navy-500">
                  {travellers} travellers · incl. taxes
                </p>
              </div>
              <p className="text-xl font-semibold tracking-[-0.02em] text-ink">
                {formatINR(total)}
              </p>
            </div>

            {step === 3 ? (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-[14px] bg-gold-100 px-4 py-3">
                <span className="text-sm font-semibold text-ink">Due today (25%)</span>
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

function CheckoutHeader({ step, email }: { step: number; email: string }) {
  return (
    <div className="sticky top-0 z-40 border-b border-sand-300 bg-paper/90 backdrop-blur-xl">
      <div className="container-page flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
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
                    "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold",
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
                    "text-[13px] font-semibold sm:block",
                    !current && "hidden",
                    done || current ? "text-ink" : "text-navy-500",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-navy-600 transition hover:text-ink"
          >
            <UserRound className="h-3.5 w-3.5" />
            <span className="max-w-[210px] truncate">{email}</span>
          </Link>
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
            <Lock className="h-3.5 w-3.5" /> Secure checkout
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
    <section className="rounded-[20px] border border-sand-300 bg-paper p-6 md:p-8">
      <h2 className="type-h4 text-ink">{title}</h2>
      {subtitle ? (
        <p className="type-small mt-1.5 text-navy-500">{subtitle}</p>
      ) : null}
      <div className="mt-4">{children}</div>
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
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-sand-300 bg-paper px-4 py-3 sm:px-4 sm:py-3">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-[13px] font-medium leading-5 text-navy-500">{sub}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-sand-300 text-ink"
          aria-label={`Remove one ${label.toLowerCase()}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-ink">{value}</span>
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
        <Link href={backHref} className="inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-navy-700">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={back}
          className="inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-navy-700"
        >
          <ArrowLeft className="h-4 w-4" />
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
