import type { Metadata } from "next";
import {
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  HeartHandshake,
  Presentation,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { loadDestinations } from "@/lib/content";

export const metadata: Metadata = {
  title: "Corporate Tours",
  description:
    "Corporate offsites, incentive travel, MICE, conferences and leadership retreats across India and the world. End-to-end planning with dedicated support.",
};

export const dynamic = "force-dynamic";

const offerings = [
  {
    icon: Briefcase,
    title: "Corporate offsites",
    description:
      "Annual offsites that mix strategy time with genuinely good experiences — planned around your team and your goals.",
  },
  {
    icon: Trophy,
    title: "Incentive travel",
    description:
      "Reward top performers with a journey worth working for. We handle the surprise, the logistics and the recognition moments.",
  },
  {
    icon: Presentation,
    title: "MICE & conferences",
    description:
      "Venue sourcing, accommodation, transport, AV and delegate management for meetings, incentives, conferences and exhibitions.",
  },
  {
    icon: Users,
    title: "Leadership retreats",
    description:
      "Quiet, well-connected places with the space to think, bond and plan — plus seamless support behind the scenes.",
  },
  {
    icon: HeartHandshake,
    title: "Team-building journeys",
    description:
      "Shared challenges and local experiences that bring teams closer without feeling like forced fun.",
  },
  {
    icon: Building2,
    title: "Multi-city & multi-team",
    description:
      "Complex movements across cities or countries, coordinated by one team with a single point of contact.",
  },
];

const reasons = [
  {
    icon: CalendarCheck,
    title: "One team, end to end",
    description:
      "From the first brief to the final transfer, a dedicated account manager and on-ground team stay with you.",
  },
  {
    icon: ShieldCheck,
    title: "Risk handled quietly",
    description:
      "Verified partners, clear escalation paths, travel insurance guidance and 24×7 support for every group.",
  },
  {
    icon: Users,
    title: "Built for groups",
    description:
      "Rooming lists, dietary needs, accessibility, arrivals and departures — the details that make or break a corporate trip.",
  },
  {
    icon: Briefcase,
    title: "Clean, compliant billing",
    description:
      "Transparent quotes, GST-compliant invoicing and documentation your finance team will be happy with.",
  },
];

export default async function CorporatePage() {
  const destinations = await loadDestinations();

  return (
    <>
      <PageHero
        eyebrow="Corporate tours"
        title="Offsites, incentives and events people remember."
        description="Bring your team together somewhere worth going. We plan corporate journeys across India and the world with the logistics, flexibility and quiet reliability that corporate travel demands."
        breadcrumbs={[{ label: "Corporate tours" }]}
      >
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-lg shadow-navy-950/5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-display text-3xl font-semibold text-navy-950">
                500+
              </p>
              <p className="mt-1 text-sm font-bold uppercase tracking-wider text-stone-400">
                Groups hosted
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-navy-950">
                60+
              </p>
              <p className="mt-1 text-sm font-bold uppercase tracking-wider text-stone-400">
                Destinations
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-navy-950">
                24×7
              </p>
              <p className="mt-1 text-sm font-bold uppercase tracking-wider text-stone-400">
                Support
              </p>
            </div>
          </div>
          <p className="mt-5 flex items-center gap-2 border-t border-dashed border-stone-200 pt-4 text-sm font-semibold text-stone-500">
            <Check className="h-4 w-4 text-navy-600" />
            GST-compliant invoicing and clear documentation
          </p>
        </div>
      </PageHero>

      <section className="container-page py-16">
        <SectionHeading
          eyebrow="What we plan"
          title="Corporate travel, without the corporate headache"
          description="Whether it is 15 people or 500, a single city or four countries, we build the programme around your objectives and handle the moving parts."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((offering) => (
            <article
              key={offering.title}
              className="rounded-[28px] border border-stone-200 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-navy-950/5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-blue-700">
                <offering.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-navy-950">
                {offering.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                {offering.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-sand-100/70 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why teams travel with us"
            title="The details are the difference"
            description="Good corporate travel is invisible. Everything works, everyone is looked after, and your team comes back with a story worth telling."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="flex items-start gap-4 rounded-[26px] border border-stone-200 bg-white p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-950 text-blue-300">
                  <reason.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy-950">
                    {reason.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7 text-stone-600">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow">Request a proposal</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-navy-950 sm:text-4xl">
              Tell us about your team and your brief.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-stone-600">
              Share your dates, group size and what you want the trip to
              achieve. A corporate travel expert will come back within one
              working day with ideas, options and a clear quote.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Dedicated account manager",
                "Venue and stay sourcing",
                "Transport and group logistics",
                "On-ground coordination and 24×7 support",
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
