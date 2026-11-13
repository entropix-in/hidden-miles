import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Inbox,
  IndianRupee,
  Mail,
  MapPin,
  MessageSquareQuote,
  Package,
  Plus,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  AdminNotice,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import { seedContentAction } from "@/app/admin/actions";
import {
  loadAdminBookings,
  loadAdminDepartures,
  loadAdminDestinations,
  loadAdminEnquiries,
  loadAdminExperiences,
  loadAdminTestimonials,
  loadAdminTours,
} from "@/lib/content";
import { cn, formatINR } from "@/lib/utils";
import type { BookingStatus, EnquiryStatus } from "@/lib/types";

const todayLabel = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date());

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const chartLabelFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  timeZone: "UTC",
});

function formatDate(value?: string) {
  if (!value) return "Date not set";
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function timeAgo(timestamp: number) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

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

const enquiryStatusStyles: Record<EnquiryStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  contacted: "bg-gold-100 text-gold-800 ring-gold-200",
  closed: "bg-stone-100 text-stone-600 ring-stone-200",
};

function StatusPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-inset",
        className,
      )}
    >
      {label}
    </span>
  );
}

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-stone-200 bg-white shadow-sm shadow-navy-950/[0.03]",
        className,
      )}
    >
      {children}
    </section>
  );
}

