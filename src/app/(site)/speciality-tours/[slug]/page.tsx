import { PageContentBlocks, RichFieldText } from "@/components/site/page-content-blocks";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, Compass } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard, TourListCard } from "@/components/site/tour-card";
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
  const experience = experiences.find((item) => item.slug === slug)
    ?? experiences.find((item) => item.urlAliases?.includes(slug));
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

  const experience = experiences.find((item) => item.slug === slug)
    ?? experiences.find((item) => item.urlAliases?.includes(slug));
  if (!experience) notFound();
  if (experience.slug !== slug) redirect(`/speciality-tours/${experience.slug}`);

  const matchingTours = tours
    .filter((tour) => tour.experiences.includes(experience.slug))
    .sort(
      (a, b) =>
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        b.rating - a.rating,
    );

  // One rule for every speciality page: full rows of three, with any remainder
  // leading as featured wide cards (top-rated first), so no row is ragged.
  const gridCount = matchingTours.length - (matchingTours.length % 3);
  const extraCount = matchingTours.length - gridCount;
  const extraTours = matchingTours.slice(0, extraCount);
  const gridTours = matchingTours.slice(extraCount);

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
        description={experience.description ? <RichFieldText editor={experience.richFields?.description} fallback={experience.description} /> : undefined}
        image={experience.image}
        imageAlt={experience.title}
        showImageOnMobile
      >
        <div className="flex flex-wrap gap-2 sm:grid sm:max-w-md sm:grid-cols-2">
          {experience.highlights.map((highlight, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 rounded-full border border-sand-300 px-3.5 py-2 text-[13px] font-semibold text-navy-700"
            >
              <Check className="h-3.5 w-3.5 text-success" />
              <RichFieldText editor={experience.richFields?.highlights?.[index]} fallback={highlight} />
            </span>
          ))}
        </div>
      </PageHero>
      {!!experience.contentBlocks?.length && (
        <div className="container-page">
          <PageContentBlocks blocks={experience.contentBlocks} />
        </div>
      )}

      <section className="container-page pb-12 md:pb-16">
        <SectionHeading
          label="Handpicked departures"
          title={`${experience.shortTitle} tours`}
        />

        {matchingTours.length ? (
          <div className="mt-8 grid gap-6">
            {extraTours.map((tour, index) => (
              <TourListCard key={tour.slug} tour={tour} priority={index === 0} />
            ))}
            {gridTours.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gridTours.map((tour, index) => (
                  <TourCard key={tour.slug} tour={tour} priority={!extraTours.length && index < 3} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 rounded-[20px] border border-dashed border-sand-300 px-6 py-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-200 text-navy-500">
              <Compass className="h-6 w-6" />
            </span>
            <h3 className="type-h3 mt-5 text-ink">New journeys are on the way.</h3>
            <p className="type-small mx-auto mt-2 max-w-md text-navy-500">
              Share your dates and travel companions, and our team will design a{" "}
              {experience.shortTitle.toLowerCase()} journey around you.
            </p>
            <Link href="/personalised" className="btn btn-ink mt-5">
              Build my trip
              <span className="btn-dot">→</span>
            </Link>
          </div>
        )}

        <div className="mt-8 rounded-[20px] border border-sand-300 bg-sand-100 p-6 md:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="type-h4 text-ink">Explore other styles</h2>
            <Link href="/speciality-tours" className="btn btn-outline shrink-0">
              All speciality tours
              <span className="btn-dot">→</span>
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
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
        title="Want it tailored?"
        accent="Let's design it."
        description="A specialist will send a draft itinerary within 24 hours."
        image={null}
        imageAlt={experience.title}
      />
    </>
  );
}
