import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Compass,
  HandHeart,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { site, stats } from "@/data/site";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Hidden Miles has been crafting thoughtful holidays since 1984. Meet the people, the philosophy and the promise behind every journey.",
};

const timeline = [
  {
    year: "1984",
    title: "One family, one idea",
    text: "We began with a simple belief: travel should feel personal. The first Hidden Miles group tour took 18 guests through Rajasthan.",
  },
  {
    year: "1998",
    title: "Beyond India",
    text: "Our first international departures to Europe and South-East Asia opened a new chapter — and new friendships across borders.",
  },
  {
    year: "2010",
    title: "A million memories",
    text: "Crossed a million happy travellers. Opened regional offices so every guest has local support before and during their trip.",
  },
  {
    year: "2026",
    title: "Still curious",
    text: "Today we design journeys across 60+ destinations, with the same care our founders put into that first Rajasthan departure.",
  },
];

const values = [
  {
    icon: HandHeart,
    title: "Care, always",
    text: "We plan for the people, not just the places. Every itinerary is checked for comfort, pace and the little things that matter.",
  },
  {
    icon: Compass,
    title: "Curiosity first",
    text: "We look for the local lunch, the quiet viewpoint, the story behind a temple. The extra mile is where the best memories live.",
  },
  {
    icon: BadgeCheck,
    title: "Honest by default",
    text: "Clear inclusions, fair pricing and no surprises. If something is not included, we say so before you book.",
  },
  {
    icon: Users,
    title: "Better together",
    text: "Our leaders and travellers become a group, then friends. Many of our guests return with the same faces year after year.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="Since 1984, we have been in the business of memories."
        description="Hidden Miles is an Indian travel company built on the belief that a holiday should feel effortless, personal and a little magical. Four decades and 1.2 million travellers later, that belief still leads every decision we make."
        breadcrumbs={[{ label: "About us" }]}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-xl shadow-navy-950/10">
          <Image
            src={imageUrl(
              "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
              1000,
            )}
            alt="Travellers exploring the hills of north-east India"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-3 backdrop-blur">
            <p className="font-display text-2xl font-semibold text-navy-950">
              42 years
            </p>
            <p className="text-sm font-bold uppercase tracking-wider text-stone-400">
              Of happy holidays
            </p>
          </div>
        </div>
      </PageHero>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
              <Image
                src={imageUrl(
                  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
                  1100,
                )}
                alt="A quiet morning on the Kerala backwaters"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-3 w-52 rounded-[26px] border border-stone-200 bg-white p-5 shadow-2xl shadow-navy-950/15 sm:-right-6">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <p className="mt-3 font-display text-lg font-semibold leading-snug text-navy-950">
                Travel with people who genuinely care.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="eyebrow">The Hidden Miles way</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-navy-950 sm:text-4xl">
              We sweat the small stuff, so your holiday feels big.
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-8 text-stone-600">
              <p>
                A holiday is made of small moments: the window seat on the train,
                the guide who knows the best chai stall, the hotel that upgrades
                you without being asked. We have spent four decades learning
                where those moments hide.
              </p>
              <p>
                Our team travels the routes we sell. We stay in the hotels, eat
                at the restaurants and walk the streets — so when we recommend
                something, it comes from experience, not a brochure.
              </p>
              <p>
                And when things do not go to plan, we are the people who pick up
                the phone. That has always been the Hidden Miles way.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/tours" className="btn-primary">
                Explore our journeys
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3.5 text-sm font-bold text-navy-950 transition hover:border-blue-500 hover:text-blue-700"
              >
                Call {site.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-100/70 py-16">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-6 rounded-[32px] border border-stone-200 bg-white p-8 sm:grid-cols-4 sm:p-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl font-medium text-navy-950 sm:text-5xl">
                  {stat.value}
                  <span className="text-2xl text-blue-600">{stat.suffix}</span>
                </p>
                <p className="mt-2 text-sm font-bold leading-4 text-stone-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="max-w-2xl">
          <p className="eyebrow">The journey so far</p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-navy-950 sm:text-4xl">
            Four decades, one constant: curiosity.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {timeline.map((item, index) => (
            <div
              key={item.year}
              className="relative rounded-[26px] border border-stone-200 bg-white p-6"
            >
              <span className="absolute right-5 top-5 text-sm font-extrabold uppercase tracking-widest text-stone-300">
                0{index + 1}
              </span>
              <p className="font-display text-3xl font-semibold text-blue-600">
                {item.year}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold text-navy-950">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-950 py-16 text-sand-50 sm:py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow text-blue-300">What we stand for</p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight sm:text-4xl">
                Values that travel with us.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-sand-200/70">
                These are not posters on a wall. They are the questions we ask
                before we send anyone on a Hidden Miles holiday.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500 text-white">
                    <value.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-sand-200/65">
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[32px] border border-stone-200 bg-white px-6 py-10 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="eyebrow">Come travel with us</p>
            <h2 className="mt-2 font-display text-2xl font-medium text-navy-950 sm:text-3xl">
              The next story could be yours.
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Tell us where you are dreaming of — we will take it from there.
            </p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Plan my holiday
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
