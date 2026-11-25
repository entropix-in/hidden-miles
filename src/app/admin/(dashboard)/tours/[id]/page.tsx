import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Inbox, Package, Pencil } from "lucide-react";
import { AdminTourSchedule } from "@/components/admin/admin-tour-schedule";
import { AdminDepartureEditor } from "@/components/admin/admin-departure-editor";
import { departurePackage } from "@/components/admin/admin-departure-package";
import { AdminListPagination, adminPageNumber } from "@/components/admin/admin-list-pagination";
import { AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { loadAdminBookings, loadAdminDepartures, loadAdminTour } from "@/lib/content";
import { bookingStatusLabels } from "@/lib/booking-status";
import { calendarToday, dateLabel } from "@/lib/departure-dates";
import { formatINR, imageUrl } from "@/lib/utils";

const requestsPageSize = 10;

export default async function AdminTourDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, search] = await Promise.all([params, searchParams]);
  const tour = await loadAdminTour(id);

  if (!tour) return (
    <div className="admin-departure-workspace">
      <Link className="admin-data-link" href="/admin/tours"><ArrowLeft size={16} aria-hidden /> Tour packages</Link>
      <h1 className="admin-page-title">Package not found</h1>
    </div>
  );

  const [departuresResult, bookingsResult] = await Promise.all([loadAdminDepartures(), loadAdminBookings(tour.slug)]);
  if (!departuresResult.status.configured) return <DatabaseSetupNotice configured={false} error={departuresResult.status.error} />;

  const today = calendarToday();
  const departures = departuresResult.data.filter((item) => item.tourSlug === tour.slug)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const upcoming = departures.filter((item) => item.startDate >= today);
  const next = upcoming.find((item) => item.seatsLeft > 0);
  const seatsOpen = upcoming.reduce((sum, item) => sum + item.seatsLeft, 0);
  const departureDate = new Map(departures.map((item) => [item._id, item.startDate]));

  const bookings = [...bookingsResult.data].sort((a, b) => b.createdAt - a.createdAt);
  const pending = bookings.filter((item) => item.status === "pending").length;
  const confirmed = bookings.filter((item) => item.status === "confirmed");
  const revenue = confirmed.reduce((sum, item) => sum + item.amount, 0);
  const page = adminPageNumber(search.page, Math.max(1, Math.ceil(bookings.length / requestsPageSize)));
  const visible = bookings.slice((page - 1) * requestsPageSize, page * requestsPageSize);

  const url = `/admin/tours/${id}`;
  const pkg = departurePackage(tour);
  const requestsUrl = `/admin/bookings?tour=${encodeURIComponent(tour.slug)}`;
  const status = departuresResult.status.error ?? bookingsResult.status.error;

  return (
    <div className="admin-departure-workspace admin-departure-detail">
      <nav aria-label="Breadcrumb">
        <Link href="/admin/tours" className="admin-data-link"><ArrowLeft size={16} aria-hidden /> Back to packages</Link>
      </nav>
      <header className="admin-workspace-header">
        <div>
          <h1 className="admin-page-title">{tour.title}</h1>
          <p className="admin-departure-meta mt-1">
            {tour.destinationName} · {tour.nights} nights / {tour.days} days
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/tours/${tour.slug}`} target="_blank" className="btn-outline admin-icon-button"
            aria-label={`View ${tour.title} on the website`}><ExternalLink className="h-3.5 w-3.5" /></Link>
          <Link href={`${url}/edit`} className="btn-outline"><Pencil className="h-3.5 w-3.5" /> Edit package</Link>
        </div>
      </header>

      {status && <AdminNotice error={status} />}

      <section className="admin-data-panel admin-tour-hero" aria-label="Package overview">
        <span className="admin-tour-hero-image">
          {tour.image ? <Image src={imageUrl(tour.image, 640)} alt="" fill sizes="(min-width: 768px) 280px, 100vw" className="object-cover" />
            : <Package size={24} aria-hidden />}
        </span>
        <div className="admin-tour-hero-body">
          <div className="flex flex-wrap items-center gap-2">
            <span className="admin-tour-chip">{tour.region}</span>
            {tour.featured && <span className="admin-tour-chip" data-tone="pine">Featured</span>}
            <span className="admin-tour-chip">{tour.nights}N / {tour.days}D</span>
          </div>
          {tour.summary && <p className="admin-tour-summary">{tour.summary}</p>}
          <p className="admin-tour-price"><strong>{formatINR(tour.price)}</strong> per person</p>
        </div>
      </section>

      <dl className="admin-tour-stats">
        <div><dt>Next departure</dt><dd>{next ? dateLabel(next.startDate) : "—"}</dd>
          <p>{next ? `${next.seatsLeft} seats left` : "Nothing scheduled"}</p></div>
        <div><dt>Open seats</dt><dd>{seatsOpen}</dd>
          <p>across {upcoming.length} upcoming {upcoming.length === 1 ? "date" : "dates"}</p></div>
        <div><dt>Requests</dt><dd>{bookings.length}</dd>
          <p data-tone={pending ? "gold" : undefined}>{pending ? `${pending} awaiting reply` : "All handled"}</p></div>
        <div><dt>Confirmed value</dt><dd>{formatINR(revenue)}</dd>
          <p>{confirmed.length} confirmed {confirmed.length === 1 ? "booking" : "bookings"}</p></div>
      </dl>

      <section className="admin-data-panel" aria-labelledby="tour-dates-title">
        <header className="admin-data-header admin-departure-list-header">
          <div>
            <h2 id="tour-dates-title">Departure dates <span className="admin-count">{departures.length}</span></h2>
            <p className="admin-departure-meta mt-1">{upcoming.length} upcoming · click a highlighted day to open it</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link className="btn-outline" href={`/admin/departures?tour=${encodeURIComponent(tour.slug)}`}>All dates <ArrowRight size={15} aria-hidden /></Link>
            <AdminDepartureEditor key={String(search.flash ?? "")} packages={[pkg]} selected={pkg} minDate={today}
              returnTo={url} unavailable={departures.map(({ tourSlug, startDate }) => ({ tourSlug, startDate }))} />
          </div>
        </header>
        <AdminTourSchedule today={today} pastHref={`/admin/departures?tour=${encodeURIComponent(tour.slug)}&when=past`}
          departures={departures.map((item) => ({ id: item._id, date: item.startDate, price: item.price, booked: item.booked,
            capacity: item.capacity, seatsLeft: item.seatsLeft,
            requests: bookings.filter((booking) => booking.departureId === item._id).length }))} />
      </section>

      <section className="admin-data-panel" aria-labelledby="tour-requests-title">
        <header className="admin-data-header admin-departure-list-header">
          <div>
            <h2 id="tour-requests-title">Booking requests <span className="admin-count">{bookings.length}</span></h2>
            {!!pending && <p className="admin-departure-meta mt-1">{pending} pending</p>}
          </div>
          {!!bookings.length && <Link className="btn-outline" href={requestsUrl}>Manage requests <ArrowRight size={15} aria-hidden /></Link>}
        </header>
        {bookings.length ? (
          <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Requests for this package">
            <table role="table" className="admin-data-table admin-departure-bookings">
              <thead role="rowgroup"><tr role="row">
                <th role="columnheader" scope="col">Traveller</th>
                <th role="columnheader" scope="col">Departure</th>
                <th role="columnheader" scope="col">Guests</th>
                <th role="columnheader" scope="col">Amount</th>
                <th role="columnheader" scope="col">Status</th>
              </tr></thead>
              <tbody role="rowgroup">
                {visible.map((booking) => {
                  const date = booking.startDate ?? (booking.departureId && departureDate.get(booking.departureId));
                  return (
                    <tr key={booking._id} role="row">
                      <td role="cell" className="admin-departure-guest">
                        <Link className="admin-tour-guest-name" href={`/admin/bookings/${booking._id}`}>{booking.name}</Link>
                        <p className="admin-departure-meta">{booking.email}</p></td>
                      <td role="cell" data-mobile-label="Departure">{date ? (booking.departureId
                        ? <Link className="admin-tour-cell-link" href={`/admin/departures/${booking.departureId}`}>{dateLabel(date)}</Link>
                        : dateLabel(date)) : "Flexible"}</td>
                      <td role="cell" data-mobile-label="Guests">{booking.travellers}</td>
                      <td role="cell" data-mobile-label="Amount">{booking.amount ? formatINR(booking.amount) : "On request"}</td>
                      <td role="cell"><span className="admin-departure-status" data-status={booking.status}>{bookingStatusLabels[booking.status]}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-list-empty"><Inbox size={22} aria-hidden /><span>No booking requests for this package yet.</span></div>
        )}
        <AdminListPagination path={url} filters={new URLSearchParams()} page={page} pageSize={requestsPageSize} total={bookings.length} />
      </section>
    </div>
  );
}
