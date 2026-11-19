import Link from "next/link";
import { ArrowRight, ArrowUpRight, Inbox, Search } from "lucide-react";
import { AdminBookingSortButton } from "@/components/admin/admin-booking-sort-button";
import { AdminDeparturePackage, departurePackage } from "@/components/admin/admin-departure-package";
import { AdminBookingStatus } from "@/components/admin/admin-booking-status";
import { AdminListPagination, adminPageNumber } from "@/components/admin/admin-list-pagination";
import { AdminPackagePicker } from "@/components/admin/admin-package-picker";
import { AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { bookingStatusLabels } from "@/lib/booking-status";
import { loadAdminBookings, loadAdminDepartures, loadAdminTours } from "@/lib/content";
import { formatINR } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const pageSize = 10;
const columns = [
  ["traveller", "Traveller"], ["package", "Package"], ["departure", "Departure date"], ["guests", "Guests"],
  ["amount", "Amount"], ["received", "Received"], ["status", "Status"],
] as const;

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
  const [key, requestedOrder] = typeof params.sort === "string" ? params.sort.split("-") : [];
  const sortColumn = columns.find(([column]) => column === key)?.[0] ?? "received";
  const order = requestedOrder === "asc" || requestedOrder === "desc" ? requestedOrder : "desc";
  const sort = `${sortColumn}-${order}`;
  const direction = order === "asc" ? 1 : -1;
  const toursBySlug = new Map(toursResult.data.map((tour) => [tour.slug, departurePackage(tour)]));
  const filtered = matched.filter((booking) => !status || booking.status === status).sort((a, b) => {
    if (sortColumn === "departure" && Boolean(a.startDate) !== Boolean(b.startDate)) return a.startDate ? -1 : 1;
    const difference = sortColumn === "traveller" ? a.name.localeCompare(b.name)
      : sortColumn === "package" ? (a.tourTitle || a.tourSlug).localeCompare(b.tourTitle || b.tourSlug)
      : sortColumn === "departure" ? (a.startDate ?? "").localeCompare(b.startDate ?? "")
      : sortColumn === "guests" ? a.travellers - b.travellers
      : sortColumn === "amount" ? a.amount - b.amount
      : sortColumn === "status" ? bookingStatusLabels[a.status].localeCompare(bookingStatusLabels[b.status])
      : a.createdAt - b.createdAt;
    return difference * direction || b.createdAt - a.createdAt || Number(b._id) - Number(a._id);
  });
  const page = adminPageNumber(params.page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const filters = new URLSearchParams();
  if (selected) filters.set("tour", selected.slug);
  if (departure) filters.set("departure", departure._id);
  if (query) filters.set("q", query);
  if (status) filters.set("status", status);
  if (sort !== "received-desc") filters.set("sort", sort);
  const hasFilters = Boolean(selected || departure || query || status);

  function filterHref(change: { status?: string; departure?: string; page?: string; sort?: string } = {}) {
    const next = new URLSearchParams(filters);
    for (const [key, value] of Object.entries(change)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    return next.size ? `/admin/bookings?${next}` : "/admin/bookings";
  }

  return (
    <div className="admin-departure-workspace">
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
              {filters.has("sort") && <input type="hidden" name="sort" value={sort} />}
              <div className="admin-list-filters admin-booking-filters">
                <label><span className="field-label">Search requests</span>
                  <span className="admin-search-field"><Search size={16} aria-hidden />
                    <input className="field" type="search" name="q" defaultValue={query} placeholder="Name, email or phone" />
                  </span>
                </label>
                <AdminPackagePicker packages={packages} name="tour" selected={selected?.slug} placeholder="All packages" />
                <div className="flex flex-wrap items-center gap-2">
                  <button className="btn-outline" type="submit">Apply filters</button>
                  {hasFilters && <Link className="admin-text-action" href="/admin/bookings">Clear</Link>}
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
            {filtered.length > 0 && (
              <form method="get" action="/admin/bookings" className="admin-departure-mobile-sort" key={sort}>
                {[...filters].filter(([key]) => key !== "sort").map(([key, value]) =>
                  <input type="hidden" key={key} name={key} value={value} />)}
                <label><span className="field-label">Sort by</span>
                  <select name="sort" className="field" defaultValue={sort}>
                    {columns.flatMap(([key, label]) => [
                      <option key={key + "-asc"} value={key + "-asc"}>{label} · {key === "departure" ? "Earliest first" : key === "received" ? "Oldest first" : key === "guests" || key === "amount" ? "Lowest first" : "A to Z"}</option>,
                      <option key={key + "-desc"} value={key + "-desc"}>{label} · {key === "departure" ? "Latest first" : key === "received" ? "Newest first" : key === "guests" || key === "amount" ? "Highest first" : "Z to A"}</option>,
                    ])}
                  </select>
                </label>
                <button type="submit" className="btn-outline">Sort</button>
              </form>
            )}
            {filtered.length ? (
              <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Booking requests table">
                <table role="table" className="admin-data-table admin-bookings-table">
                  <thead role="rowgroup"><tr role="row">
                    {columns.map(([key, label]) => (
                      <th key={key} role="columnheader" scope="col"
                        className={key === "amount" || key === "guests" ? "admin-cell-number" : undefined}
                        aria-sort={sortColumn === key ? order === "asc" ? "ascending" : "descending" : undefined}>
                        <AdminBookingSortButton label={label} direction={sortColumn === key ? order : undefined}
                          href={filterHref({ sort: `${key}-${sortColumn === key && order === "asc" ? "desc" : "asc"}` })} />
                      </th>
                    ))}
                  <th scope="col" role="columnheader" className="admin-request-details-cell"><span className="sr-only">Details</span></th>
                  </tr></thead>
                  <tbody role="rowgroup">
                    {filtered.slice((page - 1) * pageSize, page * pageSize).map((booking) => {
                      const date = booking.startDate ? dateFormatter.format(new Date(`${booking.startDate}T00:00:00Z`)) : "Date on request";
                      const returnTo = filterHref({ page: page > 1 ? String(page) : "" });
                      const detailHref = `/admin/bookings/${booking._id}?from=${encodeURIComponent(returnTo)}`;
                      const tour = toursBySlug.get(booking.tourSlug);
                      return (
                        <tr role="row" key={booking._id}>
                          <td role="cell" className="admin-booking-traveller">
                            <Link className="admin-booking-detail-link" href={detailHref}>
                              {booking.name}<ArrowRight size={14} aria-hidden />
                            </Link>
                            <p className="admin-booking-email" title={booking.email}>{booking.email}</p>
                          </td>
                          <td role="cell" className="admin-booking-package">
                            {tour ? <AdminDeparturePackage tour={{ ...tour, title: booking.tourTitle || tour.title }} />
                              : <span className="admin-departure-package-title">{booking.tourTitle || booking.tourSlug}</span>}
                          </td>
                          <td role="cell" data-mobile-label="Departure date" className="admin-booking-departure whitespace-nowrap">
                            {booking.departureId ? (
                              <Link className="admin-data-link" href={`/admin/departures/${booking.departureId}`}>{date}<ArrowUpRight size={13} aria-hidden /></Link>
                            ) : date}
                          </td>
                          <td role="cell" data-mobile-label="Guests" className="admin-cell-number">{booking.travellers}</td>
                          <td role="cell" data-mobile-label="Amount" className="admin-cell-number whitespace-nowrap"><strong>{booking.amount ? formatINR(booking.amount) : "On request"}</strong></td>
                          <td role="cell" data-mobile-label="Received" className="whitespace-nowrap">{dateFormatter.format(new Date(booking.createdAt))}</td>
                          <td role="cell">
                            <AdminBookingStatus key={booking.status} id={booking._id} name={booking.name} status={booking.status} returnTo={returnTo} />
                          </td>
                          <td role="cell" className="admin-request-details-cell">
                            <Link className="btn-outline" href={detailHref} aria-label={`Details for ${booking.name}`}>Details</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-list-empty"><Inbox size={25} aria-hidden />
                <strong>{hasFilters ? "No requests match these filters" : "No booking requests yet"}</strong>
                {hasFilters && <Link href="/admin/bookings" className="btn-outline mt-2">Clear filters</Link>}
              </div>
            )}
            <AdminListPagination path="/admin/bookings" filters={filters} page={page} pageSize={pageSize} total={filtered.length} />
          </section>
        </>
      )}
    </div>
  );
}
