import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  IndianRupee,
  Ticket,
  Users,
} from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { DepartureCalendar } from "@/components/admin/departure-calendar";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminStatCard,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import {
  deleteBookingAction,
  deleteDepartureAction,
  saveDepartureAction,
  updateBookingStatusAction,
} from "@/app/admin/actions";
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

function formatDate(value?: string) {
  if (!value) return "Date requested";
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

const statusClasses: Record<BookingStatus, string> = {
  pending: "bg-gold-100 text-gold-800 ring-gold-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";
  const requestedTour =
    typeof params.tour === "string" ? params.tour : "";
  const scopeAll = params.scope === "all";
  const requestedDepartureId =
    typeof params.departure === "string" ? params.departure : "";

  const toursResult = await loadAdminTours();
  const tours = toursResult.data;
  const selectedTour =
    tours.find((tour) => tour.slug === requestedTour) ?? tours[0];

  const [departuresResult, bookingsResult] = await Promise.all([
    loadAdminDepartures(selectedTour?.slug),
    loadAdminBookings(),
  ]);

  const departures = departuresResult.data;
  const bookings = bookingsResult.data;
  const today = new Date().toISOString().slice(0, 10);
  const returnTo = selectedTour
    ? `/admin/bookings?tour=${encodeURIComponent(selectedTour.slug)}`
    : "/admin/bookings";

  const tourBookings = selectedTour
    ? bookings.filter((booking) => booking.tourSlug === selectedTour.slug)
    : bookings;
  const selectedDeparture = requestedDepartureId
    ? departures.find((departure) => departure._id === requestedDepartureId)
    : undefined;
  const viewedBookings = selectedDeparture
    ? bookings.filter(
        (booking) => booking.departureId === selectedDeparture._id,
      )
    : scopeAll
      ? bookings
      : tourBookings;

  const pendingTourBookings = tourBookings.filter(
    (booking) => booking.status === "pending",
  );
  const confirmedTourBookings = tourBookings.filter(
    (booking) => booking.status === "confirmed",
  );
  const confirmedRevenue = confirmedTourBookings.reduce(
    (total, booking) => total + booking.amount,
    0,
  );
  const tourTravellers = tourBookings.reduce(
    (total, booking) => total + booking.travellers,
    0,
  );
  const totalCapacity = departures.reduce(
    (total, departure) => total + departure.capacity,
    0,
  );
  const totalSeatsBooked = departures.reduce(
    (total, departure) => total + departure.booked,
    0,
  );

  const requestParams = new URLSearchParams();
  if (selectedTour) requestParams.set("tour", selectedTour.slug);
  if (scopeAll && !selectedDeparture) requestParams.set("scope", "all");
  if (selectedDeparture) {
    requestParams.set("departure", selectedDeparture._id);
  }
  const requestQuery = requestParams.toString();
  const requestsHref = `/admin/bookings${
    requestQuery ? `?${requestQuery}` : ""
  }#booking-requests`;
  const requestsReturnTo = requestsHref;

  const tourRequestsHref = selectedTour
    ? `/admin/bookings?tour=${encodeURIComponent(selectedTour.slug)}#booking-requests`
    : requestsHref;
  const allRequestsHref = selectedTour
    ? `/admin/bookings?tour=${encodeURIComponent(
        selectedTour.slug,
      )}&scope=all#booking-requests`
    : requestsHref;

  const requestsDescription = selectedDeparture
    ? `${selectedTour?.title ?? selectedDeparture.tourSlug} · ${formatINR(
        selectedDeparture.price,
      )} per person`
    : scopeAll
      ? "Every request across all packages, newest first."
      : "Every request linked to the selected package.";

  if (!toursResult.status.configured) {
    return (
      <div>
        <AdminPageHeader
          eyebrow="Bookings"
          title="Departures & bookings"
          description="Add travel dates, prices and seat capacity for each package."
        />
        <DatabaseSetupNotice
          configured={toursResult.status.configured}
          error={toursResult.status.error}
        />
      </div>
    );
  }

  return (
    <div>
      <AdminNotice notice={notice} error={error} />
      <AdminPageHeader
        eyebrow="Bookings"
        title="Departures & bookings"
        description="Select a package, then create dates with their own price and seat capacity. Travellers can book any date from the website."
      />

      {toursResult.status.error ? (
        <AdminNotice error={toursResult.status.error} />
      ) : null}

      {selectedTour ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Departure dates"
            value={departures.length}
            detail={`${totalSeatsBooked} of ${totalCapacity} seats sold`}
            icon={CalendarDays}
            tone="blue"
          />
          <AdminStatCard
            label="Booking requests"
            value={tourBookings.length}
            detail={`${tourTravellers} ${
              tourTravellers === 1 ? "traveller" : "travellers"
            } across this package`}
            icon={Ticket}
            tone="navy"
          />
          <AdminStatCard
            label="Awaiting confirmation"
            value={pendingTourBookings.length}
            detail="Pending requests to review"
            icon={Clock3}
            tone="gold"
          />
          <AdminStatCard
            label="Confirmed revenue"
            value={formatINR(confirmedRevenue)}
            detail={`${confirmedTourBookings.length} confirmed ${
              confirmedTourBookings.length === 1 ? "booking" : "bookings"
            }`}
            icon={IndianRupee}
            tone="emerald"
          />
        </div>
      ) : null}

      {!tours.length ? (
        <AdminEmptyState
          title="No packages yet"
          description="Create a tour package first, then add departure dates and prices here."
          actionHref="/admin/tours/new"
          actionLabel="Create package"
        />
      ) : (
        <>
          <section className="mt-8">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-stone-500">
              1. Select a tour package
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tours.map((tour) => {
                const active = selectedTour?.slug === tour.slug;
                const pendingCount = bookings.filter(
                  (booking) =>
                    booking.tourSlug === tour.slug &&
                    booking.status === "pending",
                ).length;

                return (
                  <Link
                    key={tour._id}
                    href={`/admin/bookings?tour=${encodeURIComponent(tour.slug)}`}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-2xl border-2 border-blue-500 bg-white p-3 shadow-md shadow-blue-900/5"
                        : "flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 transition hover:border-blue-300"
                    }
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={imageUrl(tour.image, 160)}
                        alt={tour.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-semibold text-navy-950">
                        {tour.title}
                      </p>
                      <p className="truncate text-sm font-semibold text-stone-500">
                        {tour.destinationName} · {formatINR(tour.price)}
                      </p>
                    </div>
                    {pendingCount ? (
                      <span className="shrink-0 rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-gold-800">
                        {pendingCount} pending
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>

          {selectedTour ? (
            <>
              <section className="mt-8 rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">2. Add dates</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-navy-950">
                      {selectedTour.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-sand-100 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-stone-600">
                    {selectedTour.nights}N / {selectedTour.days}D
                  </span>
                </div>

                <form
                  action={saveDepartureAction}
                  className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]"
                >
                  <input type="hidden" name="tourSlug" value={selectedTour.slug} />
                  <input type="hidden" name="returnTo" value={returnTo} />

                  <DepartureCalendar minDate={today} />

                  <div className="grid content-start gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="field-label">Price per person</span>
                        <input
                          type="number"
                          name="price"
                          required
                          min="1"
                          defaultValue={selectedTour.price}
                          className="field py-2.5"
                        />
                      </label>
                      <label>
                        <span className="field-label">Travellers allowed</span>
                        <input
                          type="number"
                          name="capacity"
                          required
                          min="1"
                          defaultValue={20}
                          className="field py-2.5"
                        />
                        <span className="mt-1 block text-sm text-stone-400">
                          Maximum seats on each selected date.
                        </span>
                      </label>
                    </div>
                    <label>
                      <span className="field-label">Note (optional)</span>
                      <input
                        name="note"
                        placeholder="Diwali special"
                        className="field py-2.5"
                      />
                    </label>
                    <div className="rounded-2xl bg-sand-100 p-3 text-sm leading-5 text-stone-500">
                      Every selected date gets the same price and traveller
                      limit. You can edit each date afterwards.
                    </div>
                    <button type="submit" className="btn-primary w-full">
                      <Ticket className="h-4 w-4" />
                      Add selected dates
                    </button>
                  </div>
                </form>
              </section>

              <section className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-stone-500">
                    3. Departures for {selectedTour.title}
                  </h2>
                  <span className="rounded-full bg-sand-200 px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-navy-800">
                    {departures.length} dates
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-400">
                  Only today and future dates appear on the website. Past dates
                  stay here for your records.
                </p>

                {departures.length ? (
                  <div className="mt-3 space-y-2">
                    {departures.map((departure) => {
                      const isPast = departure.startDate < today;
                      const departureRequests = bookings.filter(
                        (booking) => booking.departureId === departure._id,
                      );
                      const departureRequestsHref = `/admin/bookings?tour=${encodeURIComponent(
                        selectedTour.slug,
                      )}&departure=${departure._id}#booking-requests`;

                      return (
                      <article
                        key={departure._id}
                        className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-4"
                      >
                        <div className="flex flex-col gap-3">
                          <form
                            action={saveDepartureAction}
                            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1.4fr_auto]"
                          >
                            <input type="hidden" name="id" value={departure._id} />
                            <input
                              type="hidden"
                              name="tourSlug"
                              value={selectedTour.slug}
                            />
                            <input
                              type="hidden"
                              name="returnTo"
                              value={returnTo}
                            />

                            <label>
                              <span className="field-label">Date</span>
                              <input
                                type="date"
                                name="startDate"
                                required
                                defaultValue={departure.startDate}
                                className="field py-2"
                              />
                            </label>
                            <label>
                              <span className="field-label">Price</span>
                              <input
                                type="number"
                                name="price"
                                required
                                min="1"
                                defaultValue={departure.price}
                                className="field py-2"
                              />
                            </label>
                            <label>
                              <span className="field-label">Travellers</span>
                              <input
                                type="number"
                                name="capacity"
                                required
                                min="1"
                                defaultValue={departure.capacity}
                                className="field py-2"
                              />
                            </label>
                            <label>
                              <span className="field-label">Note</span>
                              <input
                                name="note"
                                defaultValue={departure.note ?? ""}
                                placeholder="Optional"
                                className="field py-2"
                              />
                            </label>
                            <div className="flex items-end gap-2">
                              <button
                                type="submit"
                                className="btn-outline px-4 py-2 text-sm"
                              >
                                Save
                              </button>
                            </div>
                          </form>

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {isPast ? (
                                <span className="rounded-full bg-stone-200 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-stone-500">
                                  Past
                                </span>
                              ) : null}
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1.5 text-sm font-bold text-stone-600">
                                <Users className="h-3.5 w-3.5 text-blue-600" />
                                {departure.booked}/{departure.capacity} booked ·{" "}
                                {departure.seatsLeft} left
                              </span>
                              {departureRequests.length ? (
                                <Link
                                  href={departureRequestsHref}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-inset ring-blue-100 transition hover:bg-blue-100"
                                >
                                  <Ticket className="h-3.5 w-3.5" />
                                  {departureRequests.length}{" "}
                                  {departureRequests.length === 1
                                    ? "request"
                                    : "requests"}
                                </Link>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/admin/bookings/departures/${departure._id}`}
                                className="btn-outline px-4 py-2 text-sm"
                              >
                                Details
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                              <AdminDeleteButton
                                action={deleteDepartureAction}
                                id={departure._id}
                                fields={{
                                  tourSlug: selectedTour.slug,
                                  returnTo,
                                }}
                                confirmText={`Delete the departure on ${formatDate(
                                  departure.startDate,
                                )}?`}
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-8 text-center">
                    <CalendarDays className="mx-auto h-6 w-6 text-stone-400" />
                    <p className="mt-2 text-sm font-semibold text-stone-500">
                      No dates yet. Add the first departure above.
                    </p>
                  </div>
                )}
              </section>
            </>
          ) : null}

          <section id="booking-requests" className="mt-10 scroll-mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-stone-500">
                  Booking requests
                </h2>
                <p className="mt-1 text-sm font-semibold text-stone-500">
                  {requestsDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-full border border-stone-200 bg-white p-1">
                  <Link
                    href={tourRequestsHref}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider transition",
                      !scopeAll
                        ? "bg-navy-950 text-white"
                        : "text-stone-500 hover:text-navy-950",
                    )}
                  >
                    This tour
                  </Link>
                  <Link
                    href={allRequestsHref}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider transition",
                      scopeAll
                        ? "bg-navy-950 text-white"
                        : "text-stone-500 hover:text-navy-950",
                    )}
                  >
                    All tours
                  </Link>
                </div>
                <span className="rounded-full bg-sand-200 px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-navy-800">
                  {viewedBookings.length}{" "}
                  {viewedBookings.length === 1 ? "request" : "requests"}
                </span>
              </div>
            </div>

            {selectedDeparture ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-100">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(selectedDeparture.startDate)}
                </span>
                <Link
                  href={tourRequestsHref}
                  className="text-xs font-extrabold uppercase tracking-wider text-stone-500 transition hover:text-navy-950"
                >
                  Clear date filter
                </Link>
              </div>
            ) : null}

            {bookingsResult.status.error ? (
              <AdminNotice error={bookingsResult.status.error} />
            ) : null}

            <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-navy-950/[0.03]">
              {viewedBookings.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 bg-sand-50/60 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-500">
                        <th className="px-5 py-3 font-extrabold">Traveller</th>
                        <th className="px-3 py-3 font-extrabold">
                          Package & date
                        </th>
                        <th className="px-3 py-3 font-extrabold">Contact</th>
                        <th className="px-3 py-3 text-center font-extrabold">
                          Guests
                        </th>
                        <th className="px-3 py-3 text-right font-extrabold">
                          Amount
                        </th>
                        <th className="px-3 py-3 font-extrabold">Status</th>
                        <th className="px-3 py-3 font-extrabold">Update</th>
                        <th className="px-5 py-3 text-right font-extrabold">
                          <span className="sr-only">Delete</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {viewedBookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="align-top transition hover:bg-sand-50/60"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-50 text-[11px] font-extrabold text-navy-700">
                                {initials(booking.name) || "?"}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-navy-950">
                                  {booking.name}
                                </p>
                                <p className="mt-0.5 text-[11px] font-semibold text-stone-400">
                                  Requested{" "}
                                  {formatCreatedAt(booking.createdAt)}
                                </p>
                                {booking.notes ? (
                                  <p className="mt-1.5 max-w-[220px] text-xs leading-5 text-stone-500">
                                    “{booking.notes}”
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <p className="font-semibold text-navy-950">
                              {booking.tourTitle || booking.tourSlug}
                            </p>
                            {booking.departureId ? (
                              <Link
                                href={`/admin/bookings/departures/${booking.departureId}`}
                                className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-blue-700 transition hover:text-blue-800"
                              >
                                {formatDate(booking.startDate)}
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            ) : (
                              <p className="mt-0.5 text-xs font-semibold text-stone-500">
                                {formatDate(booking.startDate)}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <p className="max-w-[180px] truncate text-xs font-semibold text-stone-600">
                              {booking.email}
                            </p>
                            <p className="mt-0.5 text-xs text-stone-500">
                              {booking.phone || "No phone provided"}
                            </p>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <p className="font-bold text-navy-950">
                              {booking.travellers}
                            </p>
                            <p className="text-[11px] font-semibold text-stone-400">
                              {booking.travellers === 1
                                ? "traveller"
                                : "travellers"}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-right font-bold text-navy-950">
                            {booking.amount
                              ? formatINR(booking.amount)
                              : "On request"}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-inset",
                                statusClasses[booking.status],
                              )}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <form
                              action={updateBookingStatusAction}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={booking._id}
                              />
                              <input
                                type="hidden"
                                name="returnTo"
                                value={requestsReturnTo}
                              />
                              <select
                                name="status"
                                defaultValue={booking.status}
                                aria-label={`Booking status for ${booking.name}`}
                                className="field w-auto py-1.5 text-xs"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                type="submit"
                                className="btn-outline px-2.5 py-1.5 text-xs"
                              >
                                Save
                              </button>
                            </form>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <AdminDeleteButton
                              action={deleteBookingAction}
                              id={booking._id}
                              fields={{ returnTo: requestsReturnTo }}
                              confirmText={`Delete the booking from ${booking.name}?`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <Ticket className="mx-auto h-6 w-6 text-stone-300" />
                  <p className="mt-2 text-sm font-bold text-navy-950">
                    {selectedDeparture
                      ? "No requests for this date yet"
                      : scopeAll
                        ? "No booking requests yet"
                        : "No requests for this package yet"}
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-stone-500">
                    Requests made on the website will appear here with their
                    contact details and payment status.
                  </p>
                  {selectedDeparture ? (
                    <Link
                      href={tourRequestsHref}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
                    >
                      Show all {selectedTour?.title ?? "tour"} requests
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : !scopeAll && tourBookings.length ? (
                    <Link
                      href={allRequestsHref}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
                    >
                      Show all tours
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
