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
import { SectionHeading } from "@/components/site/section-heading";
import { Rating } from "@/components/site/rating";
import { SearchWidget } from "@/components/site/search-widget";
import { Stamp } from "@/components/site/stamp";
import { TestimonialCarousel } from "@/components/site/testimonial-carousel";
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

const heroCoordinates = "34.30° N · 75.29° E";

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
  const homeTestimonials = [...testimonials].sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  );

  const tourCount = (slug: string) =>
    tours.filter((tour) => tour.destinationSlug === slug).length;

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="container-page pt-8 md:pt-12">
        <div className="grid items-center gap-8 xl:grid-cols-[1fr_600px] xl:gap-12">
          <div className="hero-stagger">
            <h1 className="type-display text-ink">
              Journeys that
              <br />
              <span className="accent-line">stay with you</span>
              <br />
              long after.
            </h1>

            <p className="type-lead mt-5 max-w-[460px] text-navy-700">
              Thoughtfully planned trips across India and the world, with a
              tour leader from day one.
            </p>

            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
              <Link href="/tours" className="btn btn-ink btn-lg">
                Explore tours
                <span className="btn-dot">→</span>
              </Link>
              <Link href="/contact" className="btn btn-outline btn-lg">
                Talk to an expert
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div>
                <Rating score="4.9" count="12,400+ reviews" />
                <p className="mt-0.5 text-[13px] font-medium text-navy-500">
                  1.2 million travellers hosted
                </p>
              </div>
            </div>

            {heroDestination ? (
              <div className="relative mt-7 aspect-[350/300] overflow-hidden rounded-[20px] bg-ink md:aspect-[2/1] xl:hidden">
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
          <div className="hero-collage relative mx-auto hidden aspect-square w-full max-w-[600px] xl:block">
            {heroDestination ? (
              <div className="absolute left-[160px] top-0 h-[560px] w-[440px] overflow-hidden rounded-t-[220px] rounded-b-[28px] bg-ink">
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
              <div className="absolute left-0 top-[260px] h-[300px] w-[240px] overflow-hidden rounded-[20px] border-8 border-paper bg-ink shadow-[0_18px_40px_-30px_rgba(11,39,53,0.5)]">
                <Image
                  src={imageUrl(insetDestination.image, 700)}
                  alt={insetDestination.name}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="animate-float-slow absolute left-[200px] top-[40px] flex items-center gap-2.5 rounded-full bg-paper py-2.5 pl-2.5 pr-4 shadow-[0_12px_32px_-16px_rgba(11,39,53,0.45)]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-400 text-ink">
                <MapPin className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-ink">
                  Sonamarg, Kashmir
                </span>
                <span className="block text-xs font-medium text-navy-500">
                  {heroCoordinates}
                </span>
              </span>
            </div>

            <span className="absolute left-[452px] top-[470px]">
              <Stamp size={140} />
            </span>
          </div>
        </div>

        <div className="mt-8">
          <SearchWidget destinations={destinations} experiences={experiences} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="w-full text-sm font-semibold text-navy-500 sm:w-auto">Popular:</span>
          {[
            { label: "Kashmir in spring", href: "/tours?destination=kashmir" },
            { label: "Women's Special", href: "/tours?experience=women" },
            { label: "Honeymoons", href: "/tours?experience=honeymoon" },
            { label: "Europe 2027", href: "/destinations/europe" },
            { label: "Under ₹50k", href: "/tours?price=under50" },
          ].map((link, index) => (
            // Four chips fit two even rows on phones; the fifth shows from tablet up.
            <Link
              key={link.label}
              href={link.href}
              className={`chip ${index === 4 ? "hidden sm:inline-flex" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- stats */}
      <section className="container-page pt-12 md:pt-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-x-0">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`md:pr-8 ${
                index ? "md:border-l md:border-sand-300 md:pl-8" : ""
              }`}
            >
              <p className="type-h2 text-ink">
                {stat.value}
                <span>
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
            <Link
              href="/destinations"
              className="btn btn-outline"
            >
              All {destinations.length} destinations
              <span className="btn-dot">→</span>
            </Link>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[588px_1fr]">
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

      </section>

      {/* ------------------------------------------------------------ tours */}
      <section className="bg-sand-100">
        <div className="container-page section-major">
          <SectionHeading
            number="02"
            label="Handpicked departures"
            title="Most-loved tours"
            right={
              <Link href="/tours" className="btn btn-outline">
                View all {tours.length} tours
                <span className="btn-dot">→</span>
              </Link>
            }
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredSelection.map((tour, index) => (
              <TourCard key={tour.slug} tour={tour} priority={index === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- why us */}
      <section className="on-ink relative isolate overflow-hidden bg-ink">
        <Contours cx={0.82} cy={0.3} count={9} color="rgba(255,255,255,0.055)" />
        <div className="container-page relative grid gap-8 py-12 md:py-16 lg:grid-cols-[1fr_440px] lg:gap-14">
          <div>
            <SectionHeading
              number="03"
              label="The Hidden Miles way"
              title="Four decades of"
              accent="the little things."
              dark
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
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

          {homeTestimonials.length ? (
            <TestimonialCarousel testimonials={homeTestimonials} />
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

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-ink sm:aspect-[282/360]">
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
                    {`${experience.shortTitle} tours`}
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
          bySlug("europe")?.image ??
          "https://images.unsplash.com/photo-1499856871958-5b9627545d1a"
        }
        imageAlt="Paris at dusk"
      />
    </>
  );
}
