import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgePercent, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard } from "@/components/site/tour-card";
import { loadTours } from "@/lib/content";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Deals & Offers",
  description:
    "Limited-time savings on Hidden Miles group tours across India and the world. Handpicked departures with transparent, all-inclusive pricing.",
};

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const tours = await loadTours();
  const deals = tours
    .filter((tour) => tour.oldPrice && tour.oldPrice > tour.price)
    .sort(
      (a, b) =>
        ((b.oldPrice ?? b.price) - b.price) -
        ((a.oldPrice ?? a.price) - a.price),
    );
  const biggestSaving = deals[0]
    ? (deals[0].oldPrice ?? deals[0].price) - deals[0].price
    : 0;

  return (
    <>
      <PageHero
        eyebrow="Deals & offers"
        title="Big journeys. Better prices."
        description="A handful of departures with genuinely better pricing — same hotels, same guides, same thoughtful planning. When they are gone, they are gone."
        breadcrumbs={[{ label: "Deals & offers" }]}
      >
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-lg shadow-navy-950/5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-blue-700">
            <BadgePercent className="h-5 w-5" />
          </span>
          <p className="mt-4 font-display text-3xl font-semibold text-navy-950">
            {deals.length} offers
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-wider text-stone-400">
            Live right now
          </p>
          <p className="mt-4 flex items-center gap-2 border-t border-dashed border-stone-200 pt-4 text-sm font-semibold text-stone-500">
            <Sparkles className="h-4 w-4 text-navy-600" />
            Save up to {formatINR(biggestSaving)} per person
          </p>
        </div>
      </PageHero>

      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Handpicked offers"
          title="The best value on our calendar"
          description="Every deal is a real departure with the same inclusions as always — flights where listed, handpicked stays, transfers and an expert tour leader."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((tour, index) => (
            <TourCard key={tour.slug} tour={tour} priority={index < 3} />
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[30px] bg-navy-950 px-6 py-8 text-sand-50 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="eyebrow text-blue-300">Looking for something else?</p>
            <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">
              Tell us your dates and we will find the right departure.
            </h2>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Talk to an expert
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
