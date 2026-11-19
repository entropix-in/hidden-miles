import Link from "next/link";
import { ArrowUpRight, Inbox, Search } from "lucide-react";
import { deleteBookingAction } from "@/app/admin/actions";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminBookingStatus } from "@/components/admin/admin-booking-status";
import { AdminListPagination, adminPageNumber } from "@/components/admin/admin-list-pagination";
import { AdminPackagePicker } from "@/components/admin/admin-package-picker";
import { AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { bookingStatusLabels } from "@/lib/booking-status";
import { loadAdminBookings, loadAdminDepartures, loadAdminTours } from "@/lib/content";
import { formatINR } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const pageSize = 20;

export default async function AdminBookingRequestsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, toursResult, bookingsResult, departuresResult] = await Promise.all([
    searchParams, loadAdminTours(), loadAdminBookings(), loadAdminDepartures(),
  ]);
  const packages = toursResult.data.map(({ slug, title, image, price, destinationName }) => ({ slug, title, image, price, destinationName }));
  const selected = packages.find((tour) => tour.slug === params.tour);
  const departure = departuresResult.data.find((item) =>
    item._id === params.departure && (!selected || selected.slug === item.tourSlug));
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" && Object.hasOwn(bookingStatusLabels, params.status) ? params.status : "";
  const search = query.toLowerCase();
  const matched = bookingsResult.data.filter((booking) =>
    (!selected || booking.tourSlug === selected.slug) &&
    (!departure || booking.departureId === departure._id) &&
    (!search || `${booking.name} ${booking.email} ${booking.phone} ${booking.tourTitle}`.toLowerCase().includes(search)));
  const filtered = matched.filter((booking) => !status || booking.status === status).sort((a, b) => b.createdAt - a.createdAt);
  const page = adminPageNumber(params.page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const filters = new URLSearchParams();
  if (selected) filters.set("tour", selected.slug);
  if (departure) filters.set("departure", departure._id);
  if (query) filters.set("q", query);
  if (status) filters.set("status", status);

  function filterHref(change: { status?: string; departure?: string; page?: string } = {}) {
    const next = new URLSearchParams(filters);
    for (const [key, value] of Object.entries(change)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    return next.size ? `/admin/bookings?${next}` : "/admin/bookings";
  }

  return (
    <div className="space-y-4">
      <header className="admin-workspace-header">
        <div>
          <h1 className="admin-page-title">Booking requests</h1>
          <p className="admin-editor-help mt-1">Review traveller details and confirm or cancel requests.</p>
        </div>
      </header>
      {!toursResult.status.configured ? (
        <DatabaseSetupNotice configured={false} error={toursResult.status.error} />
      ) : (
        <>
          {(bookingsResult.status.error || departuresResult.status.error) && <AdminNotice error={bookingsResult.status.error ?? departuresResult.status.error} />}
          <search className="admin-filter-panel">
            <form method="get" action="/admin/bookings" key={filters.toString()}>
              {status && <input type="hidden" name="status" value={status} />}
              <div className="admin-list-filters admin-booking-filters">
                <label><span className="field-label">Search requests</span>
                  <span className="admin-search-field"><Search size={16} aria-hidden />
                    <input className="field" type="search" name="q" defaultValue={query} placeholder="Name, email or phone" />
                  </span>
                </label>
                <AdminPackagePicker packages={packages} name="tour" selected={selected?.slug} placeholder="All packages" />
                <div className="flex flex-wrap items-center gap-2">
                  <button className="btn-outline" type="submit">Apply filters</button>
                  {!!filters.size && <Link className="admin-text-action" href="/admin/bookings">Clear</Link>}
                </div>
              </div>
              {departure && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="departure" value={departure._id} />
                  <span>Departure on {dateFormatter.format(new Date(`${departure.startDate}T00:00:00Z`))}</span>
                  <Link className="admin-text-action" href={filterHref({ departure: "" })}>Clear date</Link>
                </div>
              )}
            </form>
          </search>

          <section className="admin-data-panel" aria-labelledby="booking-list-title">
            <header className="admin-data-header">
              <h2 id="booking-list-title">Requests <span className="admin-count">{filtered.length}</span></h2>
              <nav aria-label="Request status" className="admin-view-options">
                <Link href={filterHref({ status: "" })} aria-current={!status ? "page" : undefined}>All <span>{matched.length}</span></Link>
                {Object.entries(bookingStatusLabels).map(([value, label]) =>
                  <Link key={value} href={filterHref({ status: value })} aria-current={status === value ? "page" : undefined}>
                    {label} <span>{matched.filter((item) => item.status === value).length}</span>
                  </Link>)}
              </nav>
            </header>
            {filtered.length ? (
              <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Booking requests table">
                <table role="table" className="admin-data-table admin-bookings-table">
                  <thead role="rowgroup"><tr role="row">
                    <th role="columnheader" scope="col">Traveller</th>
                    <th role="columnheader" scope="col">Package & date</th>
                    <th role="columnheader" scope="col" className="admin-cell-number">Guests</th>
                    <th role="columnheader" scope="col" className="admin-cell-number">Amount</th>
                    <th role="columnheader" scope="col">Status</th>
                    <th role="columnheader" scope="col"><span className="sr-only">Delete</span></th>
                  </tr></thead>
                  <tbody role="rowgroup">
                    {filtered.slice((page - 1) * pageSize, page * pageSize).map((booking) => {
                      const date = booking.startDate ? dateFormatter.format(new Date(`${booking.startDate}T00:00:00Z`)) : "Date on request";
                      const returnTo = filterHref({ page: page > 1 ? String(page) : "" });
                      return (
                        <tr role="row" key={booking._id}>
                          <td role="cell" className="admin-booking-traveller">
                            <strong>{booking.name}</strong>
                            <p><a href={`mailto:${booking.email}`}>{booking.email}</a></p>
                            {booking.phone && <p><a href={`tel:${booking.phone}`}>{booking.phone}</a></p>}
                            <p>Requested {dateFormatter.format(new Date(booking.createdAt))}</p>
                            {booking.notes && <details className="mt-1"><summary>Traveller note</summary><p>{booking.notes}</p></details>}
                          </td>
                          <td role="cell" className="admin-booking-package">
                            <strong>{booking.tourTitle || booking.tourSlug}</strong>
                            <p>{booking.departureId ? (
                              <Link className="admin-data-link" href={`/admin/departures/${booking.departureId}`}>{date}<ArrowUpRight size={13} aria-hidden /></Link>
                            ) : date}</p>
                          </td>
                          <td role="cell" data-mobile-label="Guests" className="admin-cell-number">{booking.travellers}</td>
                          <td role="cell" data-mobile-label="Amount" className="admin-cell-number whitespace-nowrap"><strong>{booking.amount ? formatINR(booking.amount) : "On request"}</strong></td>
                          <td role="cell"><AdminBookingStatus key={booking.status} id={booking._id} name={booking.name} status={booking.status} returnTo={returnTo} /></td>
                          <td role="cell"><AdminDeleteButton compact label={`Delete request from ${booking.name}`} action={deleteBookingAction}
                            id={booking._id} fields={{ returnTo }} confirmText={`Delete the booking request from ${booking.name}?`} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-list-empty"><Inbox size={25} aria-hidden />
                <strong>{filters.size ? "No requests match these filters" : "No booking requests yet"}</strong>
                {!!filters.size && <Link href="/admin/bookings" className="btn-outline mt-2">Clear filters</Link>}
              </div>
            )}
            <AdminListPagination path="/admin/bookings" filters={filters} page={page} pageSize={pageSize} total={filtered.length} />
          </section>
        </>
      )}
    </div>
  );
}
