import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, Globe2, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { DestinationCard } from "@/components/site/destination-card";
import { loadDestinations, loadTours } from "@/lib/content";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore Hidden Miles destinations across India and the world — from Kashmir and Kerala to Europe, Japan, Bali and the Maldives.",
};

export const dynamic = "force-dynamic";

export default async function DestinationsPage() {
  const [destinations, tours] = await Promise.all([
    loadDestinations(),
    loadTours(),
  ]);
  const india = destinations.filter((item) => item.region === "India");
  const international = destinations.filter(
    (item) => item.region === "International",
  );

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="A world of places, a thousand ways to see them."
        description="Start with a destination you have been dreaming about. We will take care of the route, the stays, the little local secrets and everything in between."
        breadcrumbs={[{ label: "Destinations" }]}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <MapPin className="h-5 w-5 text-blue-600" />
            <p className="mt-3 font-display text-3xl font-semibold text-navy-950">
              {destinations.length}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Destinations
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <Globe2 className="h-5 w-5 text-navy-600" />
            <p className="mt-3 font-display text-3xl font-semibold text-navy-950">
              2
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Continents
            </p>
          </div>
          <div className="col-span-2 rounded-2xl bg-navy-950 p-5 text-sand-50">
            <p className="flex items-center gap-2 text-[11px] font-bold text-sand-200/70">
              <Compass className="h-4 w-4 text-blue-300" />
              Cannot decide? We will help.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-300 transition hover:text-blue-200"
            >
              Talk to an expert
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </PageHero>

      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Closer to home"
          title="India, beautifully"
          description="Himalayan escapes, southern backwaters, desert palaces and island shores. There is always another India waiting."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {india.map((destination, index) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              tourCount={tours.filter((tour) => tour.destinationSlug === destination.slug).length}
              priority={index < 3}
            />
          ))}
        </div>
      </section>

      <section className="bg-sand-100/70 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Across the world"
            title="International favourites"
            description="From the canals of Europe to the islands of the Indian Ocean, these are the journeys our travellers ask for again and again."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {international.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                tourCount={tours.filter((tour) => tour.destinationSlug === destination.slug).length}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[30px] border border-stone-200 bg-white px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="eyebrow">Not on the list?</p>
            <h2 className="mt-2 font-display text-2xl font-medium text-navy-950 sm:text-3xl">
              Tell us where you want to go. We will make it happen.
            </h2>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Start planning
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
