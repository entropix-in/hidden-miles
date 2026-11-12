import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, Compass, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard } from "@/components/site/tour-card";
import { ExperienceIcon } from "@/components/site/experience-icon";
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
        b.rating - a.rating ||
        b.reviews - a.reviews,
    );

  const otherSpecialities = experiences
    .filter((item) => item.slug !== experience.slug)
    .slice(0, 5);

  return (
    <>
      <PageHero
        eyebrow="Speciality tours"
        title={experience.title}
        description={experience.description}
        breadcrumbs={[
          { label: "Speciality tours", href: "/speciality-tours" },
          { label: experience.shortTitle },
        ]}
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] shadow-2xl shadow-navy-950/15">
          <Image
            src={imageUrl(experience.image, 1200)}
            alt={experience.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-navy-950 backdrop-blur">
            <ExperienceIcon icon={experience.icon} className="h-4 w-4" />
            {experience.shortTitle}
          </span>
        </div>
      </PageHero>

      <section className="container-page py-12 sm:py-16">
        <div className="flex flex-wrap items-center gap-2">
          {experience.highlights.map((highlight) => (
            <span
              key={highlight}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold text-stone-600"
            >
              <Check className="h-3.5 w-3.5 text-blue-600" />
              {highlight}
            </span>
          ))}
        </div>

        <div className="mt-10">
          <SectionHeading
            eyebrow="Handpicked departures"
            title={`${experience.shortTitle} journeys`}
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
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matchingTours.map((tour, index) => (
                <TourCard key={tour.slug} tour={tour} priority={index < 3} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[30px] border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-200 text-blue-700">
                <Compass className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-navy-950">
                New journeys are on the way.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                Share your dates and travel companions, and our team will design
                a {experience.shortTitle.toLowerCase()} journey around you.
              </p>
              <Link href="/personalised" className="btn-primary mt-6">
                Build my trip
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-sand-100/70 py-14">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-5 rounded-[30px] border border-stone-200 bg-white px-6 py-8 sm:flex-row sm:items-center sm:px-10">
            <div>
              <p className="eyebrow">Looking for a different style?</p>
              <h2 className="mt-2 font-display text-2xl font-medium text-navy-950 sm:text-3xl">
                Explore more speciality tours.
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {otherSpecialities.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/speciality-tours/${item.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-sand-50 px-3.5 py-2 text-sm font-bold text-stone-600 transition hover:border-blue-400 hover:text-blue-700"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    {item.shortTitle}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/speciality-tours"
              className="btn-outline shrink-0"
            >
              All speciality tours
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