const statTones = {
  blue: {
    bar: "bg-blue-500",
    icon: "bg-blue-50 text-blue-700",
  },
  gold: {
    bar: "bg-gold-400",
    icon: "bg-gold-100 text-gold-700",
  },
  navy: {
    bar: "bg-navy-700",
    icon: "bg-navy-50 text-navy-700",
  },
  emerald: {
    bar: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-700",
  },
} as const;

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: ReactNode;
  detail: ReactNode;
  icon: LucideIcon;
  tone: keyof typeof statTones;
  href: string;
}) {
  const styles = statTones[tone];

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-navy-950/[0.03] transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lg hover:shadow-navy-950/5"
    >
      <span
        aria-hidden
        className={cn("absolute inset-x-0 top-0 h-1", styles.bar)}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-stone-500">
          {label}
        </p>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            styles.icon,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 font-display text-[32px] font-semibold leading-none tracking-tight text-navy-950">
        {value}
      </p>
      <p className="mt-2.5 text-xs font-semibold leading-4 text-stone-500">
        {detail}
      </p>
    </Link>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";

  const [
    tours,
    destinations,
    experiences,
    testimonials,
    enquiries,
    departures,
    bookings,
  ] = await Promise.all([
    loadAdminTours(),
    loadAdminDestinations(),
    loadAdminExperiences(),
    loadAdminTestimonials(),
    loadAdminEnquiries(),
    loadAdminDepartures(),
    loadAdminBookings(),
  ]);

  const status = tours.status;

  const confirmedBookings = bookings.data.filter(
    (booking) => booking.status === "confirmed",
  );
  const pendingBookings = bookings.data.filter(
    (booking) => booking.status === "pending",
  );
  const confirmedRevenue = confirmedBookings.reduce(
    (total, booking) => total + (booking.amount ?? 0),
    0,
  );
  const pendingValue = pendingBookings.reduce(
    (total, booking) => total + (booking.amount ?? 0),
    0,
  );
  const averageBooking =
    confirmedBookings.length > 0
      ? Math.round(confirmedRevenue / confirmedBookings.length)
      : 0;

  const newEnquiries = enquiries.data.filter(
    (enquiry) => (enquiry.status ?? "new") === "new",
  ).length;
  const contactedEnquiries = enquiries.data.filter(
    (enquiry) => enquiry.status === "contacted",
  ).length;

  const today = new Date().toISOString().slice(0, 10);
  const allUpcomingDepartures = departures.data.filter(
    (departure) => departure.startDate >= today,
  );
  const upcomingDepartures = allUpcomingDepartures.slice(0, 5);
  const upcomingCapacity = allUpcomingDepartures.reduce(
    (total, departure) => total + departure.capacity,
    0,
  );
  const upcomingBooked = allUpcomingDepartures.reduce(
    (total, departure) => total + departure.booked,
    0,
  );
  const occupancy =
    upcomingCapacity > 0
      ? Math.round((upcomingBooked / upcomingCapacity) * 100)
      : 0;
  const nextDeparture = upcomingDepartures[0];

  const revenueByTour = new Map<string, number>();
  for (const booking of confirmedBookings) {
    const key = booking.tourTitle || booking.tourSlug;
    revenueByTour.set(key, (revenueByTour.get(key) ?? 0) + (booking.amount ?? 0));
  }
  const topTour = [...revenueByTour.entries()].sort((a, b) => b[1] - a[1])[0];

  const toursWithoutDepartures = tours.data.filter(
    (tour) => !departures.data.some((d) => d.tourSlug === tour.slug),
  );

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = new Date().getTime();
  const bookingsThisWeek = bookings.data.filter(
    (booking) => now - booking.createdAt < weekMs,
  ).length;
  const bookingsLastWeek = bookings.data.filter(
    (booking) =>
      now - booking.createdAt >= weekMs &&
      now - booking.createdAt < weekMs * 2,
  ).length;
  const weekChange =
    bookingsLastWeek > 0
      ? Math.round(
          ((bookingsThisWeek - bookingsLastWeek) / bookingsLastWeek) * 100,
        )
      : null;

  const activity = Array.from({ length: 14 }, (_, index) => {
    const timestamp = now - (13 - index) * 24 * 60 * 60 * 1000;
    const key = new Date(timestamp).toISOString().slice(0, 10);
    const date = new Date(`${key}T00:00:00Z`);

    return {
      key,
      label: chartLabelFormatter.format(date),
      day: date.getUTCDate(),
      bookings: bookings.data.filter(
        (booking) => new Date(booking.createdAt).toISOString().slice(0, 10) === key,
      ).length,
      enquiries: enquiries.data.filter(
        (enquiry) => new Date(enquiry.createdAt).toISOString().slice(0, 10) === key,
      ).length,
    };
  });
  const maxActivity = Math.max(
    1,
    ...activity.map((day) => Math.max(day.bookings, day.enquiries)),
  );
  const activityTotals = activity.reduce(
    (totals, day) => ({
      bookings: totals.bookings + day.bookings,
      enquiries: totals.enquiries + day.enquiries,
    }),
    { bookings: 0, enquiries: 0 },
  );

  const attentionItems = [
    {
      count: pendingBookings.length,
      label:
        pendingBookings.length === 1
          ? "Booking awaiting confirmation"
          : "Bookings awaiting confirmation",
      description: pendingValue
        ? `${formatINR(pendingValue)} in the pipeline`
        : "Confirm or release these seats",
      href: "/admin/bookings",
      icon: Clock3,
      tone: "bg-gold-100 text-gold-700",
    },
    {
      count: newEnquiries,
      label: newEnquiries === 1 ? "New enquiry to reply to" : "New enquiries to reply to",
      description: `${enquiries.data.length} enquiries in total`,
      href: "/admin/enquiries",
      icon: Mail,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      count: toursWithoutDepartures.length,
      label:
        toursWithoutDepartures.length === 1
          ? "Package without dates"
          : "Packages without dates",
      description: "Travellers cannot book them yet",
      href: "/admin/bookings",
      icon: CalendarDays,
      tone: "bg-navy-50 text-navy-700",
    },
  ].filter((item) => item.count > 0);

  const attentionCount = attentionItems.reduce(
    (total, item) => total + item.count,
    0,
  );

  const catalog = [
    {
      label: "Packages",
      value: tours.data.length,
      href: "/admin/tours",
      icon: Package,
    },
    {
      label: "Departures",
      value: departures.data.length,
      href: "/admin/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Bookings",
      value: bookings.data.length,
      href: "/admin/bookings",
      icon: Ticket,
    },
    {
      label: "Destinations",
      value: destinations.data.length,
      href: "/admin/destinations",
      icon: MapPin,
    },
    {
      label: "Experiences",
      value: experiences.data.length,
      href: "/admin/experiences",
      icon: Sparkles,
    },
    {
      label: "Testimonials",
      value: testimonials.data.length,
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminNotice notice={notice} error={error} />

      <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">
            <CalendarDays className="h-3.5 w-3.5" />
            {todayLabel}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy-950 sm:text-4xl">
            Dashboard overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Bookings, revenue and traveller enquiries across Hidden Miles, all in
            one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="btn-outline px-5 py-2.5 text-sm"
            target="_blank"
            rel="noreferrer"
          >
            View website
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/admin/tours/new" className="btn-primary px-5 py-2.5 text-sm">
            <Plus className="h-4 w-4" />
            New package
          </Link>
        </div>
      </header>

      {!status.configured ? (
        <DatabaseSetupNotice configured={status.configured} error={status.error} />
      ) : (
        <>
          {status.error ? <AdminNotice error={status.error} /> : null}

          {!status.seeded ? (
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
                  <Database className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-navy-950">
                    Import your starter content
                  </h2>
                  <p className="mt-0.5 max-w-xl text-sm leading-5 text-stone-600">
                    Bring the existing packages, destinations, experiences and
                    testimonials into the site. You can edit or delete anything
                    afterwards.
                  </p>
                </div>
              </div>
              <form action={seedContentAction} className="shrink-0">
                <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
                  Import content
                </button>
              </form>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Confirmed revenue"
              value={formatINR(confirmedRevenue)}
              detail={`${confirmedBookings.length} confirmed ${
                confirmedBookings.length === 1 ? "booking" : "bookings"
              } · ${formatINR(averageBooking)} average`}
              icon={IndianRupee}
              tone="blue"
              href="/admin/bookings"
            />
            <StatCard
              label="Pending requests"
              value={pendingBookings.length}
              detail={
                pendingValue
                  ? `${formatINR(pendingValue)} awaiting confirmation`
                  : "No pending booking value"
              }
              icon={Clock3}
              tone="gold"
              href="/admin/bookings"
            />
            <StatCard
              label="New enquiries"
              value={newEnquiries}
              detail={`${contactedEnquiries} in progress · ${enquiries.data.length} total`}
              icon={Inbox}
              tone="navy"
              href="/admin/enquiries"
            />
            <StatCard
              label="Seats sold ahead"
              value={
                <>
                  {upcomingBooked}
                  <span className="ml-1 text-lg font-medium text-stone-400">
                    / {upcomingCapacity}
                  </span>
                </>
              }
              detail={`${occupancy}% occupancy · ${upcomingDepartures.length} upcoming ${
                upcomingDepartures.length === 1 ? "departure" : "departures"
              }`}
              icon={Users}
              tone="emerald"
              href="/admin/bookings"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-5">
              <Panel className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-stone-500">
                      Activity
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-navy-950">
                      Last 14 days
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      Bookings
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-gold-400" />
                      Enquiries
                    </span>
                  </div>
                </div>

                <div className="relative mt-6">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 flex h-36 flex-col justify-between"
                  >
                    {[0, 1, 2, 3].map((line) => (
                      <span
                        key={line}
                        className="border-t border-dashed border-stone-100"
                      />
                    ))}
                  </div>
                  <div className="relative flex h-36 items-end gap-1 sm:gap-1.5">
                    {activity.map((day) => (
                      <div
                        key={day.key}
                        className="group flex h-full flex-1 items-end justify-center gap-[3px]"
                      >
                        <span
                          title={`${day.label}: ${day.bookings} bookings`}
                          className="w-1/2 max-w-3 rounded-t-sm bg-blue-600/85 transition group-hover:bg-blue-600"
                          style={{
                            height: `${(day.bookings / maxActivity) * 100}%`,
                          }}
                        />
                        <span
                          title={`${day.label}: ${day.enquiries} enquiries`}
                          className="w-1/2 max-w-3 rounded-t-sm bg-gold-400/80 transition group-hover:bg-gold-400"
                          style={{
                            height: `${(day.enquiries / maxActivity) * 100}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-1 sm:gap-1.5">
                    {activity.map((day, index) => (
                      <span
                        key={day.key}
                        className={cn(
                          "flex-1 text-center text-[10px] font-semibold text-stone-400",
                          index % 2 === 0 ? "" : "hidden sm:block",
                        )}
                      >
                        {day.day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-stone-500">
                  <span>
                    {activityTotals.bookings}{" "}
                    {activityTotals.bookings === 1 ? "booking" : "bookings"} ·{" "}
                    {activityTotals.enquiries}{" "}
                    {activityTotals.enquiries === 1 ? "enquiry" : "enquiries"} this
                    fortnight
                  </span>
                  {weekChange !== null ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-extrabold",
                        weekChange >= 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700",
                      )}
                    >
                      {weekChange >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {weekChange >= 0 ? "+" : ""}
                      {weekChange}% week on week
                    </span>
                  ) : (
                    <span className="text-stone-400">No comparison yet</span>
                  )}
                </div>

                <div className="mt-5 grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-stone-400">
                      Top package
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-navy-950">
                      {topTour ? topTour[0] : "No sales yet"}
                    </p>
                    <p className="truncate text-xs font-semibold text-stone-500">
                      {topTour ? formatINR(topTour[1]) : "Confirmed revenue"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-stone-400">
                      Average booking
                    </p>
                    <p className="mt-1 text-sm font-bold text-navy-950">
                      {formatINR(averageBooking)}
                    </p>
                    <p className="text-xs font-semibold text-stone-500">
                      Per confirmed booking
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-stone-400">
                      Next departure
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-navy-950">
                      {nextDeparture ? formatDate(nextDeparture.startDate) : "None scheduled"}
                    </p>
                    <p className="text-xs font-semibold text-stone-500">
                      {nextDeparture
                        ? `${nextDeparture.seatsLeft} of ${nextDeparture.capacity} seats left`
                        : "Add dates in bookings"}
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-navy-950">
                      Recent bookings
                    </h2>
                    <p className="mt-0.5 text-xs font-semibold text-stone-500">
                      Newest requests from travellers
                    </p>
                  </div>
                  <Link
                    href="/admin/bookings"
                    className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
                  >
                    All bookings
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {bookings.data.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead>
                        <tr className="border-y border-stone-100 bg-sand-50/60 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-500">
                          <th className="px-6 py-2.5 font-extrabold">Traveller</th>
                          <th className="px-3 py-2.5 font-extrabold">Package</th>
                          <th className="px-3 py-2.5 font-extrabold">Travel date</th>
                          <th className="px-3 py-2.5 text-right font-extrabold">
                            Amount
                          </th>
                          <th className="px-6 py-2.5 text-right font-extrabold">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {bookings.data.slice(0, 6).map((booking) => (
                          <tr
                            key={booking._id}
                            className="transition hover:bg-sand-50/70"
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-50 text-[11px] font-extrabold text-navy-700">
                                  {initials(booking.name) || "?"}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-navy-950">
                                    {booking.name}
                                  </p>
                                  <p className="truncate text-xs text-stone-500">
                                    {booking.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <p className="max-w-[180px] truncate text-sm font-semibold text-stone-700">
                                {booking.tourTitle || booking.tourSlug}
                              </p>
                              <p className="text-xs text-stone-500">
                                {booking.travellers}{" "}
                                {booking.travellers === 1 ? "traveller" : "travellers"}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold text-stone-600">
                              {formatDate(booking.startDate)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-bold text-navy-950">
                              {booking.amount
                                ? formatINR(booking.amount)
                                : "On request"}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <StatusPill
                                label={booking.status}
                                className={bookingStatusStyles[booking.status]}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mx-5 mb-5 mt-5 flex items-center gap-3 rounded-xl border border-dashed border-stone-200 bg-sand-50/60 px-4 py-8 sm:mx-6 sm:mb-6">
                    <Ticket className="h-5 w-5 shrink-0 text-stone-300" />
                    <div>
                      <p className="text-sm font-bold text-navy-950">
                        No bookings yet
                      </p>
                      <p className="text-xs text-stone-500">
                        Requests will appear here as travellers book from the website.
                      </p>
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            <div className="min-w-0 space-y-5">
              <Panel className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-navy-950">
                    Needs attention
                  </h2>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em]",
                      attentionCount
                        ? "bg-gold-100 text-gold-800"
                        : "bg-emerald-50 text-emerald-700",
                    )}
                  >
                    {attentionCount ? `${attentionCount} open` : "Clear"}
                  </span>
                </div>

                {attentionItems.length ? (
                  <div className="mt-4 space-y-2">
                    {attentionItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="group flex items-center gap-3 rounded-xl border border-stone-100 bg-sand-50/50 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/50"
                      >
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                            item.tone,
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-navy-950">
                            {item.label}
                          </p>
                          <p className="truncate text-xs text-stone-500">
                            {item.description}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-stone-700 ring-1 ring-inset ring-stone-200">
                          {item.count}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-blue-600" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50/70 px-4 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        You are all caught up
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-800/80">
                        Every enquiry and booking has been handled.
                      </p>
                    </div>
                  </div>
                )}
              </Panel>

              <Panel className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <h2 className="font-display text-xl font-semibold text-navy-950">
                    Upcoming departures
                  </h2>
                  <Link
                    href="/admin/bookings"
                    className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
                  >
                    Manage
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {upcomingDepartures.length ? (
                  <div className="divide-y divide-stone-100 border-t border-stone-100">
                    {upcomingDepartures.slice(0, 4).map((departure) => {
                      const date = new Date(`${departure.startDate}T00:00:00Z`);
                      const fill = departure.capacity
                        ? Math.min(
                            100,
                            Math.round(
                              (departure.booked / departure.capacity) * 100,
                            ),
                          )
                        : 0;
                      const tour = tours.data.find(
                        (item) => item.slug === departure.tourSlug,
                      );

                      return (
                        <Link
                          key={departure._id}
                          href={`/admin/bookings?tour=${encodeURIComponent(
                            departure.tourSlug,
                          )}`}
                          className="flex items-center gap-3.5 px-5 py-3 transition hover:bg-sand-50/70 sm:px-6"
                        >
                          <span className="grid h-11 w-11 shrink-0 place-content-center rounded-xl border border-stone-200 bg-sand-50 text-center leading-none">
                            <span className="font-display text-base font-semibold text-navy-950">
                              {date.getUTCDate()}
                            </span>
                            <span className="mt-1 text-[9px] font-extrabold uppercase tracking-wider text-stone-500">
                              {monthFormatter.format(date)}
                            </span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-navy-950">
                              {tour?.title ?? departure.tourSlug}
                            </p>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                              <span
                                className={cn(
                                  "block h-full rounded-full",
                                  departure.seatsLeft === 0
                                    ? "bg-stone-400"
                                    : fill >= 80
                                      ? "bg-gold-400"
                                      : "bg-blue-500",
                                )}
                                style={{ width: `${fill}%` }}
                              />
                            </div>
                            <p className="mt-1 text-[11px] font-semibold text-stone-500">
                              {departure.booked}/{departure.capacity} booked ·{" "}
                              {departure.seatsLeft === 0
                                ? "Sold out"
                                : `${departure.seatsLeft} left`}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border-t border-stone-100 px-5 py-7 text-center sm:px-6">
                    <CalendarDays className="mx-auto h-5 w-5 text-stone-300" />
                    <p className="mt-2 text-sm font-bold text-navy-950">
                      No dates scheduled
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Add departure dates to start taking bookings.
                    </p>
                  </div>
                )}
              </Panel>

              <Panel className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <h2 className="font-display text-xl font-semibold text-navy-950">
                    Latest enquiries
                  </h2>
                  <Link
                    href="/admin/enquiries"
                    className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
                  >
                    Inbox
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {enquiries.data.length ? (
                  <div className="divide-y divide-stone-100 border-t border-stone-100">
                    {enquiries.data.slice(0, 4).map((enquiry) => (
                      <Link
                        key={enquiry._id}
                        href="/admin/enquiries"
                        className="block px-5 py-3 transition hover:bg-sand-50/70 sm:px-6"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-bold text-navy-950">
                            {enquiry.name}
                          </p>
                          <StatusPill
                            label={enquiry.status ?? "new"}
                            className={enquiryStatusStyles[enquiry.status ?? "new"]}
                          />
                        </div>
                        <p className="mt-0.5 truncate text-xs text-stone-500">
                          {enquiry.tour ||
                            enquiry.destination ||
                            enquiry.email ||
                            "General enquiry"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-stone-400">
                          <span className="capitalize">{enquiry.type}</span>
                          <span aria-hidden>·</span>
                          {timeAgo(enquiry.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="border-t border-stone-100 px-5 py-7 text-center sm:px-6">
                    <Inbox className="mx-auto h-5 w-5 text-stone-300" />
                    <p className="mt-2 text-sm font-bold text-navy-950">
                      No enquiries yet
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Traveller messages will appear here.
                    </p>
                  </div>
                )}
              </Panel>
            </div>
          </div>

          <Panel className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-navy-950">
                  Content library
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-stone-500">
                  Everything published across the website
                </p>
              </div>
              <Link
                href="/admin/tours"
                className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
              >
                Manage packages
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-px bg-stone-100 sm:grid-cols-3 xl:grid-cols-6">
              {catalog.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-3 bg-white px-4 py-4 transition hover:bg-sand-50"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand-100 text-navy-700 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xl font-semibold leading-none text-navy-950">
                      {item.value}
                    </p>
                    <p className="mt-1 truncate text-[10px] font-extrabold uppercase tracking-[0.1em] text-stone-500">
                      {item.label}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
