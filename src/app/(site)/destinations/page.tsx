import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { DestinationCard } from "@/components/site/destination-card";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { loadDestinations, loadTours } from "@/lib/content";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore the places Hidden Miles knows by heart — from Kashmir and Kerala to Japan, Europe and the Maldives.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().toLowerCase() : "";

  const [destinations, tours] = await Promise.all([
    loadDestinations(),
    loadTours(),
  ]);

  const matches = query
    ? destinations.filter((destination) =>
        `${destination.name} ${destination.tagline} ${destination.region}`
          .toLowerCase()
          .includes(query),
      )
    : destinations;

  const india = matches.filter((destination) => destination.region === "India");
  const international = matches.filter(
    (destination) => destination.region === "International",
  );

  const countTours = (slug: string) =>
    tours.filter((tour) => tour.destinationSlug === slug).length;

  const heroImage =
    destinations.find((destination) => destination.slug === "ladakh")?.image ??
    destinations[0]?.image;

  const numberWords = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
    "Twenty",
  ];
  const destinationCount =
    numberWords[destinations.length] ?? String(destinations.length);

  return (
    <>
      <PageHero
        items={[{ label: "Home", href: "/" }, { label: "Destinations" }]}
        title={`${destinationCount} places`}
        accent="we know by heart."
        description="From houseboats in Srinagar to overwater villas in the Maldives — pick a place, and we'll handle everything else."
        image={heroImage ?? ""}
        imageAlt="A Himalayan landscape"
        coords="LADAKH · 34.15° N  77.58° E"
      >
        <form
          action="/destinations"
          className="flex w-full max-w-[460px] items-center gap-3 rounded-full border-[1.5px] border-sand-300 bg-paper px-5 py-3.5"
        >
          <Search className="h-5 w-5 text-navy-500" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search a destination…"
            aria-label="Search a destination"
            className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-navy-400"
          />
          <button type="submit" className="text-sm font-bold text-blue-700">
            Search
          </button>
        </form>
      </PageHero>

      <section className="container-page pb-16 md:pb-24">
        <SectionHeading
          number="01"
          label="India"
          title="Across"
          accent="India."
          right={
            <span className="text-sm font-bold text-blue-700">
              Showing {india.length} of {destinations.filter((item) => item.region === "India").length} · View all →
            </span>
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {india.map((destination) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              tourCount={countTours(destination.slug)}
              className="min-h-[440px]"
            />
          ))}
        </div>
        {!india.length ? (
          <p className="type-body mt-8 rounded-[20px] border border-dashed border-sand-300 p-8 text-center text-navy-500">
            No Indian destinations match “{query}”. Try another name.
          </p>
        ) : null}
      </section>

      <section className="bg-sand-100">
        <div className="container-page section-major">
          <SectionHeading
            number="02"
            label="International"
            title="Around"
            accent="the world."
            right={
              <span className="text-sm font-bold text-blue-700">
                Showing {international.length} of{" "}
                {destinations.filter((item) => item.region === "International").length} · View all →
              </span>
            }
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {international.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                tourCount={countTours(destination.slug)}
                className="min-h-[440px]"
              />
            ))}
          </div>
          {!international.length ? (
            <p className="type-body mt-8 rounded-[20px] border border-dashed border-sand-300 p-8 text-center text-navy-500">
              No international destinations match “{query}”. Try another name.
            </p>
          ) : null}
          <div className="mt-10 flex justify-center">
            <Link href="/tours" className="btn btn-outline">
              Browse all tours
              <span className="btn-dot">→</span>
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Two places,"
        accent="one seamless trip."
        description="Combine destinations into a single itinerary — we'll plan the flights, transfers and pacing so it feels effortless."
      />
    </>
  );
}
