import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Anchor,
  ArrowUpRight,
  Check,
  Compass,
  MapPin,
  Ship,
  Users,
  Waves,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { loadDestinations } from "@/lib/content";
import { formatINR, imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cruises",
  description:
    "Ocean, river, expedition and family cruises across the Mediterranean, Norway, the Arabian Sea and beyond — planned with stays, transfers and shore experiences.",
};

export const dynamic = "force-dynamic";

const cruiseStyles = [
  {
    icon: Ship,
    title: "Ocean cruises",
    description:
      "Classic sea voyages with big-ship comfort, multiple ports and something for every age on board.",
  },
  {
    icon: Waves,
    title: "River cruises",
    description:
      "Slow travel through the heart of Europe and Asia, docking in small towns that big ships cannot reach.",
  },
  {
    icon: Compass,
    title: "Expedition cruises",
    description:
      "Fjords, glaciers and remote coastlines with expert naturalists and small-ship access.",
  },
  {
    icon: Users,
    title: "Family cruises",
    description:
      "Kids' clubs, flexible dining and easy days at sea — a holiday that works for three generations.",
  },
];

const sailings = [
  {
    title: "Mediterranean Icons",
    route: "Barcelona → Marseille → Florence → Rome",
    nights: 7,
    days: 8,
    price: 189990,
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077",
    highlights: ["Ocean cruise", "Three countries", "Shore excursions"],
  },
  {
    title: "Norwegian Fjords",
    route: "Bergen → Geiranger → Flåm → Bergen",
    nights: 6,
    days: 7,
    price: 164990,
    image: "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43",
    highlights: ["Expedition style", "Fjord scenery", "Small ship"],
  },
  {
    title: "Arabian Sea Escape",
    route: "Mumbai → Muscat → Dubai",
    nights: 4,
    days: 5,
    price: 74990,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    highlights: ["Short escape", "Two countries", "Family friendly"],
  },
];

export default async function CruisePage() {
  const destinations = await loadDestinations();

  return (
    <>
      <PageHero
        eyebrow="Cruises"
        title="See the world from the water."
        description="Unpack once and wake up somewhere new. We plan ocean, river and expedition cruises with the flights, transfers, stays and shore experiences wrapped around them."
        breadcrumbs={[{ label: "Cruises" }]}
      >
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-lg shadow-navy-950/5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-blue-700">
            <Anchor className="h-5 w-5" />
          </span>
          <p className="mt-4 font-display text-3xl font-semibold text-navy-950">
            3 – 14 nights
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-wider text-stone-400">
            Sailing options
          </p>
          <p className="mt-4 flex items-center gap-2 border-t border-dashed border-stone-200 pt-4 text-sm font-semibold text-stone-500">
            <Check className="h-4 w-4 text-navy-600" />
            Flights, transfers and shore plans included
          </p>
        </div>
      </PageHero>

      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Choose your cruise"
          title="A different way to travel"
          description="Tell us the pace and the people, and we will match the ship and the route."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cruiseStyles.map((style) => (
            <article
              key={style.title}
              className="rounded-[26px] border border-stone-200 bg-white p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-950 text-blue-300">
                <style.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-950">
                {style.title}
              </h3>
              <p className="mt-1.5 text-sm leading-7 text-stone-600">
                {style.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-sand-100/70 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Featured sailings"
            title="Cruises worth setting sail for"
            description="Sample routes to start the conversation. Every sailing can be adjusted for cabin category, dates and add-on stays."
            href="/contact"
            linkLabel="Plan a cruise"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sailings.map((sailing, index) => (
              <article
                key={sailing.title}
                className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-stone-200/80 bg-white shadow-[0_10px_40px_-24px_rgba(6,42,38,0.35)]"
              >
                <Link
                  href="/contact"
                  className="relative block aspect-[4/3] overflow-hidden"
                  aria-label={`Enquire about ${sailing.title}`}
                >
                  <Image
                    src={imageUrl(sailing.image, 900)}
                    alt={sailing.title}
                    fill
                    priority={index < 3}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-sand-50 backdrop-blur">
                    <Ship className="h-3.5 w-3.5" />
                    {sailing.nights}N / {sailing.days}D
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-[0.16em] text-blue-700">
                    <MapPin className="h-3.5 w-3.5" />
                    {sailing.route}
                  </p>
                  <h3 className="mt-2 font-display text-[22px] font-semibold leading-snug text-navy-950">
                    {sailing.title}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {sailing.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="rounded-full bg-sand-100 px-3 py-1.5 text-sm font-semibold text-stone-600"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-stone-200 pt-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-stone-400">
                        From
                      </p>
                      <p className="mt-0.5 font-display text-xl font-semibold text-navy-950">
                        {formatINR(sailing.price)}
                      </p>
                      <p className="text-sm font-semibold text-stone-400">
                        per person
                      </p>
                    </div>
                    <Link
                      href="/contact"
                      aria-label={`Enquire about ${sailing.title}`}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand-100 text-navy-950 transition duration-300 group-hover:bg-blue-600 group-hover:text-white"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow">Plan your sailing</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-navy-950 sm:text-4xl">
              Tell us where you would like to wake up.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-stone-600">
              Share your dates, who is travelling and the kind of cruise you
              have in mind. We will come back with ships, routes and a clear
              quote — flights and transfers included.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Cabin and ship recommendations",
                "Flights, transfers and pre/post stays",
                "Shore excursions and port days",
                "Visa and documentation guidance",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm font-semibold text-stone-700"
                >
                  <Check className="h-4 w-4 text-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <EnquiryForm
            destinations={destinations}
            className="border border-stone-200 shadow-xl shadow-navy-950/5"
          />
        </div>
      </section>
    </>
  );
}
