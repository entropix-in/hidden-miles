import Link from "next/link";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import { AdminDepartureEditor } from "@/components/admin/admin-departure-editor";
import { AdminDeparturePackage, departurePackage } from "@/components/admin/admin-departure-package";
import { AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { loadAdminBookings, loadAdminDepartures, loadAdminTours } from "@/lib/content";
import { bookingStatusLabels } from "@/lib/booking-status";
import { calendarToday, dateLabel } from "@/lib/departure-dates";
import { formatINR } from "@/lib/utils";

export default async function AdminDepartureDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, search, tours, departures] = await Promise.all([params, searchParams, loadAdminTours(), loadAdminDepartures()]);
  if (!tours.status.configured) return <DatabaseSetupNotice configured={false} error={tours.status.error} />;

  const departure = departures.data.find((item) => item._id === id);
  if (!departure) return (
    <div className="admin-departure-workspace">
      <Link className="admin-data-link" href="/admin/departures"><ArrowLeft size={16} aria-hidden /> Departures</Link>
      <h1 className="admin-page-title">Departure not found</h1>
      {departures.status.error && <AdminNotice error={departures.status.error} />}
    </div>
  );

  const source = tours.data.find((item) => item.slug === departure.tourSlug);
  const tour = source && departurePackage(source);
  const bookingsResult = await loadAdminBookings(departure.tourSlug);
  const bookings = bookingsResult.data.filter((item) => item.departureId === id);
  const pending = bookings.filter((item) => item.status === "pending").length;
  const title = dateLabel(departure.startDate);
  const today = calendarToday();
  const isPast = departure.startDate < today;
  const url = `/admin/departures/${id}`;
  const datesUrl = `/admin/departures?tour=${encodeURIComponent(departure.tourSlug)}${isPast ? "&when=past" : ""}`;
  const requestsUrl = `/admin/bookings?tour=${encodeURIComponent(departure.tourSlug)}&departure=${id}`;

  return (
    <div className="admin-departure-workspace admin-departure-detail">
      <nav aria-label="Breadcrumb">
        <Link href={datesUrl} className="admin-data-link"><ArrowLeft size={16} aria-hidden /> Back to departures</Link>
      </nav>
      <header className="admin-workspace-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          <p className="admin-departure-meta mt-1">{isPast ? "Past departure" : departure.seatsLeft ? "Open for booking" : "Sold out"}</p>
        </div>
        <AdminDepartureEditor key={String(search.flash ?? "")} packages={tour ? [tour] : []}
          selected={tour} departure={departure} minDate={today} returnTo={url} triggerLabel="Edit departure"
          unavailable={departures.data.filter((item) => item.tourSlug === departure.tourSlug)} />
      </header>

      {(departures.status.error || bookingsResult.status.error) && <AdminNotice error={departures.status.error ?? bookingsResult.status.error} />}

      <section className="admin-data-panel admin-departure-summary" aria-label="Departure summary">
        <div>
          {tour ? <AdminDeparturePackage tour={tour} details /> : <p>{departure.tourSlug}</p>}
        </div>
        <dl>
          <div><dt>Price per person</dt><dd>{formatINR(departure.price)}</dd></div>
          <div><dt>Seats booked</dt><dd>{departure.booked} / {departure.capacity}</dd></div>
          <div><dt>Seats left</dt><dd>{departure.seatsLeft}</dd></div>
        </dl>
        {departure.note && <p className="admin-departure-note"><span>Departure note</span>{departure.note}</p>}
      </section>

      <section className="admin-data-panel" aria-labelledby="departure-requests-title">
        <header className="admin-data-header admin-departure-list-header">
          <div>
            <h2 id="departure-requests-title">Booking requests <span className="admin-count">{bookings.length}</span></h2>
            {!!pending && <p className="admin-departure-meta mt-1">{pending} pending</p>}
          </div>
          {!!bookings.length && <Link className="btn-outline" href={requestsUrl}>Manage requests <ArrowRight size={15} aria-hidden /></Link>}
        </header>
        {bookings.length ? (
          <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Requests for this departure">
            <table role="table" className="admin-data-table admin-departure-bookings">
              <thead role="rowgroup"><tr role="row">
                <th role="columnheader" scope="col">Traveller</th>
                <th role="columnheader" scope="col">Guests</th>
                <th role="columnheader" scope="col">Amount</th>
                <th role="columnheader" scope="col">Status</th>
              </tr></thead>
              <tbody role="rowgroup">
                {bookings.map((booking) => (
                  <tr key={booking._id} role="row">
                    <td role="cell" className="admin-departure-guest"><span>{booking.name}</span>
                      <p><a className="admin-data-link" href={`mailto:${booking.email}`}>{booking.email}</a></p></td>
                    <td role="cell" data-mobile-label="Guests">{booking.travellers}</td>
                    <td role="cell" data-mobile-label="Amount">{booking.amount ? formatINR(booking.amount) : "On request"}</td>
                    <td role="cell"><span className="admin-departure-status" data-status={booking.status}>{bookingStatusLabels[booking.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-list-empty"><Inbox size={22} aria-hidden /><span>No booking requests for this departure yet.</span></div>
        )}
      </section>

    </div>
  );
}
