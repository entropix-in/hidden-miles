import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Compass,
  HeartHandshake,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ExperienceIcon } from "@/components/site/experience-icon";
import { loadExperiences } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Honeymoons, spiritual journeys, Himalayan adventures, family holidays, luxury escapes and women-only tours — find the Hidden Miles experience that fits you.",
};

const steps = [
  {
    title: "Tell us your dream",
    text: "A call, a WhatsApp message or a form. We listen for the details that matter — pace, people, budget, the things you have always wanted to see.",
  },
  {
    title: "We design it around you",
    text: "A real travel expert builds your itinerary, checks availability and sends a clear, all-inclusive quote within one working day.",
  },
  {
    title: "We fine-tune together",
    text: "Swap a hotel, add a day, change the pace. We keep refining until the plan feels exactly right — no pressure, no hidden costs.",
  },
  {
    title: "You travel, we handle the rest",
    text: "Flights, transfers, stays, guides and 24×7 support. Your tour leader takes care of the details so you can be fully present.",
  },
];

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  const experiences = await loadExperiences();

  return (
    <>
      <PageHero
        eyebrow="Experiences"
        title="Travel the way you like to travel."
        description="The same destination can feel completely different depending on how you experience it. Tell us who you are travelling with and what you love, and we will match the journey to you."
        breadcrumbs={[{ label: "Experiences" }]}
      >
        <div className="rounded-[28px] border border-stone-200 bg-white p-6">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <p className="mt-4 font-display text-2xl font-medium leading-snug text-navy-950">
            “The best holidays are the ones that feel like they were made for
            you.”
          </p>
          <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.16em] text-stone-400">
            The Hidden Miles promise
          </p>
        </div>
      </PageHero>

      <section className="container-page py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          {experiences.map((experience, index) => (
            <article
              key={experience.slug}
              className="group overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_14px_50px_-38px_rgba(6,42,38,0.5)] transition duration-500 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={imageUrl(experience.image, 1200)}
                  alt={experience.title}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-blue-700 backdrop-blur">
                  <ExperienceIcon icon={experience.icon} />
                </span>
                <span className="absolute bottom-5 left-5 text-sm font-extrabold uppercase tracking-[0.18em] text-sand-50">
                  0{index + 1} · Hidden Miles experience
                </span>
              </div>
              <div className="p-6 sm:p-7">
                <h2 className="font-display text-3xl font-medium text-navy-950">
                  {experience.title}
                </h2>
                <p className="mt-2.5 text-[14px] leading-7 text-stone-600">
                  {experience.description}
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {experience.highlights.map((highlight) => (
                    <p
                      key={highlight}
                      className="flex items-center gap-2 text-sm font-bold text-stone-600"
                    >
                      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-navy-100 text-navy-700">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {highlight}
                    </p>
                  ))}
                </div>
                <Link
                  href={`/tours?experience=${experience.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.16em] text-blue-700 transition hover:text-blue-800"
                >
                  View {experience.shortTitle.toLowerCase()} journeys
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-navy-950 py-16 text-sand-50 sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow text-blue-300">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight sm:text-4xl">
              From first hello to happy memories.
            </h2>
            <p className="mt-4 text-sm leading-7 text-sand-200/70">
              No call centres, no copy-paste itineraries. A real person plans
              your holiday, start to finish.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[26px] border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500 font-display text-sm font-semibold text-white">
                  0{index + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-sand-200/65">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Start planning
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tours"
              className="btn border border-white/25 bg-white/10 text-sand-50 backdrop-blur transition hover:bg-white/20"
            >
              <Compass className="h-4 w-4" />
              Browse tour packages
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              title: "Real humans, always",
              text: "Call, WhatsApp or email. The same team answers before and during your trip.",
            },
            {
              icon: HeartHandshake,
              title: "Care for every traveller",
              text: "Elders, kids, solo travellers — we plan for the people, not just the places.",
            },
            {
              icon: Sparkles,
              title: "Little extras",
              text: "Surprise dinners, local guides and the small touches that make a trip.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[26px] border border-stone-200 bg-white p-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sand-200 text-blue-700">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-navy-950">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
