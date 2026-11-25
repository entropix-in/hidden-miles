import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Headset,
  Plane,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { Contours } from "@/components/site/contours";
import { DestinationCard } from "@/components/site/destination-card";
import { FeatureTile } from "@/components/site/feature-tile";
import { Skyline } from "@/components/site/skyline";
import { SectionHeading } from "@/components/site/section-heading";
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

/**
 * Arch outline for a w×h box: a semicircle on top, straight sides, and a
 * bottom edge that climbs `drop` px from left to right, with 16px corners.
 */
function archPath(w: number, h: number, drop: number) {
  const r = w / 2;
  const c = 16;
  const length = Math.hypot(w, drop);
  const ux = (w / length) * c;
  const uy = (drop / length) * c;
  const n = (value: number) => Math.round(value * 10) / 10;
  return [
    `M0 ${r}`,
    `A${r} ${r} 0 0 1 ${w} ${r}`,
    `L${w} ${n(h - drop - c)}`,
    `Q${w} ${h - drop} ${n(w - ux)} ${n(h - drop + uy)}`,
    `L${n(ux)} ${n(h - uy)}`,
    `Q0 ${h} 0 ${h - c}`,
    "Z",
  ].join(" ");
}

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
  // Hero arches, left to right: backwaters, mountains, desert forts. The centre
  // one rises highest; each bottom edge climbs `drop` px from left to right.
  const heroArches = [
    {
      key: "left",
      destination: bySlug("kerala") ?? destinations[1],
      box: "left-0 top-[168px] h-[384px] w-[172px]",
      width: 172,
      height: 384,
      drop: 8,
    },
    {
      key: "centre",
      destination: heroDestination,
      box: "left-[182px] top-[36px] h-[544px] w-[268px]",
      width: 268,
      height: 544,
      drop: 40,
    },
    {
      key: "right",
      destination: bySlug("rajasthan") ?? destinations[2],
      box: "left-[458px] top-[156px] h-[404px] w-[182px]",
      width: 182,
      height: 404,
      drop: 24,
    },
  ];
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
      <div className="relative isolate overflow-hidden bg-[linear-gradient(to_bottom,var(--color-paper),var(--color-sand-100)_20%,var(--color-sand-100)_75%,var(--color-paper))]">
        <Skyline className="absolute bottom-[132px] left-[-3%] -z-10 hidden w-[48%] max-w-[720px] md:block" />
        <Contours
          className="-z-10 hidden md:block"
          color="rgba(11,39,53,0.07)"
          count={7}
          cx={1.02}
          cy={1.08}
          seed={2}
        />

        <section className="container-page pt-8 md:pt-12">
          <div className="grid items-center gap-8 xl:grid-cols-[1fr_640px] xl:gap-8">
            <div className="hero-stagger">
              <h1 className="type-hero text-ink">
                Offbeat India
                <br />
                and the world,
                <br />
                <span className="accent-line">led from day one</span>
              </h1>

              <p className="type-lead mt-6 max-w-[440px] text-navy-700">
                Thoughtfully planned group tours and personalised trips, from
                Kashmir and Kerala to Japan and Europe.
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
                <Link href="/tours" className="btn btn-ink btn-lg">
                  Explore tours
                  <span className="btn-dot">→</span>
                </Link>
                <Link href="/contact" className="btn btn-outline btn-lg">
                  Talk to an expert
                </Link>
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
                    <Stamp size={96} tone="paper" />
                  </span>
                </div>
              ) : null}
            </div>

            {/* Three arched windows onto India under a pale sun, with paper arches
                peeking out behind them and one flight path over the top. */}
            <div className="hero-collage relative mx-auto hidden h-[588px] w-full max-w-[640px] xl:block">
              <span className="absolute left-[408px] top-[44px] h-[144px] w-[144px] rounded-full bg-gold-200/70" />
              <span className="absolute left-[92px] top-[108px] h-[320px] w-[148px] rounded-t-full bg-sand-200/70" />
              <span className="absolute left-[516px] top-[100px] h-[320px] w-[132px] rounded-t-full bg-sand-200/70" />

              {heroArches.map((arch) =>
                arch.destination ? (
                  <figure
                    key={arch.key}
                    // Shadow on the wrapper so the clip below doesn't cut it off.
                    className={`absolute drop-shadow-[0_16px_20px_rgba(11,39,53,0.16)] ${arch.box}`}
                  >
                    <div
                      className="absolute inset-0 bg-sand-200"
                      style={{ clipPath: `path("${archPath(arch.width, arch.height, arch.drop)}")` }}
                    >
                      {/* Oversized by 16% so the photo can drift on scroll without
                          showing an edge; the centre arch drifts most. */}
                      <Image
                        src={imageUrl(
                          arch.destination.image,
                          Math.round(arch.width * 2.32),
                          { height: Math.round(arch.height * 2.32), quality: 88 },
                        )}
                        alt={arch.destination.name}
                        fill
                        priority={arch.key === "centre"}
                        sizes={`${Math.round(arch.width * 1.16)}px`}
                        className="hero-parallax object-cover"
                        style={{ "--drift": arch.key === "centre" ? "6%" : "4%" } as React.CSSProperties}
                      />
                    </div>
                  </figure>
                ) : null,
              )}

              <svg
                viewBox="0 0 400 220"
                aria-hidden="true"
                className="absolute left-0 top-0 h-[220px] w-[400px] text-ink"
              >
                <path
                  d="M16 208 C4 124 112 32 248 14 C290 9 322 9 346 11"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.5"
                  strokeWidth="1.25"
                  strokeDasharray="4 5"
                  strokeLinecap="round"
                />
              </svg>
              <Plane
                aria-hidden="true"
                className="absolute left-[348px] top-0 h-8 w-8 rotate-45 fill-ink text-ink"
                strokeWidth={1.25}
              />
            </div>
          </div>

          <div className="mt-8">
            <SearchWidget
              destinations={destinations}
              experiences={experiences}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="w-full text-sm font-semibold text-navy-500 sm:w-auto">
              Popular:
            </span>
            {[
              {
                label: "Kashmir in spring",
                href: "/tours?destination=kashmir",
              },
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
      </div>

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
