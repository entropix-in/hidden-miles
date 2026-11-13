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
import { loadExperiences, loadTours } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Speciality Tours",
  description:
    "Honeymoons, spiritual journeys, Himalayan adventures, family holidays and women-only departures — journeys built around a purpose.",
};

export const dynamic = "force-dynamic";

export default async function SpecialityToursPage() {
  const [experiences, tours] = await Promise.all([
    loadExperiences(),
    loadTours(),
  ]);

  const heroImage =
    experiences.find((experience) => experience.slug === "honeymoon")?.image ??
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
        description="Honeymoons, yatras, Himalayan treks and women-only departures — journeys built around a purpose, not just a place."
        image={heroImage ?? ""}
        imageAlt="A honeymoon escape"
        coords="CAPPADOCIA · 38.64° N  34.83° E"
      />

      <section className="container-page pb-16 md:pb-24">
        <div className="grid gap-16 lg:gap-24">
          {experiences.map((experience, index) => {
            const count = tours.filter((tour) =>
              tour.experiences.includes(experience.slug),
            ).length;

            return (
              <div
                key={experience.slug}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                  index % 2 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[580/420] overflow-hidden rounded-[28px] bg-ink">
                  <Image
                    src={imageUrl(experience.image, 1400)}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 580px"
                    className="object-cover"
                  />
                  <span className="badge badge-paper absolute left-6 top-6">
                    {count} {count === 1 ? "trip" : "trips"}
                  </span>
                </div>

                <div>
                  <p className="font-display text-5xl italic leading-none text-gold-600">
                    0{index + 1}
                  </p>
                  <h2 className="type-h2 mt-4 text-ink">{experience.title}</h2>
                  <p className="type-lead mt-5 max-w-lg text-navy-700">
                    {experience.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {experience.highlights.slice(0, 4).map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full border border-sand-300 px-3.5 py-2 text-[13px] font-semibold text-navy-700"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 flex flex-wrap items-center gap-5">
                    <Link
                      href={`/speciality-tours/${experience.slug}`}
                      className="btn btn-ink"
                    >
                      Explore {experience.shortTitle.toLowerCase()}
                      <span className="btn-dot">→</span>
                    </Link>
                    <Link
                      href="/contact"
                      className="text-sm font-bold text-blue-700 hover:text-blue-800"
                    >
                      Ask a specialist
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="on-ink relative isolate overflow-hidden bg-ink">
        <Contours cx={0.15} cy={0.8} count={8} color="rgba(255,255,255,0.05)" />
        <div className="container-page relative section-major">
          <SectionHeading
            label="How it works"
            title="From first call"
            accent="to final goodbye."
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

      <CtaBand />
    </>
  );
}
