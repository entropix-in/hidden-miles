import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IndianRupee,
  MapPin,
  Moon,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  AdminNotice,
  AdminPageHeader,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import {
  loadAdminBookings,
  loadAdminDepartures,
  loadAdminTours,
} from "@/lib/content";
import { cn, formatINR, imageUrl } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  timeZone: "UTC",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  timeZone: "UTC",
});

function formatDate(value?: string) {
  if (!value) return "Date not set";
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatCreatedAt(timestamp: number) {
  return dateFormatter.format(new Date(timestamp));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const bookingStatusStyles: Record<BookingStatus, string> = {
  pending: "bg-gold-100 text-gold-800 ring-gold-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const statTones = {
  blue: "bg-blue-50 text-blue-700",
  gold: "bg-gold-100 text-gold-700",
  navy: "bg-navy-50 text-navy-700",
  emerald: "bg-emerald-50 text-emerald-700",
} as const;

function DetailStat({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  icon: LucideIcon;
  tone: keyof typeof statTones;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-navy-950/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-stone-500">
          {label}
        </p>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            statTones[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-[30px] font-semibold leading-none tracking-tight text-navy-950">
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold leading-4 text-stone-500">
        {detail}
      </p>
    </div>
  );
}

export default async function AdminDepartureDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const notice = typeof query.notice === "string" ? query.notice : "";
  const error = typeof query.error === "string" ? query.error : "";

  const [toursResult, departuresResult, bookingsResult] = await Promise.all([
    loadAdminTours(),
    loadAdminDepartures(),
    loadAdminBookings(),
  ]);

  const departure = departuresResult.data.find((item) => item._id === id);

  if (!toursResult.status.configured) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Departure details"
          title="Departure overview"
          description="See the package, travel date and seats booked for a departure."
        />
        <DatabaseSetupNotice
          configured={toursResult.status.configured}
          error={toursResult.status.error}
        />
      </div>
    );
  }

  if (!departure) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Departure details"
          title="Departure not found"
          description="This departure may have been deleted. Pick another date from the bookings page."
        />
        <Link href="/admin/bookings" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Link>
      </div>
    );
  }

  const tour = toursResult.data.find((item) => item.slug === departure.tourSlug);
  const tourDepartures = departuresResult.data.filter(
    (item) => item.tourSlug === departure.tourSlug,
  );
  const departureBookings = bookingsResult.data.filter(
    (booking) => booking.departureId === departure._id,
  );
  const confirmedBookings = departureBookings.filter(
    (booking) => booking.status === "confirmed",
  );
  const pendingBookings = departureBookings.filter(
    (booking) => booking.status === "pending",
  );
  const confirmedRevenue = confirmedBookings.reduce(
    (total, booking) => total + booking.amount,
    0,
  );
  const pendingValue = pendingBookings.reduce(
    (total, booking) => total + booking.amount,
    0,
  );

  const today = new Date().toISOString().slice(0, 10);
  const isPast = departure.startDate < today;
  const occupancy = departure.capacity
    ? Math.min(100, Math.round((departure.booked / departure.capacity) * 100))
    : 0;

  const totalSeats = tourDepartures.reduce(
    (total, item) => total + item.capacity,
    0,
  );
  const totalBooked = tourDepartures.reduce(
    (total, item) => total + item.booked,
    0,
  );

  const departureDate = new Date(`${departure.startDate}T00:00:00Z`);

  const status = isPast
    ? { label: "Past departure", className: "bg-stone-100 text-stone-600 ring-stone-200" }
    : departure.seatsLeft === 0
      ? { label: "Sold out", className: "bg-red-50 text-red-700 ring-red-200" }
      : departure.seatsLeft <= 5
        ? { label: "Limited seats", className: "bg-gold-100 text-gold-800 ring-gold-200" }
        : {
            label: "Open for booking",
            className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
          };

  const selectedHighlights =
    tour?.highlights.slice(0, 3).map((highlight) => highlight) ?? [];

  return (
    <div className="space-y-6">
      <AdminNotice notice={notice} error={error} />

      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-stone-400"
      >
        <Link href="/admin/bookings" className="transition hover:text-blue-700">
          Bookings
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/admin/bookings?tour=${encodeURIComponent(departure.tourSlug)}`}
          className="transition hover:text-blue-700"
        >
          {tour?.title ?? departure.tourSlug}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-stone-600">{formatDate(departure.startDate)}</span>
      </nav>

      <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Departure details</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy-950 sm:text-4xl">
            {tour?.title ?? departure.tourSlug}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-semibold text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              {formatDate(departure.startDate)}
            </span>
            {tour ? (
              <>
                <span className="text-stone-300" aria-hidden>
                  |
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {tour.destinationName}
                </span>
                <span className="text-stone-300" aria-hidden>
                  |
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Moon className="h-4 w-4 text-blue-600" />
                  {tour.nights}N / {tour.days}D
                </span>
              </>
            ) : null}
            <span className="text-stone-300" aria-hidden>
              |
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 text-blue-600" />
              {formatINR(departure.price)} per person
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tour ? (
            <Link
              href={`/tours/${tour.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline px-5 py-2.5 text-sm"
            >
              View package
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
          <Link
            href={`/admin/bookings?tour=${encodeURIComponent(departure.tourSlug)}`}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            <Ticket className="h-4 w-4" />
            Manage departure
          </Link>
        </div>
      </header>

      {departuresResult.status.error ? (
        <AdminNotice error={departuresResult.status.error} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailStat
          label="Seats booked"
          value={
            <>
              {departure.booked}
              <span className="ml-1 text-lg font-medium text-stone-400">
                / {departure.capacity}
              </span>
            </>
          }
          detail={`${occupancy}% of this departure is filled`}
          icon={Users}
          tone="blue"
        />
        <DetailStat
          label="Seats left"
          value={departure.seatsLeft}
          detail={
            departure.seatsLeft === 0
              ? "This departure is sold out"
              : "Available to book on the website"
          }
          icon={Ticket}
          tone="navy"
        />
        <DetailStat
          label="Confirmed revenue"
          value={formatINR(confirmedRevenue)}
          detail={`${confirmedBookings.length} confirmed ${
            confirmedBookings.length === 1 ? "booking" : "bookings"
          }`}
          icon={IndianRupee}
          tone="emerald"
        />
        <DetailStat
          label="Pending payments"
          value={formatINR(pendingValue)}
          detail={`${pendingBookings.length} ${
            pendingBookings.length === 1 ? "request" : "requests"
          } awaiting confirmation`}
          icon={Clock3}
          tone="gold"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          {tour ? (
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-navy-950/[0.03]">
              <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="relative h-44 lg:h-full lg:min-h-[220px]">
                  <Image
                    src={imageUrl(tour.image, 800)}
                    alt={tour.title}
                    fill
                    sizes="(min-width: 1024px) 240px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-stone-600">
                      {tour.region}
                    </span>
                    <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-navy-800">
                      {tour.nights}N / {tour.days}D
                    </span>
                    <span className="rounded-full bg-gold-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-gold-800">
                      {tour.rating.toFixed(1)} rating
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-navy-950">
                    {tour.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-stone-500">
                    {tour.destinationName} · from {formatINR(tour.price)} per
                    person
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                    {tour.summary}
                  </p>
                  {selectedHighlights.length ? (
                    <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      {selectedHighlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-start gap-1.5 text-xs font-semibold text-stone-600"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span className="line-clamp-2">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-stone-100 pt-4">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-400">
                        Departure dates
                      </p>
                      <p className="mt-1 font-display text-lg font-semibold text-navy-950">
                        {tourDepartures.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-400">
                        Total seats
                      </p>
                      <p className="mt-1 font-display text-lg font-semibold text-navy-950">
                        {totalSeats}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-400">
                        Seats sold
                      </p>
                      <p className="mt-1 font-display text-lg font-semibold text-navy-950">
                        {totalBooked}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 bg-sand-50/60 px-5 py-3 sm:px-6">
                <p className="text-xs font-semibold text-stone-500">
                  Showing one of {tourDepartures.length} departure{" "}
                  {tourDepartures.length === 1 ? "date" : "dates"} for this
                  package
                </p>
                <Link
                  href={`/tours/${tour.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
                >
                  Open on website
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-navy-950">
                Package details unavailable
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                This departure points to a package that no longer exists. You can
                still manage the date from the bookings page.
              </p>
            </section>
          )}

          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-navy-950/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-navy-950">
                  Travellers on this departure
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-stone-500">
                  {departure.booked} {departure.booked === 1 ? "seat" : "seats"}{" "}
                  booked · {departureBookings.length} booking{" "}
                  {departureBookings.length === 1 ? "request" : "requests"}
                </p>
              </div>
              <Link
                href={`/admin/bookings?tour=${encodeURIComponent(departure.tourSlug)}`}
                className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
              >
                Manage bookings
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {departureBookings.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-sand-50/60 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-500">
                      <th className="px-6 py-2.5 font-extrabold">Traveller</th>
                      <th className="px-3 py-2.5 font-extrabold">Contact</th>
                      <th className="px-3 py-2.5 font-extrabold">Travellers</th>
                      <th className="px-3 py-2.5 text-right font-extrabold">
                        Amount
                      </th>
                      <th className="px-3 py-2.5 text-right font-extrabold">
                        Status
                      </th>
                      <th className="px-6 py-2.5 text-right font-extrabold">
                        Requested
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {departureBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="transition hover:bg-sand-50/70"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-50 text-[11px] font-extrabold text-navy-700">
                              {initials(booking.name) || "?"}
                            </span>
                            <p className="font-bold text-navy-950">
                              {booking.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="max-w-[180px] truncate text-xs font-semibold text-stone-600">
                            {booking.email}
                          </p>
                          <p className="text-xs text-stone-500">
                            {booking.phone}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-stone-700">
                          {booking.travellers}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-bold text-navy-950">
                          {booking.amount ? formatINR(booking.amount) : "On request"}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-inset",
                              bookingStatusStyles[booking.status],
                            )}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold text-stone-500">
                          {formatCreatedAt(booking.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <Users className="mx-auto h-6 w-6 text-stone-300" />
                <p className="mt-2 text-sm font-bold text-navy-950">
                  No travellers linked yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-stone-500">
                  Direct bookings made on the website for this date will appear
                  here with their contact and payment status.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-navy-950/[0.03]">
            <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-navy-950">
                Departure details
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-stone-500">
                {weekdayFormatter.format(departureDate)},{" "}
                {formatDate(departure.startDate)}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-5">
                <span className="grid h-16 w-16 shrink-0 place-content-center rounded-2xl border border-stone-200 bg-sand-50 text-center leading-none">
                  <span className="font-display text-2xl font-semibold text-navy-950">
                    {departureDate.getUTCDate()}
                  </span>
                  <span className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-500">
                    {monthFormatter.format(departureDate)}
                  </span>
                </span>
                <div className="min-w-0">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-inset",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                  <p className="mt-2 text-sm font-bold text-navy-950">
                    {departure.note || "Standard departure"}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-stone-500">
                    {formatINR(departure.price)} per person
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-2.5 border-t border-stone-100 pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-semibold text-stone-500">Seats booked</dt>
                  <dd className="font-bold text-navy-950">
                    {departure.booked} of {departure.capacity}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-semibold text-stone-500">Seats left</dt>
                  <dd className="font-bold text-navy-950">
                    {departure.seatsLeft}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-semibold text-stone-500">Occupancy</dt>
                  <dd className="font-bold text-navy-950">{occupancy}%</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-semibold text-stone-500">Price per seat</dt>
                  <dd className="font-bold text-navy-950">
                    {formatINR(departure.price)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <span
                    className={cn(
                      "block h-full rounded-full",
                      departure.seatsLeft === 0
                        ? "bg-stone-400"
                        : occupancy >= 80
                          ? "bg-gold-400"
                          : "bg-blue-500",
                    )}
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-stone-500">
                  {departure.booked} booked · {departure.seatsLeft} left
                </p>
              </div>

              <Link
                href={`/admin/bookings?tour=${encodeURIComponent(departure.tourSlug)}`}
                className="btn-outline mt-5 w-full px-4 py-2.5 text-sm"
              >
                Edit this departure
              </Link>
            </div>
          </section>

        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-navy-950/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy-950">
              Departure calendar
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-stone-500">
              Every date for this package, with seats sold and occupancy
            </p>
          </div>
          <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-stone-600">
            {tourDepartures.length} dates · {totalBooked} of {totalSeats} seats
            sold
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-sand-50/60 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-6 py-2.5 font-extrabold">Date</th>
                <th className="px-3 py-2.5 font-extrabold">Price</th>
                <th className="px-3 py-2.5 text-right font-extrabold">
                  Capacity
                </th>
                <th className="px-3 py-2.5 text-right font-extrabold">Booked</th>
                <th className="px-3 py-2.5 text-right font-extrabold">
                  Seats left
                </th>
                <th className="px-3 py-2.5 font-extrabold">Occupancy</th>
                <th className="px-3 py-2.5 font-extrabold">Status</th>
                <th className="px-6 py-2.5 text-right font-extrabold">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tourDepartures.map((item) => {
                const itemDate = new Date(`${item.startDate}T00:00:00Z`);
                const itemFill = item.capacity
                  ? Math.min(
                      100,
                      Math.round((item.booked / item.capacity) * 100),
                    )
                  : 0;
                const current = item._id === departure._id;
                const past = item.startDate < today;

                return (
                  <tr
                    key={item._id}
                    className={cn(
                      "transition",
                      current ? "bg-blue-50/60" : "hover:bg-sand-50/70",
                    )}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid h-10 w-10 shrink-0 place-content-center rounded-xl border text-center leading-none",
                            current
                              ? "border-blue-200 bg-white"
                              : "border-stone-200 bg-sand-50",
                          )}
                        >
                          <span className="font-display text-sm font-semibold text-navy-950">
                            {itemDate.getUTCDate()}
                          </span>
                          <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-stone-500">
                            {monthFormatter.format(itemDate)}
                          </span>
                        </span>
                        <div className="min-w-0">
                          <p className="whitespace-nowrap font-bold text-navy-950">
                            {formatDate(item.startDate)}
                          </p>
                          <p className="text-xs font-semibold text-stone-500">
                            {weekdayFormatter.format(itemDate)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-stone-700">
                      {formatINR(item.price)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-stone-600">
                      {item.capacity}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-navy-950">
                      {item.booked}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-stone-600">
                      {item.seatsLeft}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-stone-100">
                          <span
                            className={cn(
                              "block h-full rounded-full",
                              item.seatsLeft === 0
                                ? "bg-stone-400"
                                : itemFill >= 80
                                  ? "bg-gold-400"
                                  : "bg-blue-500",
                            )}
                            style={{ width: `${itemFill}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-600">
                          {itemFill}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {current ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-blue-800">
                          Viewing
                        </span>
                      ) : past ? (
                        <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-stone-600">
                          Past
                        </span>
                      ) : item.seatsLeft === 0 ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-red-700 ring-1 ring-inset ring-red-200">
                          Sold out
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          Open
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {current ? (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                          Current
                        </span>
                      ) : (
                        <Link
                          href={`/admin/bookings/departures/${item._id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
                        >
                          View
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
