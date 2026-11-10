import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, Globe2, MapPin } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { DestinationCard } from "@/components/destination-card";
import { destinations } from "@/data/destinations";
import { getToursByDestination } from "@/data/tours";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore Safarnest destinations across India and the world — from Kashmir and Kerala to Europe, Japan, Bali and the Maldives.",
};

export default function DestinationsPage() {
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
            <MapPin className="h-5 w-5 text-saffron-600" />
            <p className="mt-3 font-display text-3xl font-semibold text-forest-950">
              {destinations.length}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Destinations
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <Globe2 className="h-5 w-5 text-forest-600" />
            <p className="mt-3 font-display text-3xl font-semibold text-forest-950">
              2
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Continents
            </p>
          </div>
          <div className="col-span-2 rounded-2xl bg-forest-950 p-5 text-cream-50">
            <p className="flex items-center gap-2 text-[11px] font-bold text-cream-200/70">
              <Compass className="h-4 w-4 text-saffron-300" />
              Cannot decide? We will help.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-saffron-300 transition hover:text-saffron-200"
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
              tourCount={getToursByDestination(destination.slug).length}
              priority={index < 3}
            />
          ))}
        </div>
      </section>

      <section className="bg-cream-100/70 py-16">
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
                tourCount={getToursByDestination(destination.slug).length}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[30px] border border-stone-200 bg-white px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="eyebrow">Not on the list?</p>
            <h2 className="mt-2 font-display text-2xl font-medium text-forest-950 sm:text-3xl">
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
