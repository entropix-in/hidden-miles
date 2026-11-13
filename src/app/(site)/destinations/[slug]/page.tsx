import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, IndianRupee, Plane, Sun } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { DestinationCard } from "@/components/site/destination-card";
import { Kicker, SectionHeading } from "@/components/site/section-heading";
import { Stamp } from "@/components/site/stamp";
import { TourCard } from "@/components/site/tour-card";
import { coordsFor } from "@/data/coordinates";
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
    { icon: Sun, label: "Best time", value: destination.bestTime.split("·")[0] },
    { icon: Clock, label: "Ideal trip", value: "6 – 8 days" },
    { icon: Plane, label: "Fly into", value: `${destination.name}` },
    { icon: IndianRupee, label: "Tours from", value: `${formatINR(fromPrice)} pp` },
  ];

  return (
    <>
      <section className="container-page py-6">
        <div className="relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden rounded-[36px] bg-ink p-7 pb-10 sm:p-10 lg:min-h-[640px] lg:p-12">
          <Image
            src={imageUrl(destination.image, 2000)}
            alt={destination.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/35 to-ink/30" />

          <div className="relative flex items-start justify-between gap-4">
            <Breadcrumbs
              dark
              items={[
                { label: "Home", href: "/" },
                { label: "Destinations", href: "/destinations" },
                { label: destination.name },
              ]}
            />
            <span className="coord coord-dark hidden sm:block">
              {coordsFor(destination.slug)}
            </span>
          </div>

          <div className="relative mt-auto max-w-[900px] pt-16">
            <Kicker label={destination.tagline} dark />
            <h1 className="mt-4 font-display text-[clamp(4rem,10vw,7.5rem)] leading-[0.96] tracking-[-0.045em] text-paper">
              {destination.name}
            </h1>
            <p className="type-lead mt-4 max-w-[620px] text-navy-200">
              {destination.description}
            </p>
          </div>

          <span className="absolute bottom-10 right-10 hidden lg:block">
            <Stamp size={140} />
          </span>
        </div>
      </section>

      <section className="container-page">
        <div className="grid gap-0 rounded-[20px] border border-sand-300 bg-paper px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={`flex items-center gap-3.5 px-5 ${
                index ? "lg:border-l lg:border-sand-300" : ""
              } ${index < 2 ? "border-b border-sand-300 pb-5 sm:border-b-0 sm:pb-0" : ""} ${index === 2 ? "pt-5 sm:pt-0" : ""}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-sand-200 text-ink">
                <fact.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="type-label block text-[10px] text-navy-500">
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
        <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-24">
          <div>
            <Kicker number="01" label={`About ${destination.name}`} />
            <h2 className="type-h2 mt-5 text-ink">
              Slow mornings,
              <br />
              <span className="accent-line">beautiful days.</span>
            </h2>
            <p className="type-lead mt-6 text-navy-700">{destination.description}</p>
            <p className="type-body mt-5 text-navy-700">
              Our {destination.name} journeys are paced for first-timers and
              families: comfortable stays, short drives and a tour leader who
              knows every trail. Pair it with another region for a longer circuit,
              or let us build a private departure around your dates.
            </p>
            <Link href="/contact" className="btn btn-outline mt-7">
              Plan a private {destination.name} trip
              <span className="btn-dot">→</span>
            </Link>
          </div>

          <div>
            {destination.highlights.map((highlight, index) => (
              <div
                key={highlight}
                className={`flex items-center gap-6 py-6 ${
                  index ? "border-t border-sand-300" : ""
                }`}
              >
                <span className="font-display text-3xl italic text-gold-600">
                  0{index + 1}
                </span>
                <span>
                  <span className="type-title block text-ink">{highlight}</span>
                  <span className="type-small mt-1 block text-navy-500">
                    Handpicked by our {destination.name} specialists
                  </span>
                </span>
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
              title={destination.name}
              accent="tours."
              right={
                <div className="flex flex-wrap gap-2">
                  {["All", "Group", "Family", "Honeymoon"].map((filter, index) => (
                    <span
                      key={filter}
                      className={`chip ${index === 0 ? "chip-active" : ""}`}
                    >
                      {filter}
                    </span>
                  ))}
                </div>
              }
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {destinationTours.slice(0, 3).map((tour, index) => (
                <TourCard key={tour.slug} tour={tour} priority={index === 0} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href={`/tours?destination=${destination.slug}`}
                className="btn btn-outline"
              >
                View all {destinationTours.length} tours
                <span className="btn-dot">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="container-page section-major">
          <SectionHeading
            number="03"
            label="Combine it with"
            title="Nearby"
            accent="destinations."
            href="/destinations"
            linkLabel="All destinations"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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
