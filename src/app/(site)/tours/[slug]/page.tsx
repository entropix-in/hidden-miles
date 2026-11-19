import { PageContentBlocks, RichFieldText } from "@/components/site/page-content-blocks";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  Check,
  Clock,
  Download,
  Heart,
  MapPin,
  Minus,
  Mountain,
  Plane,
  Plus,
  Share2,
  Star,
  Sun,
  X,
} from "lucide-react";
import { BookingCard } from "@/components/site/booking-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ItineraryTimeline } from "@/components/site/itinerary-timeline";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard } from "@/components/site/tour-card";
import {
  loadDepartures,
  loadDestination,
  loadTestimonials,
  loadTour,
  loadTours,
} from "@/lib/content";
import { resolveTourCities } from "@/lib/tour-cities";
import { imageUrl } from "@/lib/utils";

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

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = await loadTour(slug);
  if (!tour) notFound();
  if (tour.slug !== slug) redirect(`/tours/${tour.slug}`);

  const [allTours, departures, destination, testimonials] = await Promise.all([
    loadTours(),
    loadDepartures(tour.slug),
    loadDestination(tour.destinationSlug),
    loadTestimonials(),
  ]);

  const related = allTours
    .filter(
      (candidate) =>
        candidate.slug !== tour.slug &&
        (candidate.destinationSlug === tour.destinationSlug ||
          candidate.region === tour.region),
    )
    .slice(0, 3);

  // Only photos of this tour's own destination, without repeats, so the gallery
  // never shows another place.
  const gallery = [
    tour.image,
    destination?.image,
    ...allTours
      .filter(
        (candidate) =>
          candidate.slug !== tour.slug &&
          candidate.destinationSlug === tour.destinationSlug,
      )
      .map((candidate) => candidate.image),
  ].filter(
    (image, index, all): image is string =>
      Boolean(image) && all.indexOf(image) === index,
  );
  const showMosaic = gallery.length >= 5;

  const quote =
    testimonials.find((item) => item.tour === tour.title) ?? testimonials[0];

  const tabs = [
    { label: "Overview", href: "#overview" },
    { label: "Itinerary", href: "#itinerary" },
    { label: "Inclusions", href: "#inclusions" },
    { label: "Dates & prices", href: "#book" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQs", href: "#faqs" },
  ];

  return (
    <>
      <section className="container-page pt-8 md:pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Group Tours", href: "/tours" },
            {
              label: tour.destinationName,
              href: `/destinations/${tour.destinationSlug}`,
            },
            { label: tour.title },
          ]}
        />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              {tour.badge ? (
                <span className="badge badge-gold">{tour.badge}</span>
              ) : null}
              <span className="badge badge-blue">{tour.region} group tour</span>
              <span className="badge badge-success">Family friendly</span>
            </div>
            <h1 className="type-h1 mt-4 text-ink">{tour.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-navy-700">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                <span className="font-bold text-ink">
                  {tour.rating.toFixed(1)}
                </span>
                <span className="text-navy-500">({tour.reviews} reviews)</span>
              </span>
              <span className="hidden text-sand-300 sm:inline">·</span>
              <span>
                {tour.days} days · {tour.nights} nights
              </span>
              <span className="hidden text-sand-300 sm:inline">·</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-navy-500" />
                {tour.destinationName} · {tour.groupSize}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button type="button" className="btn btn-light btn-sm">
              <Heart className="h-4 w-4" /> Save
            </button>
            <button type="button" className="btn btn-light btn-sm">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <a
              href={`/tours/${tour.slug}`}
              className="btn btn-light btn-sm"
              aria-label="Download brochure"
            >
              <Download className="h-4 w-4" /> Brochure
            </a>
          </div>
        </div>
      </section>

      <section className="container-page mt-8">
        <div
          className={showMosaic ? "grid gap-3 lg:grid-cols-[1.5fr_1fr]" : ""}
        >
          <div
            className={
              showMosaic
                ? "relative aspect-[708/480] overflow-hidden rounded-[28px] bg-ink"
                : "relative aspect-[16/9] overflow-hidden rounded-[28px] bg-ink lg:aspect-[21/8]"
            }
          >
            <Image
              src={imageUrl(gallery[0] ?? tour.image, 1600)}
              alt={tour.title}
              fill
              priority
              sizes={showMosaic ? "(max-width: 1024px) 100vw, 708px" : "100vw"}
              className="object-cover"
            />
          </div>

          {showMosaic ? (
            <div className="grid grid-cols-2 gap-3">
              {gallery.slice(1, 5).map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-[20px] bg-ink"
                >
                  <Image
                    src={imageUrl(image, 600)}
                    alt={`${tour.title} gallery ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 240px"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="container-page mt-14 pb-20 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_392px] lg:items-start">
          <main className="min-w-0">
            <nav className="-mx-5 flex overflow-x-auto whitespace-nowrap border-b border-sand-300 px-5 [mask-image:linear-gradient(to_right,black_80%,transparent)] [scrollbar-width:none] sm:mx-0 sm:px-0 sm:[mask-image:none]">
              {tabs.map((tab, index) => (
                <a
                  key={tab.label}
                  href={tab.href}
                  className={`relative px-4 py-3 text-sm font-bold transition ${
                    index === 0 ? "text-ink" : "text-navy-500 hover:text-ink"
                  }`}
                >
                  {tab.label}
                  {index === 0 ? (
                    <span className="absolute inset-x-4 -bottom-px h-[3px] rounded-full bg-gold-400" />
                  ) : null}
                </a>
              ))}
            </nav>

            <div className="mt-8 grid grid-cols-2 gap-0 rounded-[20px] border border-sand-300 bg-paper py-6 md:grid-cols-4">
              {[
                {
                  icon: Clock,
                  label: "Duration",
                  value: `${tour.days}D / ${tour.nights}N`,
                },
                { icon: Mountain, label: "Activity", value: "Moderate" },
                {
                  icon: Sun,
                  label: "Best time",
                  // Short month names keep this on one line, aligned with the other facts.
                  value: (destination?.bestTime.split("·")[0] ?? "Apr – Oct")
                    .trim()
                    .replace(/\b([A-Z][a-z]{2})[a-z]+\b/g, "$1")
                    .replace(" to ", " – "),
                },
                {
                  icon: Plane,
                  label: "Starts in",
                  value: tour.destinationName,
                },
              ].map((fact, index) => (
                <div
                  key={fact.label}
                  className={`flex items-center gap-3.5 px-5 ${
                    index ? "md:border-l md:border-sand-300" : ""
                  } ${index < 2 ? "border-b border-sand-300 pb-5 md:border-b-0 md:pb-0" : "pt-5 md:pt-0"}`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-sand-200 text-ink">
                    <fact.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="type-label block text-navy-500">
                      {fact.label}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold text-ink">
                      {fact.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <section id="overview" className="scroll-mt-32 pt-14">
              <h2 className="type-h3 text-ink">Why you&apos;ll love it</h2>
              <p className="type-body mt-3 text-navy-700"><RichFieldText editor={tour.richFields?.summary} fallback={tour.summary} /></p>
              <PageContentBlocks blocks={tour.contentBlocks} />

              <div className="mt-7 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {tour.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-600">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      <RichFieldText editor={tour.richFields?.highlights?.[index]} fallback={highlight} />
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section id="itinerary" className="scroll-mt-32 pt-16">
              <h2 className="type-h3 text-ink">Day by day</h2>
              <ItineraryTimeline days={tour.itinerary} />
            </section>

            <section id="inclusions" className="scroll-mt-32 pt-14">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[20px] border border-sand-300 bg-paper p-7">
                  <h2 className="type-title text-ink">What&apos;s included</h2>
                  <ul className="mt-4 space-y-3">
                    {tour.inclusions.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-sm leading-6 text-navy-700">
                          <RichFieldText editor={tour.richFields?.inclusions?.[index]} fallback={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-sand-300 bg-sand-100 p-7">
                  <h2 className="type-title text-ink">Not included</h2>
                  <ul className="mt-4 space-y-3">
                    {tour.exclusions.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
                          <X className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-sm leading-6 text-navy-700">
                          <RichFieldText editor={tour.richFields?.exclusions?.[index]} fallback={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {quote ? (
              <section id="reviews" className="scroll-mt-32 pt-14">
                <div className="on-ink relative overflow-hidden rounded-[24px] bg-ink p-8">
                  <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
                    <div>
                      <p className="type-h1 text-paper">4.9</p>
                      <p className="text-sm font-bold tracking-[0.1em] text-gold-400">
                        ★★★★★
                      </p>
                      <p className="mt-1 text-[13px] font-medium text-navy-200">
                        {tour.reviews} verified reviews
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-[19px] leading-[1.55] text-paper">
                        “<RichFieldText editor={quote.richFields?.quote} fallback={quote.quote} />”
                      </p>
                      <p className="mt-3 text-sm font-bold text-gold-400">
                        {quote.name} · {quote.city}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <section id="faqs" className="scroll-mt-32 pt-14">
              <h2 className="type-h3 text-ink">Good to know</h2>
              <div className="mt-6 border-t border-sand-300">
                {[
                  {
                    question: "What is the pace of this journey?",
                    answer:
                      "Moderately paced with a few early starts. Free time is built into every itinerary, and your leader will always share the plan the night before.",
                  },
                  {
                    question: "Who is this tour best for?",
                    answer:
                      "Families, couples, solo travellers and friend groups. If you can walk comfortably for an hour, you will love it.",
                  },
                  {
                    question: "Can you customise this itinerary?",
                    answer:
                      "Yes. We run private departures for groups of six or more — any date, any route, and we can add or remove days.",
                  },
                  {
                    question: "How do payments work?",
                    answer:
                      "Reserve with 25% today and pay the balance 30 days before departure. EMI options are available on major cards.",
                  },
                ].map((faq, index) => (
                  <details
                    key={faq.question}
                    open={index === 0}
                    className="group border-b border-sand-300 py-5"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                      <span className="type-title text-ink">
                        {faq.question}
                      </span>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand-200 text-ink transition group-open:bg-ink group-open:text-gold-400">
                        <Plus className="h-4 w-4 group-open:hidden" />
                      <Minus className="hidden h-4 w-4 group-open:block" />
                      </span>
                    </summary>
                    <p className="type-small mt-3 max-w-2xl text-navy-700">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </main>

          <aside id="book" className="scroll-mt-32 lg:sticky lg:top-32">
            <BookingCard
              tourSlug={tour.slug}
              basePrice={tour.price}
              oldPrice={tour.oldPrice}
              departures={departures}
              tourTitle={tour.title}
              cities={resolveTourCities(tour.departureCities)}
            />
          </aside>
        </div>
      </div>

      {related.length ? (
        <section className="bg-sand-100">
          <div className="container-page section-major">
            <SectionHeading
              label="You might also love"
              title="You might also like"
              href="/tours"
              linkLabel="View all tours"
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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
