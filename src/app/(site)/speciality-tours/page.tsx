import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  HeartHandshake,
  PenLine,
  PhoneCall,
} from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { Contours } from "@/components/site/contours";
import { FeatureTile } from "@/components/site/feature-tile";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { loadDestinations, loadExperiences, loadTours } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Speciality Tours",
  description:
    "Honeymoons, spiritual journeys, Himalayan adventures, family holidays and women-only departures — journeys built around a purpose.",
};

export const dynamic = "force-dynamic";

export default async function SpecialityToursPage() {
  const [experiences, tours, destinations] = await Promise.all([
    loadExperiences(),
    loadTours(),
    loadDestinations(),
  ]);

  // A hero photo that isn't one of the cards below, so the page doesn't open on a repeat.
  const cardImages = new Set(experiences.map((experience) => experience.image));
  const heroImage =
    destinations.find((destination) => !cardImages.has(destination.image))?.image ??
    experiences[0]?.image;

  return (
    <>
      <PageHero
        items={[
          { label: "Home", href: "/" },
          { label: "Speciality Tours" },
        ]}
        title="Travel that fits"
        accent="the way you live."
        image={heroImage ?? ""}
        imageAlt="A honeymoon escape"
      />

      <section className="container-page pb-16 md:pb-24">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((experience) => {
            const count = tours.filter((tour) =>
              tour.experiences.includes(experience.slug),
            ).length;

            return (
              <Link
                key={experience.slug}
                href={`/speciality-tours/${experience.slug}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-ink">
                  <Image
                    src={imageUrl(experience.image, 900)}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="badge badge-paper absolute left-4 top-4">
                    {count} {count === 1 ? "trip" : "trips"}
                  </span>
                </div>
                <h2 className="type-h4 mt-4 text-ink transition group-hover:text-navy-700">
                  {experience.title}
                </h2>
                <p className="type-small mt-1.5 line-clamp-2 text-navy-500">
                  {experience.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700">
                  Explore
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="on-ink relative isolate overflow-hidden bg-ink">
        <Contours cx={0.15} cy={0.8} count={8} color="rgba(255,255,255,0.05)" />
        <div className="container-page relative section-minor">
          <SectionHeading
            label="How it works"
            title="How it works"
            dark
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureTile
              dark
              icon={<PhoneCall className="h-5 w-5" />}
              title="Tell us your dream"
              description="Dates, budget and the kind of trip you love."
              number="01"
            />
            <FeatureTile
              dark
              icon={<PenLine className="h-5 w-5" />}
              title="We design it around you"
              description="A specialist drafts an itinerary in 24 hours."
              number="02"
            />
            <FeatureTile
              dark
              icon={<HeartHandshake className="h-5 w-5" />}
              title="We fine-tune together"
              description="Swap hotels, add days, change pace — free."
              number="03"
            />
            <FeatureTile
              dark
              icon={<Compass className="h-5 w-5" />}
              title="You travel, we handle it"
              description="24×7 support and a leader on the ground."
              number="04"
            />
          </div>
        </div>
      </section>

      <CtaBand className="pt-14 md:pt-20" />
    </>
  );
}
