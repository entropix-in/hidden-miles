import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { loadExperiences } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "The moments worth the whole journey — food, culture, nature and adventure experiences across India and the world.",
};

export const dynamic = "force-dynamic";

const categories: Record<string, string> = {
  honeymoon: "Celebration",
  spiritual: "Culture",
  adventure: "Adventure",
  family: "Nature",
  luxury: "Luxury",
  women: "Culture",
};

export default async function ExperiencesPage() {
  const experiences = await loadExperiences();
  const featured = experiences[0];
  const rest = experiences;

  return (
    <>
      <PageHero
        items={[{ label: "Home", href: "/" }, { label: "Experiences" }]}
        title="Moments worth"
        accent="the whole journey."
        description="Cooking with a Kerala family, sunrise at Pangong, a private aarti in Varanasi — the moments our travellers remember most."
        image={
          experiences.find((experience) => experience.slug === "adventure")
            ?.image ?? experiences[0]?.image ?? ""
        }
        imageAlt="A Himalayan adventure"
        coords="LADAKH · 34.15° N  77.58° E"
      />

      <section className="container-page pb-16 md:pb-24">
        {featured ? (
          <div className="on-ink relative grid overflow-hidden rounded-[36px] bg-ink xl:grid-cols-[640px_1fr]">
            <div className="relative min-h-[360px] lg:min-h-[480px]">
              <Image
                src={imageUrl(featured.image, 1400)}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-6 p-8 md:p-14">
              <span className="badge badge-gold w-fit">Experience of the month</span>
              <h2 className="type-h3 text-paper">
                The moment you&apos;ll
                <br />
                <span className="accent-line">talk about for years.</span>
              </h2>
              <p className="type-body max-w-lg text-navy-200">
                {featured.description}
              </p>
              <Link
                href={`/speciality-tours/${featured.slug}`}
                className="btn btn-primary w-fit"
              >
                See this experience
                <span className="btn-dot">→</span>
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="type-h3 text-ink">All experiences</h2>
            <div className="flex flex-wrap gap-2">
              {["All", "Culture", "Food", "Nature", "Adventure"].map(
                (filter, index) => (
                  <span
                    key={filter}
                    className={`chip ${index === 0 ? "chip-active" : ""}`}
                  >
                    {filter}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((experience) => (
              <Link
                key={experience.slug}
                href={`/speciality-tours/${experience.slug}`}
                className="group"
              >
                <div className="relative aspect-[378/300] overflow-hidden rounded-[28px] bg-ink">
                  <Image
                    src={imageUrl(experience.image, 900)}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="badge badge-paper absolute left-5 top-5">
                    {experience.highlights.length} highlights
                  </span>
                </div>
                <p className="type-label mt-5 text-blue-700">
                  {categories[experience.slug] ?? "Experience"}
                </p>
                <h3 className="type-h4 mt-2 text-ink transition group-hover:text-navy-700">
                  {experience.title}
                </h3>
                <p className="type-small mt-2 line-clamp-2 text-navy-500">
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
        description="Tell us what you want to feel, taste and remember. We'll shape the itinerary around it."
      />
    </>
  );
}
