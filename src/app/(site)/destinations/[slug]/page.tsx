import { PageContentBlocks, RichFieldText } from "@/components/site/page-content-blocks";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock, IndianRupee, Plane, Sun } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { DestinationCard } from "@/components/site/destination-card";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard, TourListCard } from "@/components/site/tour-card";
import {
  loadDestination,
  loadDestinations,
  loadTours,
} from "@/lib/content";
import { formatINR, imageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await loadDestination(slug);
  if (!destination) return { title: "Destination not found" };

  return {
    title: `${destination.name} Holidays`,
    description: destination.description,
    openGraph: {
      title: `${destination.name} Holidays · Hidden Miles`,
      description: destination.description,
      images: [imageUrl(destination.image, 1200)],
    },
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await loadDestination(slug);
  if (!destination) notFound();
  if (destination.slug !== slug) redirect(`/destinations/${destination.slug}`);

  const [allDestinations, allTours] = await Promise.all([
    loadDestinations(),
    loadTours(),
  ]);
  const destinationTours = allTours.filter(
    (tour) => tour.destinationSlug === destination.slug,
  );
  const related = allDestinations
    .filter(
      (item) =>
        item.slug !== destination.slug && item.region === destination.region,
    )
    .slice(0, 3);
  const fromPrice = destinationTours.length
    ? Math.min(...destinationTours.map((tour) => tour.price))
    : 38900;

  const facts = [
    {
      icon: Sun,
      label: "Best time",
      // Short month names ("Oct – Apr") keep the fact strip on one line.
      value: destination.bestTime
        .split("·")[0]
        .trim()
        .replace(/\b([A-Z][a-z]{2})[a-z]+\b/g, "$1")
        .replace(" to ", " – "),
    },
    { icon: Clock, label: "Ideal trip", value: "6 – 8 days" },
    { icon: Plane, label: "Region", value: destination.region },
    { icon: IndianRupee, label: "Price from", value: formatINR(fromPrice) },
  ];

  return (
    <>
      <section className="container-page py-6">
        <div className="relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink p-7 pb-9 sm:p-10 lg:min-h-[480px]">
          <Image
            src={imageUrl(destination.image, 2000)}
            alt={destination.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-ink/60" />

          <div className="relative flex items-start justify-between gap-4">
            <Breadcrumbs
              dark
              items={[
                { label: "Home", href: "/" },
                { label: "Destinations", href: "/destinations" },
                { label: destination.name },
              ]}
            />
          </div>

          <div className="relative mt-auto max-w-[900px] pt-16">
            <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.045em] text-paper">
              {destination.name}
            </h1>
            <p className="type-lead mt-3 max-w-[620px] text-navy-200">
              {destination.tagline}
            </p>
          </div>

        </div>
      </section>

      <section className="container-page">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-[20px] border border-sand-300 bg-paper p-5 lg:grid-cols-4 lg:gap-0 lg:px-4 lg:py-6">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={`flex min-w-0 items-center gap-3 lg:px-5 ${
                index ? "lg:border-l lg:border-sand-300" : ""
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-sand-200 text-ink lg:h-12 lg:w-12 lg:rounded-[14px]">
                <fact.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-medium text-navy-500">
                  {fact.label}
                </span>
                <span className="mt-0.5 block text-sm font-bold text-ink">
                  {fact.value}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page section-minor">
        <div className="grid gap-12 lg:grid-cols-[1fr_440px] lg:gap-20">
          <div>
            <h2 className="type-h2 text-ink">About {destination.name}</h2>
            <p className="type-lead mt-4 text-navy-700"><RichFieldText editor={destination.richFields?.description} fallback={destination.description} /></p>
            <PageContentBlocks blocks={destination.contentBlocks} />
            <Link href="/contact" className="btn btn-outline mt-7">
              Plan a private {destination.name} trip
              <span className="btn-dot">→</span>
            </Link>
          </div>

          <div>
            {destination.highlights.map((highlight, index) => (
              <div
                key={index}
                className={`flex items-center gap-5 py-5 ${
                  index ? "border-t border-sand-300" : ""
                }`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand-200 text-sm font-bold text-ink">
                  {index + 1}
                </span>
                <span className="type-title text-ink"><RichFieldText editor={destination.richFields?.highlights?.[index]} fallback={highlight} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {destinationTours.length ? (
        <section className="bg-sand-100">
          <div className="container-page section-major">
            <SectionHeading
              number="02"
              label={`${destinationTours.length} departures`}
              title={`${destination.name} tours`}
            />
            {destinationTours.length < 3 ? (
              // One or two tours read better as wide cards than a half-empty grid.
              <div className="mt-10 grid gap-6">
                {destinationTours.map((tour, index) => (
                  <TourListCard key={tour.slug} tour={tour} priority={index === 0} />
                ))}
              </div>
            ) : (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {destinationTours.slice(0, 3).map((tour, index) => (
                  <TourCard key={tour.slug} tour={tour} priority={index === 0} />
                ))}
              </div>
            )}
            {destinationTours.length > 3 ? (
            <div className="mt-10 flex justify-center">
              <Link
                href={`/tours?destination=${destination.slug}`}
                className="btn btn-outline"
              >
                View all {destinationTours.length} tours
                <span className="btn-dot">→</span>
              </Link>
            </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="container-page section-major">
          <SectionHeading
            number="03"
            label="Combine it with"
            title="More destinations"
            href="/destinations"
            linkLabel="All destinations"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <DestinationCard
                key={item.slug}
                destination={item}
                tourCount={allTours.filter((tour) => tour.destinationSlug === item.slug).length}
                className="min-h-[360px]"
              />
            ))}
          </div>
        </section>
      ) : null}

      <CtaBand
        title={`${destination.name},`}
        accent="your way."
        description="Private departures, honeymoon stays or a family trip with grandparents — tailored within 24 hours."
        image={destination.image}
        imageAlt={destination.name}
      />
    </>
  );
}
