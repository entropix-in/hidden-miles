import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CalendarRange,
  Check,
  ConciergeBell,
  Flag,
  Gem,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";
import { Contours } from "@/components/site/contours";
import { CorporateProposalForm } from "@/components/site/corporate-proposal-form";
import { FeatureTile } from "@/components/site/feature-tile";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { loadExperiences } from "@/lib/content";

export const metadata: Metadata = {
  title: "Corporate Travel",
  description:
    "Offsites, incentives and events people actually remember — planned by one team, end to end.",
};

export const dynamic = "force-dynamic";

export default async function CorporatePage() {
  const experiences = await loadExperiences();
  const heroImage =
    experiences.find((experience) => experience.slug === "family")?.image ??
    experiences[0]?.image;

  return (
    <>
      <PageHero
        items={[{ label: "Home", href: "/" }, { label: "Corporate" }]}
        title="Corporate travel,"
        accent="minus the headache."
        description="Offsites, incentives and events people actually remember — planned by one team, end to end."
        image={heroImage ?? ""}
        imageAlt="A corporate offsite"
        coords="SPITI · 32.24° N  78.03° E"
      >
        <div className="flex flex-wrap gap-3">
          <Link href="#proposal" className="btn btn-ink btn-lg">
            Request a proposal
            <span className="btn-dot">→</span>
          </Link>
          <a href="/contact" className="btn btn-outline btn-lg">
            Download deck
          </a>
        </div>
      </PageHero>

      <section className="container-page pb-16">
        <p className="type-label text-center text-navy-500">
          Trusted by 300+ teams across India
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-y border-sand-300 py-6">
          {["NORTHWIND", "Acme Labs", "BLUEPEAK", "Finch & Co", "ORBITAL", "Kestrel"].map(
            (name) => (
              <span
                key={name}
                className="text-lg font-extrabold tracking-[0.04em] text-navy-300"
              >
                {name}
              </span>
            ),
          )}
        </div>
      </section>

      <section className="bg-sand-100">
        <div className="container-page section-major">
          <SectionHeading
            number="01"
            label="What we do"
            title="Built for groups"
            accent="of 20 to 2,000."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureTile
              icon={<Flag className="h-5 w-5" />}
              title="Corporate offsites"
              description="Strategy days in the hills or by the sea."
            />
            <FeatureTile
              icon={<Sparkles className="h-5 w-5" />}
              title="Incentive travel"
              description="Trips that reward and motivate your best people."
            />
            <FeatureTile
              icon={<Building2 className="h-5 w-5" />}
              title="MICE & conferences"
              description="Venues, AV, delegates and stays — handled."
            />
            <FeatureTile
              icon={<Gem className="h-5 w-5" />}
              title="Leadership retreats"
              description="Quiet, beautiful places to think big."
            />
            <FeatureTile
              icon={<Users className="h-5 w-5" />}
              title="Team-building journeys"
              description="Treks, regattas and cook-offs that bond teams."
            />
            <FeatureTile
              icon={<Layers className="h-5 w-5" />}
              title="Multi-city programmes"
              description="Several cities, one seamless itinerary."
            />
          </div>
        </div>
      </section>

      <section
        id="proposal"
        className="on-ink relative isolate scroll-mt-24 overflow-hidden bg-ink"
      >
        <Contours cx={0.2} cy={0.6} count={8} color="rgba(255,255,255,0.05)" />
        <div className="container-page relative section-major">
          <div className="grid gap-12 xl:grid-cols-[1fr_520px] xl:gap-24">
            <div>
              <SectionHeading
                number="02"
                label="Why teams choose us"
                title="The details are"
                accent="the difference."
                dark
              />
              <div className="mt-9 space-y-6">
                {[
                  {
                    title: "One team, end to end",
                    description:
                      "A dedicated account manager from brief to wrap-up.",
                    icon: ConciergeBell,
                  },
                  {
                    title: "Risk handled quietly",
                    description:
                      "Insurance, medical cover and contingency plans built in.",
                    icon: Check,
                  },
                  {
                    title: "Clean, compliant billing",
                    description:
                      "GST invoices, cost centres and one consolidated bill.",
                    icon: CalendarRange,
                  },
                ].map((point) => (
                  <div key={point.title} className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-gold-400 text-ink">
                      <point.icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="type-title block text-paper">{point.title}</span>
                      <span className="type-small mt-1 block text-navy-200">
                        {point.description}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <CorporateProposalForm />
          </div>
        </div>
      </section>
    </>
  );
}
