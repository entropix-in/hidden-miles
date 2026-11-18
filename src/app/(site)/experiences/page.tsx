import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { loadDestinations, loadExperiences } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "The moments worth the whole journey — food, culture, nature and adventure experiences across India and the world.",
};

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  const [experiences, destinations] = await Promise.all([
    loadExperiences(),
    loadDestinations(),
  ]);
  // Use a destination photo for the hero so it doesn't repeat a card image below.
  const usedImages = new Set(experiences.map((experience) => experience.image));
  const heroImage =
    destinations.find((destination) => !usedImages.has(destination.image))?.image ??
    experiences[0]?.image ??
    "";

  return (
    <>
      <PageHero
        items={[{ label: "Home", href: "/" }, { label: "Experiences" }]}
        title="Moments worth"
        accent="the whole journey."
        image={heroImage}
        imageAlt="A travel destination"
      />

      <section className="container-page pb-16 md:pb-24">
        <div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <Link
                key={experience.slug}
                href={`/speciality-tours/${experience.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-ink">
                  <Image
                    src={imageUrl(experience.image, 900)}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="type-h4 mt-4 text-ink transition group-hover:text-navy-700">
                  {experience.title}
                </h3>
                <p className="type-small mt-1.5 line-clamp-2 text-navy-500">
                  {experience.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Build a trip around"
        accent="the moments you love."
        description="Tell us what you love. We'll shape the itinerary around it."
      />
    </>
  );
}
