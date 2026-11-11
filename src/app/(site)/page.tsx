import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Compass,
  Headset,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { SearchWidget } from "@/components/site/search-widget";
import { SectionHeading } from "@/components/site/section-heading";
import { TourCard } from "@/components/site/tour-card";
import { DestinationCard } from "@/components/site/destination-card";
import { ExperienceIcon } from "@/components/site/experience-icon";
import type { Destination } from "@/data/destinations";
import { site, stats, trustPoints } from "@/data/site";
import {
  loadDestinations,
  loadExperiences,
  loadTestimonials,
  loadTours,
} from "@/lib/content";
import { formatINR, imageUrl } from "@/lib/utils";

const heroImage =
  "https://images.unsplash.com/photo-1593181629936-11c609b8db9b";
const ctaImage =
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a";

const trustIcons = [Wallet, BadgeCheck, Headset, ShieldCheck];

const bentoDestinations = ["kashmir", "kerala", "rajasthan", "europe", "bali"];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tours, destinations, experiences, testimonials] = await Promise.all([
    loadTours(),
    loadDestinations(),
    loadExperiences(),
    loadTestimonials(),
  ]);

  const featuredTours = tours.filter((tour) => tour.featured);
  const featuredSelection = (featuredTours.length ? featuredTours : tours).slice(
    0,
    6,
  );
  const preferredBento = bentoDestinations
    .map((slug) => destinations.find((item) => item.slug === slug))
    .filter((item): item is Destination => Boolean(item));
  const bento = preferredBento.length
    ? preferredBento
    : destinations.slice(0, 5);
  const spotlight =
    tours.find((tour) => tour.slug === "magical-kashmir") ??
    featuredTours[0] ??
    tours[0];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950">
        <Image
          src={imageUrl(heroImage, 1920)}
          alt="A shikara drifting across Dal Lake in Kashmir"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-navy-950/20" />

        <div className="container-page relative flex min-h-[660px] flex-col justify-center pb-40 pt-16 sm:min-h-[700px] sm:pb-44 sm:pt-20 lg:min-h-[720px]">
          <div className="animate-rise max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.2em] text-sand-50 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              Crafting journeys since 1984
            </span>
            <h1 className="mt-6 font-display text-[44px] font-medium leading-[1.03] tracking-tight text-sand-50 sm:text-6xl lg:text-[72px]">
              Gift yourself a journey that
              <span className="text-blue-400"> stays with you.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-sand-100/80 sm:text-base">
              Thoughtfully planned group tours, family holidays and private
              escapes across India and the world. Every detail handled, so you
              can simply be present.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/tours" className="btn-primary">
                Explore tour packages
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="btn inline-flex border border-white/25 bg-white/10 text-sand-50 backdrop-blur transition hover:bg-white/20"
              >
                Talk to a travel expert
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <div className="flex -space-x-2.5">
                {[
                  ["A", "bg-blue-500"],
                  ["R", "bg-navy-500"],
                  ["M", "bg-rose-400"],
                  ["S", "bg-sky-500"],
                ].map(([initial, color]) => (
                  <span
                    key={initial}
                    className={`grid h-9 w-9 place-items-center rounded-full border-2 border-navy-950 text-sm font-extrabold text-white ${color}`}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <div>
                <span className="flex items-center gap-1 text-gold-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-3.5 w-3.5 fill-current"
                    />
                  ))}
                  <span className="ml-1 text-sm font-extrabold text-sand-50">
                    4.9 / 5
                  </span>
                </span>
                <p className="mt-1 text-sm font-semibold tracking-wide text-sand-200/70">
                  Loved by 12,400+ verified travellers
                </p>
              </div>
            </div>
          </div>

          {spotlight ? (
            <div className="animate-float-slow absolute right-8 top-28 hidden w-64 xl:block">
              <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 text-sand-50 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-300">
                    This week&apos;s favourite
                  </span>
                  <Compass className="h-4 w-4 text-sand-200/70" />
                </div>
                <p className="mt-3 font-display text-2xl font-semibold">
                  {spotlight.title}
                </p>
                <p className="mt-1 text-sm font-semibold text-sand-200/70">
                  {spotlight.nights} nights · {spotlight.days} days · From{" "}
                  {formatINR(spotlight.price)}
                </p>
                <Link
                  href={`/tours/${spotlight.slug}`}
                  className="mt-4 flex items-center justify-between rounded-full bg-sand-50 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider text-navy-950"
                >
                  View journey
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="container-page relative z-10 -mt-24 sm:-mt-28">
        <SearchWidget destinations={destinations} experiences={experiences} />
        <div className="mt-4 grid gap-2 rounded-[26px] border border-stone-200/80 bg-white/85 p-3 shadow-lg shadow-navy-950/5 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point, index) => {
            const Icon = trustIcons[index];
            return (
              <div
                key={point.title}
                className="flex items-start gap-3 rounded-2xl px-3 py-3 transition hover:bg-sand-100"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-950 text-blue-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-navy-950">
                    {point.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-stone-500">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Book your dream holiday"
          title="Find your kind of escape"
          description="Whether you are travelling with family, chasing the aurora or stealing a week away together, there is a Hidden Miles journey built for exactly that."
          href="/experiences"
          linkLabel="All experiences"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((experience) => (
            <Link
              key={experience.slug}
              href={`/tours?experience=${experience.slug}`}
              className="group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-[26px] p-5 text-sand-50 shadow-lg shadow-navy-950/10"
            >
              <Image
                src={imageUrl(experience.image, 800)}
                alt={experience.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/50 to-navy-950/10" />
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white/15 text-blue-300 backdrop-blur">
                <ExperienceIcon icon={experience.icon} />
              </span>
              <div className="relative">
                <h3 className="font-display text-2xl font-semibold">
                  {experience.shortTitle}
                </h3>
                <p className="mt-1.5 max-w-[90%] text-sm leading-5 text-sand-100/75">
                  {experience.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-[0.16em] text-blue-300">
                  Explore
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-sand-100/70 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Handpicked for the season"
            title="This season's most-loved journeys"
            description="Our travel experts' favourite departures right now — the ones guests keep writing to us about."
            href="/tours"
            linkLabel="View all tours"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSelection.map((tour, index) => (
              <TourCard key={tour.slug} tour={tour} priority={index < 3} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/tours" className="btn-outline">
              See all {tours.length} tour packages
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[36px] bg-navy-950 px-6 py-12 text-sand-50 sm:px-10 lg:px-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-navy-400/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1.4fr] lg:items-center">
            <div>
              <p className="eyebrow text-blue-300">Our legacy</p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight sm:text-4xl">
                Four decades of going the extra mile.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-sand-200/70">
                What started as one family&apos;s love for showing people the
                world has become a travel company trusted by over a million
                guests. Some things never change: we still treat every trip like
                it is our own.
              </p>
              <Link href="/about" className="btn-light mt-6">
                Our story
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-4xl font-medium text-blue-300">
                    {stat.value}
                    <span className="text-2xl">{stat.suffix}</span>
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-4 text-sand-200/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <SectionHeading
          eyebrow="Where will you go next?"
          title="Destinations our travellers adore"
          description="From the backwaters of Kerala to the canals of Amsterdam — start with a place, and we will shape the rest."
          href="/destinations"
          linkLabel="All destinations"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bento.map((destination, index) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              tourCount={tours.filter((tour) => tour.destinationSlug === destination.slug).length}
              priority={index === 0}
              className={
                index === 0
                  ? "sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-full"
                  : ""
              }
            />
          ))}
        </div>
      </section>

      <section className="bg-sand-100/70 py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src={imageUrl(
                  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
                  1000,
                )}
                alt="A houseboat drifting through the Kerala backwaters"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -right-3 rounded-3xl border border-stone-200 bg-white p-5 shadow-2xl shadow-navy-950/15 sm:-right-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-blue-700">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-display text-xl font-semibold text-navy-950">
                    100% safe
                  </p>
                  <p className="text-sm font-semibold text-stone-500">
                    Handpicked stays & leaders
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Why travel with Hidden Miles</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-navy-950 sm:text-4xl">
              The details are our favourite part.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-7 text-stone-600">
              Anyone can book a hotel. We obsess over the small things that turn
              a good holiday into a story you tell for years — the corner-room
              upgrade, the local lunch nobody else knows about, the leader who
              remembers your name on day one.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Tour leaders who feel like friends",
                "Handpicked, personally vetted stays",
                "Transparent, all-inclusive pricing",
                "Support that answers, every time",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-600 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <p className="text-sm font-bold leading-5 text-navy-950">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/about" className="btn-dark">
                Meet Hidden Miles
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-2 text-sm font-extrabold text-navy-950 transition hover:text-blue-700"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-sand-200 text-blue-700">
                  <Phone className="h-4 w-4" />
                </span>
                {site.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="My Hidden Miles story"
          title="The best reviews come from the heart"
          description="A few words from travellers who let us plan their holidays — and then came back for the next one."
          href="/testimonials"
          linkLabel="All guest stories"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-30px_rgba(6,42,38,0.4)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-0.5 text-gold-500">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </span>
                <Quote className="h-8 w-8 text-sand-300" />
              </div>
              <blockquote className="mt-4 flex-1 text-[14px] leading-7 text-stone-600">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-dashed border-stone-200 pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-950 font-display text-sm font-semibold text-blue-300">
                  {testimonial.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-extrabold text-navy-950">
                    {testimonial.name}
                  </p>
                  <p className="text-sm font-semibold text-stone-400">
                    {testimonial.city} · {testimonial.tour}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-outline">
            <MapPin className="h-4 w-4" />
            Visit a Hidden Miles office
          </Link>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="relative isolate overflow-hidden rounded-[36px] px-6 py-16 text-center text-sand-50 sm:px-12 sm:py-20">
          <Image
            src={imageUrl(ctaImage, 1800)}
            alt="Paris at sunset"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/75 to-blue-950/60" />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow justify-center text-blue-300">
              Your next great story
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.1] sm:text-5xl">
              Let&apos;s plan something worth remembering.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-sand-100/75">
              Tell us where you are dreaming of. A Hidden Miles expert will call you
              within one working day with ideas, honest advice and a plan that
              fits.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-primary">
                Plan my holiday
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href={site.phoneHref}
                className="btn border border-white/25 bg-white/10 text-sand-50 backdrop-blur transition hover:bg-white/20"
              >
                Call {site.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
