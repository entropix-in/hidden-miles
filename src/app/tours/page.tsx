import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { ToursExplorer } from "@/components/tours-explorer";
import { destinations } from "@/data/destinations";
import { tours } from "@/data/tours";

export const metadata: Metadata = {
  title: "Tour Packages",
  description:
    "Browse Safarnest group tours, family holidays, honeymoons and adventure journeys across India and the world. Transparent pricing, expert tour leaders and thoughtfully planned itineraries.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

  return (
    <>
      <PageHero
        eyebrow="Tour packages"
        title="Journeys worth clearing your calendar for."
        description="Group departures, private escapes, family adventures and honeymoons — every itinerary is tried, tested and led by people who know the place by heart."
        breadcrumbs={[{ label: "Tour packages" }]}
      >
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-lg shadow-forest-950/5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-saffron-700">
            At a glance
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="font-display text-3xl font-semibold text-forest-950">
                {tours.length}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Curated tours
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-forest-950">
                {destinations.length}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Destinations
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-forest-950">
                4.9
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Guest rating
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-2.5 border-t border-dashed border-stone-200 pt-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-stone-500">
              <BadgeCheck className="h-3.5 w-3.5 text-forest-600" />
              All-inclusive pricing, no surprises
            </p>
            <p className="flex items-center gap-2 text-[11px] font-semibold text-stone-500">
              <CalendarDays className="h-3.5 w-3.5 text-forest-600" />
              Guaranteed departures all year
            </p>
            <p className="flex items-center gap-2 text-[11px] font-semibold text-stone-500">
              <MapPin className="h-3.5 w-3.5 text-forest-600" />
              Expert leaders on every journey
            </p>
          </div>
        </div>
      </PageHero>

      <ToursExplorer
        initialDestination={destination}
        initialExperience={experience}
        initialMonth={month}
      />

      <section className="container-page pb-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[30px] bg-forest-950 px-6 py-8 text-cream-50 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="eyebrow text-saffron-300">Prefer something personal?</p>
            <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">
              We can build a journey around your dates and people.
            </h2>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Design my trip
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
