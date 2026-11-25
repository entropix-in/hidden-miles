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

// Pick a grid that always ends on a full row: three columns when the count
// divides by three; otherwise four columns with a double-width lead card when
// that fills the rows exactly (e.g. 7 = 2 + 1 + 1, then 4); else widen the
// first (and if needed last) card in three columns.
function gridLayout(total: number) {
  if (total % 3 === 0 || total < 3) {
    return { grid: "lg:grid-cols-3", span: () => "" };
  }
  if ((total + 1) % 4 === 0) {
    return {
      grid: "lg:grid-cols-4",
      span: (index: number) => (index === 0 ? " lg:col-span-2" : ""),
    };
  }
  const remainder = total % 3;
  return {
    grid: "lg:grid-cols-3",
    span: (index: number) =>
      index === 0 || (remainder === 1 && index === total - 1) ? " lg:col-span-2" : "",
  };
}

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

  const indiaGrid = gridLayout(india.length);
  const internationalGrid = gridLayout(international.length);

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

        image={heroImage ?? ""}
        imageAlt="A Himalayan landscape"
      >
        <form
          action="/destinations"
          className="flex w-full max-w-[460px] items-center gap-3 rounded-full border-[1.5px] border-sand-300 bg-paper py-1 pl-5 pr-1.5"
        >
          <Search className="h-5 w-5 text-navy-500" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search a destination…"
            aria-label="Search a destination"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-navy-500"
          />
          <button type="submit" className="inline-flex h-9 items-center px-3 text-sm font-semibold text-blue-700">
            Search
          </button>
        </form>
      </PageHero>

      <section className="container-page pb-12 md:pb-16">
        <SectionHeading
          number="01"
          label="India"
          title="India"
        />
        <div className={`mt-8 grid gap-6 sm:grid-cols-2 ${indiaGrid.grid}`}>
          {india.map((destination, index) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              tourCount={countTours(destination.slug)}
              className={`min-h-[380px]${indiaGrid.span(index)}`}
            />
          ))}
        </div>
        {!india.length ? (
          <p className="type-body mt-6 rounded-[20px] border border-dashed border-sand-300 p-7 text-center text-navy-500">
            No Indian destinations match “{query}”. Try another name.
          </p>
        ) : null}
      </section>

      <section className="bg-sand-100">
        <div className="container-page section-major">
          <SectionHeading
            number="02"
            label="International"
            title="International"
          />
          <div className={`mt-8 grid gap-6 sm:grid-cols-2 ${internationalGrid.grid}`}>
            {international.map((destination, index) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                tourCount={countTours(destination.slug)}
                className={`min-h-[380px]${internationalGrid.span(index)}`}
              />
            ))}
          </div>
          {!international.length ? (
            <p className="type-body mt-6 rounded-[20px] border border-dashed border-sand-300 p-7 text-center text-navy-500">
              No international destinations match “{query}”. Try another name.
            </p>
          ) : null}
          <div className="mt-8 flex justify-center">
            <Link href="/tours" className="btn btn-outline">
              Browse all tours
              <span className="btn-dot">→</span>
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        className="pt-12 md:pt-14"
        title="Two places,"
        accent="one connected trip"
        description="Combine destinations into one itinerary."
      />
    </>
  );
}
