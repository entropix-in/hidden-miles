import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
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

  return (
    <>
      <section className="container-page pt-8 md:pt-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Group Tours" }]} />
        <h1 className="type-h1 mt-4 text-ink">Group Tours</h1>
      </section>

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
