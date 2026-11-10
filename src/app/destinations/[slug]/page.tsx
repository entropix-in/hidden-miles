import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DestinationCard } from "@/components/destination-card";
import { EnquiryForm } from "@/components/enquiry-form";
import { SectionHeading } from "@/components/section-heading";
import { TourCard } from "@/components/tour-card";
import {
  destinations,
  getDestination,
} from "@/data/destinations";
import { getToursByDestination } from "@/data/tours";
import { imageUrl } from "@/lib/utils";

export function generateStaticParams() {
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) return { title: "Destination not found" };

  return {
    title: `${destination.name} Holidays`,
    description: destination.description,
    openGraph: {
      title: `${destination.name} Holidays · Safarnest`,
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
  const destination = getDestination(slug);
  if (!destination) notFound();

  const destinationTours = getToursByDestination(destination.slug);
  const related = destinations
    .filter(
      (item) =>
        item.slug !== destination.slug && item.region === destination.region,
    )
    .slice(0, 3);

  return (
    <>
      <section className="relative isolate flex min-h-[500px] items-end overflow-hidden bg-forest-950">
        <Image
          src={imageUrl(destination.image, 1800)}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/50 to-forest-950/20" />
        <div className="container-page relative py-12">
          <Breadcrumbs
            light
            items={[
              { label: "Destinations", href: "/destinations" },
              { label: destination.name },
            ]}
          />
          <div className="animate-rise mt-6 max-w-3xl">
            <p className="eyebrow text-saffron-300">
              {destination.region} · Safarnest favourite
            </p>
            <h1 className="mt-3 font-display text-5xl font-medium leading-none tracking-tight text-cream-50 sm:text-6xl">
              {destination.name}
            </h1>
            <p className="mt-3 font-display text-xl font-medium text-saffron-200">
              {destination.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold text-cream-50 backdrop-blur">
                <MapPin className="h-3.5 w-3.5 text-saffron-300" />
                {destination.region}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold text-cream-50 backdrop-blur">
                <CalendarDays className="h-3.5 w-3.5 text-saffron-300" />
                Best time · {destination.bestTime}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold text-cream-50 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-saffron-300" />
                {destinationTours.length}{" "}
                {destinationTours.length === 1 ? "journey" : "journeys"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div>
          <p className="eyebrow">Why go</p>
          <h2 className="mt-2 font-display text-3xl font-medium text-forest-950">
            {destination.name}, in our words
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-stone-600">
            {destination.description}
          </p>
          <p className="mt-4 text-[15px] leading-8 text-stone-600">
            Our team has travelled these routes personally, stayed in the hotels
            we recommend and eaten at the little places you would otherwise walk
            past. Whether you have five days or fifteen, we will shape an
            itinerary that feels unhurried and entirely yours.
          </p>

          <h3 className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.2em] text-saffron-700">
            Do not miss
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {destination.highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5"
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest-600 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <p className="text-[13px] font-bold leading-5 text-forest-950">
                  {highlight}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] bg-forest-950 p-6 text-cream-50 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-saffron-300">Local expertise</p>
                <h3 className="mt-2 font-display text-2xl font-medium">
                  Travelling to {destination.name}? Let&apos;s talk dates.
                </h3>
              </div>
              <Link href="/contact" className="btn-light shrink-0">
                Ask an expert
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <EnquiryForm
            compact
            defaultDestination={destination.slug}
            className="border border-stone-200 shadow-xl shadow-forest-950/5"
          />
        </aside>
      </div>

      {destinationTours.length ? (
        <section className="bg-cream-100/70 py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="Ready when you are"
              title={`Journeys to ${destination.name}`}
              description="Every one of these departures is led by a Safarnest expert and includes the details that matter."
              href="/tours"
              linkLabel="All tours"
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinationTours.map((tour, index) => (
                <TourCard key={tour.slug} tour={tour} priority={index < 3} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="container-page py-16">
          <SectionHeading
            eyebrow="Keep exploring"
            title="More of the region"
            href="/destinations"
            linkLabel="All destinations"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <DestinationCard
                key={item.slug}
                destination={item}
                tourCount={getToursByDestination(item.slug).length}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="container-page py-16">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <Star className="h-4 w-4 text-saffron-500" />
            More destinations are being added every season.
          </div>
        </section>
      )}
    </>
  );
}
