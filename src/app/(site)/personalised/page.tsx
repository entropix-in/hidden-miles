import type { Metadata } from "next";
import {
  CalendarDays,
  Compass,
  HeartHandshake,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { loadDestinations } from "@/lib/content";

export const metadata: Metadata = {
  title: "Personalised Holidays",
  description:
    "Personalised holidays designed around your dates, pace and people. Honeymoons, family trips, milestone celebrations and private journeys across India and the world.",
};

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Tell us your dream",
    description:
      "A call, a WhatsApp message or the form. We listen for the details that matter — pace, people, budget and the places you have always wanted to see.",
  },
  {
    title: "We design it around you",
    description:
      "A real travel expert builds your itinerary, checks availability and sends a clear, all-inclusive quote within one working day.",
  },
  {
    title: "We fine-tune together",
    description:
      "Swap a hotel, add a day, change the pace. We keep refining until the plan feels exactly right — no pressure, no hidden costs.",
  },
  {
    title: "You travel, we handle the rest",
    description:
      "Flights, transfers, stays, guides and 24×7 support. Your tour leader takes care of the details so you can be fully present.",
  },
];

const tailorIdeas = [
  {
    icon: HeartHandshake,
    title: "Honeymoons & celebrations",
    description:
      "Private villas, intimate dinners and just enough adventure — designed for the two of you.",
  },
  {
    icon: Users,
    title: "Family & multi-generation trips",
    description:
      "Easy pacing, connecting rooms and something for every age, from toddlers to grandparents.",
  },
  {
    icon: Sparkles,
    title: "Milestone occasions",
    description:
      "Birthdays, anniversaries and reunions with a journey people will talk about for years.",
  },
  {
    icon: MapPin,
    title: "Private group journeys",
    description:
      "Your own departure with friends or extended family, on dates that actually work for everyone.",
  },
  {
    icon: Compass,
    title: "Special-interest travel",
    description:
      "Photography, food, wildlife, temples or trekking — built around what you love most.",
  },
  {
    icon: CalendarDays,
    title: "Flexible dates & pacing",
    description:
      "No fixed departures. Travel when you want, for as long as you want, at your own rhythm.",
  },
];

export default async function PersonalisedPage() {
  const destinations = await loadDestinations();

  return (
    <>
      <PageHero
        eyebrow="Personalised holidays"
        title="A holiday built around you, not a brochure."
        description="Tell us who you are travelling with, what you love and how you like to move. We will shape the route, the stays and the little details around you — then handle everything in between."
        breadcrumbs={[{ label: "Personalised holidays" }]}
      >
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-lg shadow-navy-950/5">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <p className="mt-4 font-display text-2xl font-medium leading-snug text-navy-950">
            “No fixed departures. No template itineraries. Just your trip.”
          </p>
          <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.16em] text-stone-400">
            Made to measure
          </p>
        </div>
      </PageHero>

      <section className="container-page py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[26px] border border-stone-200 bg-white p-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-950 font-display text-lg font-semibold text-blue-300">
                {index + 1}
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-navy-950">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand-100/70 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="eyebrow">What we can tailor</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-navy-950 sm:text-4xl">
              Any journey, shaped around your people.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-stone-600">
              Start with a destination or simply a feeling. We will turn it into
              a route that fits your dates, budget and the way you like to
              travel.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {tailorIdeas.map((idea) => (
                <div
                  key={idea.title}
                  className="rounded-[24px] border border-stone-200 bg-white p-5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-700">
                    <idea.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-navy-950">
                    {idea.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-stone-500">
                    {idea.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <EnquiryForm
              destinations={destinations}
              className="border border-stone-200 shadow-xl shadow-navy-950/5"
            />
          </div>
        </div>
      </section>
    </>
  );
}
