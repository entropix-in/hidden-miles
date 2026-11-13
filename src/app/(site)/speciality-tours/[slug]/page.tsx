import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Compass } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard } from "@/components/site/tour-card";
import { loadExperiences, loadTours } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experiences = await loadExperiences();
  const experience = experiences.find((item) => item.slug === slug);
  if (!experience) return { title: "Speciality tour not found" };

  return {
    title: `${experience.title} · Speciality Tours`,
    description: experience.description,
    openGraph: {
      title: `${experience.title} · Hidden Miles`,
      description: experience.description,
      images: [imageUrl(experience.image, 1200)],
    },
  };
}

export default async function SpecialityTourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [experiences, tours] = await Promise.all([
    loadExperiences(),
    loadTours(),
  ]);

  const experience = experiences.find((item) => item.slug === slug);
  if (!experience) notFound();

  const matchingTours = tours
    .filter((tour) => tour.experiences.includes(experience.slug))
    .sort(
      (a, b) =>
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        b.rating - a.rating,
    );

  const others = experiences
    .filter((item) => item.slug !== experience.slug)
    .slice(0, 5);

  return (
    <>
      <PageHero
        items={[
          { label: "Home", href: "/" },
          { label: "Speciality Tours", href: "/speciality-tours" },
          { label: experience.shortTitle },
        ]}
        title={experience.title}
        description={experience.description}
        image={experience.image}
        imageAlt={experience.title}
        coords="A HIDDEN MILES COLLECTION"
      >
        <div className="flex flex-wrap gap-2">
          {experience.highlights.map((highlight) => (
            <span
              key={highlight}
              className="inline-flex items-center gap-2 rounded-full border border-sand-300 px-3.5 py-2 text-[13px] font-semibold text-navy-700"
            >
              <Check className="h-3.5 w-3.5 text-success" />
              {highlight}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="container-page pb-16 md:pb-24">
        <SectionHeading
          label="Handpicked departures"
          title={`${experience.shortTitle} journeys`}
          accent="worth taking."
          description={
            matchingTours.length
              ? `${matchingTours.length} ${
                  matchingTours.length === 1 ? "journey" : "journeys"
                } designed around this style of travel.`
              : "We are curating new departures for this style — tell us what you have in mind."
          }
          href="/tours"
          linkLabel="All group tours"
        />

        {matchingTours.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {matchingTours.map((tour, index) => (
              <TourCard key={tour.slug} tour={tour} priority={index < 3} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[28px] border border-dashed border-sand-300 px-6 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-200 text-navy-500">
              <Compass className="h-6 w-6" />
            </span>
            <h3 className="type-h3 mt-5 text-ink">New journeys are on the way.</h3>
            <p className="type-small mx-auto mt-2 max-w-md text-navy-500">
              Share your dates and travel companions, and our team will design a{" "}
              {experience.shortTitle.toLowerCase()} journey around you.
            </p>
            <Link href="/personalised" className="btn btn-ink mt-6">
              Build my trip
              <span className="btn-dot">→</span>
            </Link>
          </div>
        )}

        <div className="mt-14 rounded-[28px] border border-sand-300 bg-sand-100 p-7 md:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="type-label text-gold-600">Looking for a different style?</p>
              <h2 className="type-h3 mt-2 text-ink">Explore more speciality tours.</h2>
            </div>
            <Link href="/speciality-tours" className="btn btn-outline shrink-0">
              All speciality tours
              <span className="btn-dot">→</span>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {others.map((item) => (
              <Link
                key={item.slug}
                href={`/speciality-tours/${item.slug}`}
                className="chip"
              >
                {item.shortTitle}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={`Dreaming of ${experience.shortTitle.toLowerCase()}?`}
        accent="Let's design it."
        description="Tell us who is travelling and what matters most. A specialist will send a draft itinerary within 24 hours."
        image={experience.image}
        imageAlt={experience.title}
      />
    </>
  );
}
