import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Compass,
  Mail,
  Phone,
  Settings,
  Ticket,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/lib/user-actions";
import { requireUser } from "@/lib/user-auth";
import { loadTours, loadUserBookings } from "@/lib/content";
import { bookingStatusLabels } from "@/lib/booking-status";
import type { BookingStatus } from "@/lib/types";
import { formatINR, imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const statusStyles: Record<BookingStatus, string> = {
  pending: "badge badge-gold",
  confirmed: "badge badge-success",
  cancelled: "badge badge-danger",
};

function formatDate(value?: string) {
  if (!value) return "Date to be confirmed";
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [bookings, tours] = await Promise.all([
    loadUserBookings(user.id),
    loadTours(),
  ]);
  const toursBySlug = new Map(tours.map((tour) => [tour.slug, tour]));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter(
    (booking) => booking.status !== "cancelled" && (!booking.startDate || booking.startDate >= today),
  );
  const past = bookings.filter((booking) => !upcoming.includes(booking));
  const firstName = user.name.split(" ")[0] || "traveller";

  return (
    <div className="bg-sand-100">
      <div className="on-ink bg-ink">
        <div className="container-page py-10 md:py-14">
          <p className="type-label text-gold-400">My account</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="type-h1 text-[clamp(1.75rem,3vw,2.5rem)] text-paper">Hello, {firstName}.</h1>
              <p className="type-body mt-2 max-w-xl text-navy-200">
                Your tours, traveller details and trip updates — all in one
                place.
              </p>
            </div>
            <Link href="/tours" className="btn btn-primary btn-lg">
              <Compass className="h-4 w-4" />
              Book another tour
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Upcoming trips", String(upcoming.length)],
              ["Total bookings", String(bookings.length)],
              ["Member since", monthFormatter.format(user.createdAt)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[16px] border border-white/10 bg-white/5 px-5 py-4"
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-navy-300">
                  {label}
                </p>
                <p className="mt-1 truncate text-xl font-extrabold tracking-[-0.02em] text-paper">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <section aria-labelledby="my-trips">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="my-trips" className="type-h3 text-ink">
              My trips
            </h2>
            <span className="text-[13px] font-semibold text-navy-500">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="mt-4 rounded-[24px] border border-dashed border-sand-300 bg-paper px-6 py-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-100 text-ink">
                <Ticket className="h-6 w-6" />
              </span>
              <h3 className="type-h4 mt-4 text-ink">No trips yet</h3>
              <p className="type-small mx-auto mt-2 max-w-md text-navy-600">
                Pick a departure, reserve your seats and your booking will show
                up right here.
              </p>
              <Link href="/tours" className="btn btn-primary mt-6">
                Explore group tours
                <span className="btn-dot">→</span>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {[...upcoming, ...past].map((booking) => {
                const tour = toursBySlug.get(booking.tourSlug);
                const image = tour?.image;
                return (
                  <article
                    key={booking._id}
                    className="overflow-hidden rounded-[24px] border border-sand-300 bg-paper"
                  >
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                      <div className="relative h-[92px] w-full shrink-0 overflow-hidden rounded-[16px] bg-ink sm:h-[92px] sm:w-[132px]">
                        {image ? (
                          <Image
                            src={imageUrl(image, 500)}
                            alt={booking.tourTitle || tour?.title || "Tour"}
                            fill
                            sizes="132px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={statusStyles[booking.status]}>
                            {bookingStatusLabels[booking.status]}
                          </span>
                          <span className="text-[12px] font-semibold text-navy-500">
                            Ref HM-{booking._id.padStart(5, "0")}
                          </span>
                        </div>
                        <h3 className="type-h4 mt-2 truncate text-ink">
                          {booking.tourTitle || tour?.title || booking.tourSlug}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] font-medium text-navy-700">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-navy-500" />
                            {formatDate(booking.startDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="h-3.5 w-3.5 text-navy-500" />
                            {booking.travellers}{" "}
                            {booking.travellers === 1 ? "traveller" : "travellers"}
                          </span>
                          <span className="font-bold text-ink">
                            {formatINR(booking.amount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                          href={`/tours/${booking.tourSlug}`}
                          className="btn btn-outline btn-sm"
                        >
                          View tour
                          <span className="btn-dot">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[24px] border border-sand-300 bg-paper p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-lg font-extrabold uppercase text-gold-400">
                {user.name.slice(0, 1) || "H"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                <p className="text-[12px] font-medium text-navy-500">
                  Member since {monthFormatter.format(user.createdAt)}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 border-t border-sand-300 pt-5">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
                <div className="min-w-0">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-navy-500">
                    Email
                  </dt>
                  <dd className="break-all text-sm font-semibold text-ink">
                    {user.email}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-navy-500">
                    Phone
                  </dt>
                  <dd className="text-sm font-semibold text-ink">
                    {user.phone || "Not added"}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-5 grid gap-2">
              <Link href="/account/settings" className="btn btn-ink w-full">
                <Settings className="h-4 w-4" aria-hidden />
                Account settings
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn btn-outline w-full">
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-[24px] border border-sand-300 bg-paper p-6">
            <p className="type-label text-gold-600">Need a hand?</p>
            <p className="type-small mt-2 text-navy-700">
              Plans changed or have a question about a booking? Talk to a real
              traveller, not a bot.
            </p>
            <Link href="/contact" className="btn btn-ink mt-4 w-full">
              Contact the team
              <span className="btn-dot">→</span>
            </Link>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}
