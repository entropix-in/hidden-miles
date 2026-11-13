import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Headset,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { Contours } from "@/components/site/contours";
import { DestinationCard } from "@/components/site/destination-card";
import { FeatureTile } from "@/components/site/feature-tile";
import { Kicker, SectionHeading } from "@/components/site/section-heading";
import { Rating } from "@/components/site/rating";
import { SearchWidget } from "@/components/site/search-widget";
import { Stamp } from "@/components/site/stamp";
import { TourCard } from "@/components/site/tour-card";
import type { Destination } from "@/data/destinations";
import { stats } from "@/data/site";
import {
  loadDestinations,
  loadExperiences,
  loadTestimonials,
  loadTours,
} from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const heroCoordinates = "34.05° N · 74.38° E";

export default async function HomePage() {
  const [tours, destinations, experiences, testimonials] = await Promise.all([
    loadTours(),
    loadDestinations(),
    loadExperiences(),
    loadTestimonials(),
  ]);

  const featuredTours = tours.filter((tour) => tour.featured);
  const featuredSelection = (featuredTours.length ? featuredTours : tours).slice(0, 3);
  const bySlug = (slug: string) => destinations.find((item) => item.slug === slug);
  const heroDestination = bySlug("kashmir") ?? destinations[0];
  const insetDestination = bySlug("kerala") ?? destinations[1];
  const bentoDestinations = [
    bySlug("kashmir"),
    bySlug("kerala"),
    bySlug("rajasthan"),
    bySlug("japan"),
    bySlug("bali"),
  ].filter((item): item is Destination => Boolean(item));
  const specialities = experiences
    .filter((experience) =>
      ["honeymoon", "spiritual", "adventure", "women"].includes(experience.slug),
    )
    .slice(0, 4);
  const testimonial = testimonials[0];

  const tourCount = (slug: string) =>
    tours.filter((tour) => tour.destinationSlug === slug).length;

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="container-page pt-12 md:pt-16">
        <div className="grid items-center gap-12 xl:grid-cols-[1fr_600px] xl:gap-16">
          <div className="animate-rise">
            <Kicker label="Group tours · Family holidays · Private escapes" />

            <h1 className="type-display mt-6 text-ink">
              Journeys that
              <br />
              <span className="accent-line">stay with you</span>
              <br />
              long after.
            </h1>

            <p className="type-lead mt-7 max-w-[500px] text-navy-700">
              Thoughtfully planned trips across India and the world — with a tour
              leader from day one, honest all-inclusive prices and a real person
              on call, always.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/tours" className="btn btn-ink btn-lg">
                Explore tours
                <span className="btn-dot">→</span>
              </Link>
              <Link href="/contact" className="btn btn-outline btn-lg">
                Talk to an expert
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  ["A", "bg-blue-500"],
                  ["R", "bg-gold-600"],
                  ["M", "bg-navy-500"],
                  ["S", "bg-danger"],
                ].map(([initial, color]) => (
                  <span
                    key={initial}
                    className={`grid h-10 w-10 place-items-center rounded-full border-[3px] border-paper text-[13px] font-bold text-white ${color}`}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <div>
                <Rating score="4.9" count="12,400+ reviews" />
                <p className="mt-0.5 text-[13px] font-medium text-navy-500">
                  Loved by 1.2 million travellers
                </p>
              </div>
            </div>

            {heroDestination ? (
              <div className="relative mt-9 aspect-[350/300] overflow-hidden rounded-[28px] bg-ink md:aspect-[2/1] xl:hidden">
                <Image
                  src={imageUrl(heroDestination.image, 900)}
                  alt={heroDestination.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <span className="absolute bottom-4 right-4">
                  <Stamp size={96} />
                </span>
              </div>
            ) : null}
          </div>

          {/* Collage */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-[600px] xl:block">
            {heroDestination ? (
              <div className="absolute right-0 top-0 h-[93%] w-[73%] overflow-hidden rounded-t-[220px] rounded-b-[28px] bg-ink">
                <Image
                  src={imageUrl(heroDestination.image, 1200)}
                  alt={heroDestination.name}
                  fill
                  priority
                  sizes="440px"
                  className="object-cover"
                />
              </div>
            ) : null}

            {insetDestination ? (
              <div className="absolute bottom-0 left-0 h-[50%] w-[40%] overflow-hidden rounded-[28px] border-8 border-paper bg-ink shadow-[0_18px_40px_-30px_rgba(11,39,53,0.5)]">
                <Image
                  src={imageUrl(insetDestination.image, 700)}
                  alt={insetDestination.name}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="absolute left-[8%] top-[7%] flex items-center gap-2.5 rounded-full bg-paper py-2.5 pl-2.5 pr-4 shadow-[0_12px_32px_-16px_rgba(11,39,53,0.45)]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-400 text-ink">
                <MapPin className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[13px] font-bold text-ink">
                  Gulmarg, Kashmir
                </span>
                <span className="block text-xs font-medium text-navy-400">
                  {heroCoordinates}
                </span>
              </span>
            </div>

            <span className="absolute bottom-[9%] right-[8%]">
              <Stamp size={140} />
            </span>
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <SearchWidget destinations={destinations} experiences={experiences} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5 pb-12 md:pb-16">
          <span className="text-sm font-bold text-navy-500">Popular:</span>
          {[
            { label: "Kashmir in spring", href: "/tours?destination=kashmir" },
            { label: "Women's Special", href: "/tours?experience=women" },
            { label: "Honeymoons", href: "/tours?experience=honeymoon" },
            { label: "Europe 2027", href: "/destinations/europe" },
            { label: "Under ₹50k", href: "/tours?price=under50" },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="chip">
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- stats */}
      <section className="container-page">
        <div className="grid grid-cols-2 gap-y-8 border-y border-sand-300 py-10 md:grid-cols-4 md:py-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-0 md:px-8 ${index ? "md:border-l md:border-sand-300" : ""}`}
            >
              <p className="type-h3 text-ink">
                {stat.value}
                <span className="type-h4">
                  {stat.suffix === "yrs" ? " years" : stat.suffix}
                </span>
              </p>
              <p className="type-small mt-2 text-navy-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- destinations */}
      <section className="container-page section-major">
        <SectionHeading
          number="01"
          label="Destinations"
          title="Where will you"
          accent="wander next?"
          right={
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", count: destinations.length },
                {
                  label: "India",
                  count: destinations.filter((item) => item.region === "India")
                    .length,
                },
                {
                  label: "International",
                  count: destinations.filter(
                    (item) => item.region === "International",
                  ).length,
                },
              ].map((filter, index) => (
                <span
                  key={filter.label}
                  className={`chip ${index === 0 ? "chip-active" : ""}`}
                >
                  {filter.label}
                  <span className="chip-count">{filter.count}</span>
                </span>
              ))}
            </div>
          }
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[588px_1fr]">
          {bentoDestinations[0] ? (
            <DestinationCard
              destination={bentoDestinations[0]}
              tourCount={tourCount(bentoDestinations[0].slug)}
              big
              priority
            />
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            {bentoDestinations.slice(1, 5).map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                tourCount={tourCount(destination.slug)}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/destinations" className="btn btn-outline">
            See all {destinations.length} destinations
            <span className="btn-dot">→</span>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------ tours */}
      <section className="bg-sand-100">
        <div className="container-page section-major">
          <SectionHeading
            number="02"
            label="Handpicked departures"
            title="Tours our travellers"
            accent="love most."
            right={
              <Link href="/tours" className="btn btn-outline">
                View all {tours.length} tours
                <span className="btn-dot">→</span>
              </Link>
            }
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Bestsellers",
              "Departing soon",
              "Under ₹60k",
              "Women's Special",
              "International",
            ].map((tab, index) => (
              <Link
                key={tab}
                href="/tours"
                className={`chip ${index === 0 ? "chip-active" : ""}`}
              >
                {tab}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {featuredSelection.map((tour, index) => (
              <TourCard key={tour.slug} tour={tour} priority={index === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- why us */}
      <section className="on-ink relative isolate overflow-hidden bg-ink">
        <Contours cx={0.82} cy={0.3} count={9} color="rgba(255,255,255,0.055)" />
        <div className="container-page relative grid gap-12 py-20 md:py-32 lg:grid-cols-[1fr_440px] lg:gap-20">
          <div>
            <SectionHeading
              number="03"
              label="The Hidden Miles way"
              title="Four decades of"
              accent="the little things."
              dark
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <FeatureTile
                dark
                icon={<Wallet className="h-5 w-5" />}
                title="Honest, all-inclusive prices"
                description="Flights, stays, meals and guides — no add-ons at checkout."
                number="01"
              />
              <FeatureTile
                dark
                icon={<BadgeCheck className="h-5 w-5" />}
                title="A leader on every trip"
                description="500+ trained leaders travel with you, day one to home."
                number="02"
              />
              <FeatureTile
                dark
                icon={<Headset className="h-5 w-5" />}
                title="24×7 real-person support"
                description="WhatsApp a human, whatever the hour or the time zone."
                number="03"
              />
              <FeatureTile
                dark
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Flexible, protected bookings"
                description="Free date changes up to 30 days out. Payments protected."
                number="04"
              />
            </div>
          </div>

          {testimonial ? (
            <figure className="flex flex-col gap-6 self-center rounded-[28px] bg-paper p-8 text-ink lg:p-11">
              <span className="type-display h-10 leading-none text-gold-400">
                “
              </span>
              <blockquote className="font-display text-[24px] leading-9 text-ink">
                {testimonial.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3.5">
                <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-blue-500 text-sm font-bold text-white">
                  {testimonial.name
                    .split(" ")
                    .filter((word) => /[A-Za-z]/.test(word[0] ?? ""))
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-ink">
                    {testimonial.name}
                  </span>
                  <span className="block text-sm font-medium text-navy-500">
                    {testimonial.tour} · {testimonial.city}
                  </span>
                </span>
              </figcaption>
              <div className="route-line" />
              <div className="flex items-center justify-between gap-4">
                <Rating score="4.9" count="12,400+" />
                <span className="flex gap-2">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-sand-200 text-ink">
                    ←
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold-400">
                    →
                  </span>
                </span>
              </div>
            </figure>
          ) : null}
        </div>
      </section>

      {/* ---------------------------------------------------------- speciality */}
      <section className="container-page section-major">
        <SectionHeading
          number="04"
          label="Speciality tours"
          title="Travel that fits"
          accent="the way you live."
          right={
            <Link href="/speciality-tours" className="btn btn-outline">
              All speciality tours
              <span className="btn-dot">→</span>
            </Link>
          }
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {specialities.map((experience) => {
            const count = tours.filter((tour) =>
              tour.experiences.includes(experience.slug),
            ).length;

            return (
              <Link
                key={experience.slug}
                href={`/speciality-tours/${experience.slug}`}
                className="group"
              >
                <div className="relative aspect-[282/360] overflow-hidden rounded-[28px] bg-ink">
                  <Image
                    src={imageUrl(experience.image, 900)}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                </div>
                <div className="mt-4">
                  <h3 className="type-h4 text-ink transition group-hover:text-navy-700">
                    {experience.shortTitle === "Adventure"
                      ? "Himalayan adventures"
                      : experience.shortTitle === "Honeymoon"
                        ? "Honeymoons"
                        : experience.shortTitle === "Spiritual"
                          ? "Spiritual journeys"
                          : experience.title}
                  </h3>
                  <p className="type-small mt-1 text-navy-500">
                    {count} {count === 1 ? "trip" : "trips"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <CtaBand
        image={
          bySlug("kashmir")?.image ??
          "https://images.unsplash.com/photo-1593181629936-11c609b8db9b"
        }
        imageAlt="A shikara on Dal Lake, Kashmir"
      />
    </>
  );
}
