import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Inbox,
  IndianRupee,
} from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { BookingsTabs } from "@/components/admin/bookings-tabs";
import {
  AdminNotice,
  AdminPageHeader,
  AdminStatCard,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import {
  deleteBookingAction,
  updateBookingStatusAction,
} from "@/app/admin/actions";
import {
  loadAdminBookings,
  loadAdminDepartures,
  loadAdminTours,
} from "@/lib/content";
import { cn, formatINR } from "@/lib/utils";
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

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-gold-100 text-gold-800 ring-gold-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const statusOptions: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminBookingRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";
  const tourParam = typeof params.tour === "string" ? params.tour : "";
  const departureParam =
    typeof params.departure === "string" ? params.departure : "";
  const statusParam = typeof params.status === "string" ? params.status : "";

  const [toursResult, bookingsResult, departuresResult] = await Promise.all([
    loadAdminTours(),
    loadAdminBookings(),
    loadAdminDepartures(),
  ]);

  const tours = toursResult.data;
  const bookings = bookingsResult.data;
  const departures = departuresResult.data;
  const selectedTour = tours.find((tour) => tour.slug === tourParam);
  const departureMatch = departureParam
    ? departures.find((departure) => departure._id === departureParam)
    : undefined;
  const selectedDeparture =
    departureMatch &&
    (!selectedTour || departureMatch.tourSlug === selectedTour.slug)
      ? departureMatch
      : undefined;
  const statusFilter: "all" | BookingStatus = [
    "pending",
    "confirmed",
    "cancelled",
  ].includes(statusParam)
    ? (statusParam as BookingStatus)
    : "all";

  const filteredBookings = bookings
    .filter((booking) => {
      if (selectedTour && booking.tourSlug !== selectedTour.slug) return false;
      if (selectedDeparture && booking.departureId !== selectedDeparture._id) {
        return false;
      }
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;
  const filteredTravellers = filteredBookings.reduce(
    (total, booking) => total + booking.travellers,
    0,
  );
  const filteredPending = filteredBookings.filter(
    (booking) => booking.status === "pending",
  ).length;
  const confirmedRevenue = filteredBookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((total, booking) => total + booking.amount, 0);
  const pendingValue = filteredBookings
    .filter((booking) => booking.status === "pending")
    .reduce((total, booking) => total + booking.amount, 0);
  const confirmedCount = filteredBookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;

  const filterParams = new URLSearchParams();
  if (selectedTour) filterParams.set("tour", selectedTour.slug);
  if (selectedDeparture) {
    filterParams.set("departure", selectedDeparture._id);
  }
  if (statusFilter !== "all") filterParams.set("status", statusFilter);
  const filterQuery = filterParams.toString();
  const returnTo = `/admin/bookings/requests${
    filterQuery ? `?${filterQuery}` : ""
  }`;
  const hasFilters = Boolean(selectedTour || selectedDeparture || statusFilter !== "all");

  if (!toursResult.status.configured) {
    return (
      <div>
        <AdminPageHeader
          eyebrow="Bookings"
          title="Booking requests"
          description="Review every booking request made from the website."
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
        title="Booking requests"
        description="Review every request from the website, filter by package or status, and keep travellers updated."
      />

      <BookingsTabs pendingCount={pendingCount} />

      {bookingsResult.status.error || departuresResult.status.error ? (
        <AdminNotice
          error={
            bookingsResult.status.error ?? departuresResult.status.error
          }
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Requests"
          value={filteredBookings.length}
          detail={`${filteredTravellers} ${
            filteredTravellers === 1 ? "traveller" : "travellers"
          } in this view`}
          icon={Inbox}
          tone="blue"
        />
        <AdminStatCard
          label="Awaiting confirmation"
          value={filteredPending}
          detail="Pending requests to review"
          icon={Clock3}
          tone="gold"
        />
        <AdminStatCard
          label="Confirmed revenue"
          value={formatINR(confirmedRevenue)}
          detail={`${confirmedCount} confirmed ${
            confirmedCount === 1 ? "booking" : "bookings"
          }`}
          icon={IndianRupee}
          tone="emerald"
        />
        <AdminStatCard
          label="Pending value"
          value={formatINR(pendingValue)}
          detail={`${filteredPending} pending ${
            filteredPending === 1 ? "request" : "requests"
          }`}
          icon={IndianRupee}
          tone="gold"
        />
      </div>

      <form
        method="get"
        action="/admin/bookings/requests"
        className="mt-6 rounded-2xl border border-stone-200 bg-white p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_auto] lg:items-end">
          <label>
            <span className="field-label">Package</span>
            <select
              name="tour"
              defaultValue={selectedTour?.slug ?? ""}
              className="field py-2.5"
            >
              <option value="">All tours</option>
              {tours.map((tour) => (
                <option key={tour._id} value={tour.slug}>
                  {tour.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Status</span>
            <select
              name="status"
              defaultValue={statusFilter}
              className="field py-2.5"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className="btn-outline px-4 py-2.5 text-sm">
              Apply filters
            </button>
            {hasFilters ? (
              <Link
                href="/admin/bookings/requests"
                className="text-xs font-extrabold uppercase tracking-wider text-stone-500 transition hover:text-navy-950"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </div>

        {selectedDeparture ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-100">
              {formatDate(selectedDeparture.startDate)}
            </span>
            <span className="text-xs font-semibold text-stone-500">
              {selectedTour?.title ?? selectedDeparture.tourSlug}
            </span>
            <Link
              href={`/admin/bookings/requests?${
                selectedTour
                  ? `tour=${encodeURIComponent(selectedTour.slug)}${
                      statusFilter !== "all" ? "&" : ""
                    }`
                  : ""
              }${
                statusFilter !== "all" ? `status=${statusFilter}` : ""
              }`}
              className="text-xs font-extrabold uppercase tracking-wider text-stone-500 transition hover:text-navy-950"
            >
              Clear date
            </Link>
            <input
              type="hidden"
              name="departure"
              value={selectedDeparture._id}
            />
          </div>
        ) : null}
      </form>

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-stone-500">
            {selectedTour
              ? `Requests for ${selectedTour.title}`
              : "All booking requests"}
          </h2>
          <span className="rounded-full bg-sand-200 px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-navy-800">
            {filteredBookings.length}{" "}
            {filteredBookings.length === 1 ? "request" : "requests"}
          </span>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-navy-950/[0.03]">
          {filteredBookings.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-sand-50/60 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-500">
                    <th className="px-5 py-3 font-extrabold">Traveller</th>
                    <th className="px-3 py-3 font-extrabold">Package & date</th>
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
                  {filteredBookings.map((booking) => (
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
                              Requested {formatCreatedAt(booking.createdAt)}
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
                          {booking.travellers === 1 ? "traveller" : "travellers"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right font-bold text-navy-950">
                        {booking.amount ? formatINR(booking.amount) : "On request"}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-inset",
                            statusStyles[booking.status],
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
                          <input type="hidden" name="id" value={booking._id} />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={returnTo}
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
                          fields={{ returnTo }}
                          confirmText={`Delete the booking from ${booking.name}?`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <Inbox className="mx-auto h-7 w-7 text-stone-300" />
              <p className="mt-3 font-display text-xl font-semibold text-navy-950">
                {hasFilters
                  ? "No requests match these filters"
                  : "No booking requests yet"}
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-stone-500">
                {hasFilters
                  ? "Try a different package, status or date to see more requests."
                  : "Requests made on the website will appear here with their contact details and payment status."}
              </p>
              {hasFilters ? (
                <Link
                  href="/admin/bookings/requests"
                  className="btn-outline mt-5 px-4 py-2 text-sm"
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
