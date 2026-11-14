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
import { BookingsTabs } from "@/components/admin/bookings-tabs";
import { DepartureCalendar } from "@/components/admin/departure-calendar";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminStatCard,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import {
  deleteDepartureAction,
  saveDepartureAction,
} from "@/app/admin/actions";
import {
  loadAdminBookings,
  loadAdminDepartures,
  loadAdminTours,
} from "@/lib/content";
import { formatINR, imageUrl } from "@/lib/utils";

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

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;
  const tourBookings = selectedTour
    ? bookings.filter((booking) => booking.tourSlug === selectedTour.slug)
    : [];
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

  if (!toursResult.status.configured) {
    return (
      <div>
        <AdminPageHeader
          eyebrow="Bookings"
          title="Departures & dates"
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
        title="Departures & dates"
        description="Choose a package, then create dates with their own price and seat capacity. Booking requests are managed on their own page."
      />

      <BookingsTabs pendingCount={pendingCount} />

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
                const pendingForTour = bookings.filter(
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
                    {pendingForTour ? (
                      <span className="shrink-0 rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-gold-800">
                        {pendingForTour} pending
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
                      const departureRequestsHref = `/admin/bookings/requests?tour=${encodeURIComponent(
                        selectedTour.slug,
                      )}&departure=${departure._id}`;

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
                              <input
                                type="hidden"
                                name="id"
                                value={departure._id}
                              />
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
        </>
      )}
    </div>
  );
}
