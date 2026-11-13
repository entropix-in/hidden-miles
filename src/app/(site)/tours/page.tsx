import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ToursExplorer } from "@/components/site/tours-explorer";
import { loadDestinations, loadExperiences, loadTours } from "@/lib/content";

export const metadata: Metadata = {
  title: "Group Tours",
  description:
    "Browse Hidden Miles group tours, family holidays, honeymoons and adventure journeys across India and the world. Transparent pricing, expert tour leaders and thoughtfully planned itineraries.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export default async function ToursPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const destination =
    typeof params.destination === "string" ? params.destination : "";
  const experience =
    typeof params.experience === "string" ? params.experience : "";
  const month = typeof params.month === "string" ? params.month : "";
  const query = typeof params.q === "string" ? params.q : "";
  const priceParam = typeof params.price === "string" ? params.price : "";
  const initialPriceMax =
    priceParam === "under50"
      ? 49999
      : priceParam === "50to100"
        ? 100000
        : priceParam === "100to200"
          ? 200000
          : 300000;
  const initialRegion =
    params.region === "India" || params.region === "International"
      ? params.region
      : "All";

  const [tours, destinations, experiences] = await Promise.all([
    loadTours(),
    loadDestinations(),
    loadExperiences(),
  ]);

  const heroImage =
    destinations.find((item) => item.slug === "ladakh")?.image ??
    tours[0]?.image ??
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2";

  return (
    <>
      <PageHero
        items={[{ label: "Home", href: "/" }, { label: "Group Tours" }]}
        title="Every departure,"
        accent="in one place."
        description={`${tours.length} escorted group tours across India and the world. All-inclusive, small groups, a tour leader from day one.`}
        image={heroImage}
        imageAlt="A Himalayan road trip"
        coords="LADAKH · 34.15° N  77.58° E"
      >
        <div className="flex flex-wrap gap-8 sm:gap-12">
          {[
            { value: String(tours.length), label: "tours" },
            { value: String(tours.length * 4), label: "departures" },
            { value: "4.9★", label: "average rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="type-h3 text-ink">{stat.value}</p>
              <p className="type-small mt-1 text-navy-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <ToursExplorer
        tours={tours}
        destinations={destinations}
        experiences={experiences}
        initialDestination={destination}
        initialExperience={experience}
        initialMonth={month}
        initialRegion={initialRegion}
        initialQuery={query}
        initialPriceMax={initialPriceMax}
      />
    </>
  );
}
