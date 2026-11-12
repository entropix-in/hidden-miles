import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock,
  Globe2,
  IndianRupee,
  Info,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { ItineraryTimeline } from "@/components/site/itinerary-timeline";
import { TourBooking } from "@/components/site/tour-booking";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard } from "@/components/site/tour-card";
import {
  loadDepartures,
  loadDestinations,
  loadTour,
  loadTours,
} from "@/lib/content";
import { site } from "@/data/site";
import { formatINR, imageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await loadTour(slug);
  if (!tour) return { title: "Tour not found" };

  return {
    title: tour.title,
    description: tour.summary,
    openGraph: {
      title: `${tour.title} · Hidden Miles`,
      description: tour.summary,
      images: [imageUrl(tour.image, 1200)],
    },
  };
}

const departureDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDepartureDate(value: string) {
  return departureDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

const goodToKnow = [
  {
    icon: Clock,
    title: "Pace & comfort",
    text: "Moderately paced with some early starts. Free time is built into every itinerary.",
  },
  {
    icon: Users,
    title: "Who it suits",
    text: "Families, couples, solo travellers and friend groups — everyone is welcome.",
  },
  {
    icon: Globe2,
    title: "Visas & documents",
    text: "Visa support is included for international tours where mentioned in inclusions.",
  },
  {
    icon: ShieldCheck,
    title: "Flexible on the ground",
    text: "Weather or local conditions may reorder activities. Your leader will keep you informed.",
  },
];

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = await loadTour(slug);
  if (!tour) notFound();

  const [allTours, allDestinations, departures] = await Promise.all([
    loadTours(),
    loadDestinations(),
    loadDepartures(tour.slug),
  ]);
  const related = allTours
    .filter(
      (candidate) =>
        candidate.slug !== tour.slug &&
        (candidate.destinationSlug === tour.destinationSlug ||
          candidate.region === tour.region),
    )
    .slice(0, 3);
  const nextDeparture = departures[0];
  const fromPrice = departures.length
    ? Math.min(...departures.map((departure) => departure.price))
    : tour.price;
  const emi = Math.round(fromPrice / 12);
  const nextDepartureLabel = nextDeparture
    ? formatDepartureDate(nextDeparture.startDate)
    : tour.departure;

  return (
    <>
      <section className="border-b border-stone-200/80 bg-sand-100">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Tour packages", href: "/tours" },
              { label: tour.title },
            ]}
          />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-blue-800">
              {tour.region}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-stone-600">
              {tour.nights} nights · {tour.days} days
            </span>
            {tour.badge ? (
              <span className="rounded-full bg-navy-950 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-blue-300">
                {tour.badge}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <h1 className="font-display text-4xl font-medium leading-[1.06] tracking-tight text-navy-950 sm:text-5xl">
                {tour.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-stone-600">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {tour.destinationName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  {nextDepartureLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  {tour.groupSize}
                </span>
                <span className="inline-flex items-center gap-1 text-navy-950">
                  <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                  {tour.rating.toFixed(1)}
                  <span className="font-semibold text-stone-400">
                    ({tour.reviews} reviews)
                  </span>
                </span>
              </div>
            </div>
            <div className="lg:justify-self-end lg:text-right">
              <p className="max-w-xl text-[14px] leading-7 text-stone-600">
                {tour.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 lg:justify-end">
                <Link href="#book" className="btn-primary">
                  Book now
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <span className="rounded-full bg-white px-3 py-2 text-sm font-extrabold uppercase tracking-wider text-stone-600">
                  From {formatINR(fromPrice)} pp
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-[32px] shadow-2xl shadow-navy-950/15 sm:aspect-[16/7]">
            <Image
              src={imageUrl(tour.image, 1800)}
              alt={tour.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/95 px-4 py-2 text-sm font-extrabold text-navy-950 backdrop-blur">
                Next departure · {nextDepartureLabel}
              </span>
              <span className="rounded-full bg-navy-950/70 px-4 py-2 text-sm font-extrabold text-sand-50 backdrop-blur">
                {tour.groupSize}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="min-w-0 space-y-12">
          <section>
            <p className="eyebrow">The journey</p>
            <h2 className="mt-2 font-display text-3xl font-medium text-navy-950">
              A closer look
            </h2>
            <div className="prose-narrow mt-5 space-y-4">
              <p>{tour.summary}</p>
              <p>
                This journey is led end to end by a Hidden Miles tour leader, with
                handpicked stays, comfortable transport and a pace that leaves
                room to actually enjoy the places you came to see. Everything
                listed as included is arranged and paid for before you leave
                home — you just show up.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {tour.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <p className="text-sm font-bold leading-5 text-navy-950">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="eyebrow">Day by day</p>
            <h2 className="mt-2 font-display text-3xl font-medium text-navy-950">
              Your itinerary
            </h2>
            <div className="mt-6">
              <ItineraryTimeline days={tour.itinerary} />
            </div>
          </section>

          <TourBooking
            tourSlug={tour.slug}
            tourTitle={tour.title}
            basePrice={tour.price}
            nights={tour.nights}
            departures={departures}
          />

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-navy-200 bg-navy-50 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-navy-950">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-navy-600 text-white">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                What&apos;s included
              </h2>
              <ul className="mt-4 space-y-2.5">
                {tour.inclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-5 text-stone-600"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-sand-100/70 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-navy-950">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-stone-300 text-white">
                  <X className="h-4 w-4" strokeWidth={3} />
                </span>
                Not included
              </h2>
              <ul className="mt-4 space-y-2.5">
                {tour.exclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-5 text-stone-600"
                  >
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <p className="eyebrow">Before you go</p>
            <h2 className="mt-2 font-display text-3xl font-medium text-navy-950">
              Good to know
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {goodToKnow.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-sand-200 text-blue-700">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-sm font-extrabold text-navy-950">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-stone-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-xl shadow-navy-950/5">
            <div className="bg-navy-950 px-6 py-5 text-sand-50">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-300">
                All-inclusive from
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <p className="font-display text-4xl font-semibold">
                  {formatINR(fromPrice)}
                </p>
                {tour.oldPrice ? (
                  <p className="text-sm font-semibold text-sand-200/50 line-through">
                    {formatINR(tour.oldPrice)}
                  </p>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-semibold text-sand-200/60">
                per person on twin sharing · EMI from {formatINR(emi)}/month
              </p>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between text-sm font-semibold text-stone-600">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  Departure
                </span>
                <span className="font-bold text-navy-950">{nextDepartureLabel}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-stone-600">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Duration
                </span>
                <span className="font-bold text-navy-950">
                  {tour.nights}N / {tour.days}D
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-stone-600">
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Group size
                </span>
                <span className="font-bold text-navy-950">{tour.groupSize}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-stone-600">
                <span className="inline-flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                  Booking deposit
                </span>
                <span className="font-bold text-navy-950">
                  {formatINR(Math.round(fromPrice * 0.25))}
                </span>
              </div>

              {departures.length ? (
                <div className="rounded-2xl border border-stone-200 bg-sand-50 p-3">
                  <p className="text-sm font-extrabold uppercase tracking-wider text-stone-500">
                    Available dates
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {departures.slice(0, 4).map((departure) => (
                      <Link
                        key={departure._id}
                        href="#book"
                        className="flex items-center justify-between gap-2 text-sm font-semibold text-stone-600 transition hover:text-blue-700"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                          {formatDepartureDate(departure.startDate)}
                        </span>
                        <span className="font-bold text-navy-950">
                          {formatINR(departure.price)}
                        </span>
                      </Link>
                    ))}
                  </div>
                  {departures.length > 4 ? (
                    <p className="mt-2 text-sm font-semibold text-stone-400">
                      +{departures.length - 4} more dates
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-2 pt-2">
                <Link href="#book" className="btn-primary w-full">
                  Book now
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a
                  href={site.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center justify-center gap-2 pt-1 text-sm font-extrabold text-navy-950 transition hover:text-blue-700"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {site.phone}
                </a>
                <Link
                  href="#enquiry"
                  className="text-center text-sm font-bold text-stone-500 underline decoration-dotted underline-offset-4 transition hover:text-blue-700"
                >
                  Have a question? Send an enquiry
                </Link>
              </div>

              <div className="rounded-2xl bg-sand-100 p-3 text-sm leading-5 text-stone-500">
                <p className="flex items-start gap-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  Prices are per person on twin sharing. Solo travellers and
                  single supplements quoted on request.
                </p>
              </div>
            </div>
          </div>

          <div id="enquiry" className="scroll-mt-28">
            <EnquiryForm
              compact
              defaultDestination={tour.destinationSlug}
              tourTitle={tour.title}
              destinations={allDestinations}
              className="border border-stone-200 shadow-xl shadow-navy-950/5"
            />
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="bg-sand-100/70 py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="You might also love"
              title="More journeys to inspire you"
              href="/tours"
              linkLabel="All tours"
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <TourCard key={item.slug} tour={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
