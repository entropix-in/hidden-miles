import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { deleteBookingAction } from "@/app/admin/actions";
import { AdminBookingStatus } from "@/components/admin/admin-booking-status";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminDeparturePackage, departurePackage } from "@/components/admin/admin-departure-package";
import { AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { loadAdminBooking, loadAdminTours } from "@/lib/content";
import { dateLabel } from "@/lib/departure-dates";
import { formatINR } from "@/lib/utils";

const receivedDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function AdminBookingDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [result, tours] = await Promise.all([loadAdminBooking(id), loadAdminTours()]);
  const booking = result.data[0];
  const back = typeof query.from === "string" && (query.from === "/admin/bookings" || query.from.startsWith("/admin/bookings?"))
    ? query.from : "/admin/bookings";
  const returnTo = `/admin/bookings/${id}?from=${encodeURIComponent(back)}`;
  const source = tours.data.find((tour) => tour.slug === booking?.tourSlug);

  if (!result.status.configured) return <DatabaseSetupNotice configured={false} error={result.status.error} />;

  return (
    <div className="admin-departure-workspace admin-departure-detail">
      <nav aria-label="Breadcrumb"><Link href={back} className="admin-data-link"><ArrowLeft size={16} aria-hidden /> Back to requests</Link></nav>
      {result.status.error && <AdminNotice error={result.status.error} />}
      {booking ? (
        <>
          <header className="admin-workspace-header">
            <div>
              <h1 className="admin-page-title">{booking.name}</h1>
              <p className="admin-departure-meta mt-1">Request #{booking._id} · Received {receivedDate.format(new Date(booking.createdAt))}</p>
            </div>
            <AdminBookingStatus key={booking.status} id={booking._id} name={booking.name} status={booking.status} returnTo={returnTo} />
          </header>

          <div className="admin-booking-detail-panels">
            <section className="admin-data-panel admin-booking-detail-panel" aria-labelledby="booking-trip">
              <h2 id="booking-trip">Trip</h2>
              {source ? (
                <AdminDeparturePackage tour={{ ...departurePackage(source), title: booking.tourTitle || source.title }} details />
              ) : <p>{booking.tourTitle || booking.tourSlug}</p>}
              <dl className="admin-booking-facts">
                <div><dt>Departure</dt><dd>
                  {booking.departureId ? (
                    <Link href={`/admin/departures/${booking.departureId}`} className="admin-data-link">
                      {booking.startDate ? dateLabel(booking.startDate) : "View date"} <ArrowRight size={14} aria-hidden />
                    </Link>
                  ) : booking.startDate ? dateLabel(booking.startDate) : "Date on request"}
                </dd></div>
                <div><dt>Guests</dt><dd>{booking.travellers}</dd></div>
                {booking.city && <div><dt>Joining from</dt><dd>{booking.city}</dd></div>}
                <div><dt>Amount</dt><dd>{booking.amount ? formatINR(booking.amount) : "On request"}</dd></div>
              </dl>
            </section>

            <section className="admin-data-panel admin-booking-detail-panel" aria-labelledby="booking-contact">
              <h2 id="booking-contact">Contact</h2>
              <dl className="admin-booking-contact">
                <div><dt>Email</dt><dd>{booking.email
                  ? <a className="admin-data-link" href={`mailto:${booking.email}`}>{booking.email}</a> : "Not provided"}</dd></div>
                <div><dt>Phone</dt><dd>{booking.phone
                  ? <a className="admin-data-link" href={`tel:${booking.phone}`}>{booking.phone}</a> : "Not provided"}</dd></div>
              </dl>
            </section>
          </div>

          {(booking.addons?.length || booking.discountAmount > 0) && (
            <section className="admin-data-panel admin-booking-detail-panel" aria-labelledby="booking-extras">
              <h2 id="booking-extras">Add-ons & discount</h2>
              <dl className="admin-booking-facts">
                {booking.addons?.map((addon) => (
                  <div key={addon.id}>
                    <dt>{addon.title}{addon.quantity > 1 ? ` × ${addon.quantity}` : ""}</dt>
                    <dd>{addon.total ? formatINR(addon.total) : "Free"}</dd>
                  </div>
                ))}
                {booking.discountAmount > 0 && (
                  <div>
                    <dt>{booking.discountName}{booking.discountCode ? ` (${booking.discountCode})` : ""}</dt>
                    <dd>– {formatINR(booking.discountAmount)}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {booking.notes && (
            <section className="admin-data-panel admin-booking-detail-panel" aria-labelledby="booking-note">
              <h2 id="booking-note">Traveller note</h2>
              <p className="whitespace-pre-wrap wrap-anywhere">{booking.notes}</p>
            </section>
          )}

          <footer className="flex justify-end">
            <AdminDeleteButton action={deleteBookingAction} id={booking._id} fields={{ returnTo: back }}
              label="Delete request" confirmText={`Delete the booking request from ${booking.name}?`} />
          </footer>
        </>
      ) : <h1 className="admin-page-title">Booking request not found</h1>}
    </div>
  );
}
