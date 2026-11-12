import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { ExperienceIcon } from "@/components/site/experience-icon";
import { TourCard } from "@/components/site/tour-card";
import { loadExperiences, loadTours } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Speciality Tours",
  description:
    "Women's specials, honeymoons, spiritual journeys, family holidays, Himalayan adventures and luxury escapes — speciality group tours designed around the way you travel.",
};

export const dynamic = "force-dynamic";

const specialityExperienceSlugs = [
  "women",
  "honeymoon",
  "spiritual",
  "family",
  "adventure",
  "luxury",
];

export default async function SpecialityToursPage() {
  const [experiences, tours] = await Promise.all([
    loadExperiences(),
    loadTours(),
  ]);

  const specialities = specialityExperienceSlugs
    .map((slug) => experiences.find((experience) => experience.slug === slug))
    .filter((experience) => experience !== undefined);

  const signatureTours = tours
    .filter((tour) =>
      tour.experiences.some((slug) =>
        specialityExperienceSlugs.includes(slug),
      ),
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <>
      <PageHero
        eyebrow="Speciality tours"
        title="The right journey for the way you travel."
        description="A speciality tour is not just a destination — it is the people, the pace and the little details that make it feel made for you. Choose the style that fits, and we will take care of the rest."
        breadcrumbs={[{ label: "Speciality tours" }]}
      >
        <div className="rounded-[28px] border border-stone-200 bg-white p-6">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <p className="mt-4 font-display text-2xl font-medium leading-snug text-navy-950">
            “Travel that fits your life, not the other way around.”
          </p>
          <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.16em] text-stone-400">
            The Hidden Miles promise
          </p>
        </div>
      </PageHero>

      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Choose your style"
          title="Speciality tours, thoughtfully designed"
          description="Every style has its own pace, stays and handpicked experiences. Pick one to see the departures that match."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {specialities.map((experience, index) => {
            const href = `/speciality-tours/${experience.slug}`;

            return (
              <article
                key={experience.slug}
                className="group overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_14px_50px_-38px_rgba(6,42,38,0.5)] transition duration-500 hover:-translate-y-1"
              >
                <Link href={href} className="block">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={imageUrl(experience.image, 1200)}
                      alt={experience.title}
                      fill
                      priority={index < 2}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
                    <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-navy-950 backdrop-blur">
                      <ExperienceIcon
                        icon={experience.icon}
                        className="h-4 w-4"
                      />
                      {experience.shortTitle}
                    </span>
                  </div>

                  <div className="p-6">
                    <h2 className="font-display text-2xl font-semibold text-navy-950">
                      {experience.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-stone-600">
                      {experience.description}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {experience.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1.5 text-sm font-semibold text-stone-600"
                        >
                          <Check className="h-3.5 w-3.5 text-blue-600" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-navy-950 transition group-hover:text-blue-700">
                      Explore {experience.shortTitle} tours
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-sand-100/70 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Signature departures"
            title="Speciality tours our travellers love"
            description="Fixed departures with small groups, expert leaders and the details already handled."
            href="/tours"
            linkLabel="All group tours"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {signatureTours.map((tour) => (
              <TourCard key={tour.slug} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[30px] border border-stone-200 bg-white px-6 py-8 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="eyebrow">Nothing quite fits?</p>
            <h2 className="mt-2 font-display text-2xl font-medium text-navy-950 sm:text-3xl">
              We will design a speciality journey around you.
            </h2>
          </div>
          <Link href="/personalised" className="btn-primary shrink-0">
            Build my trip
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
