import type { Metadata } from "next";
import {
  Clock,
  Flag,
  Heart,
  PenLine,
  Smile,
  Sparkles,
} from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { FeatureTile } from "@/components/site/feature-tile";
import { SectionHeading } from "@/components/site/section-heading";
import { PersonalisedPlanner } from "@/components/site/personalised-planner";

export const metadata: Metadata = {
  title: "Personalised Holidays",
  description:
    "A holiday built around you, not a brochure. Tell us who's travelling and what you love — a Hidden Miles specialist designs the rest.",
};

export default function PersonalisedPage() {
  return (
    <>
      <section className="container-page pt-8 md:pt-12">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_480px] lg:gap-12">
          <div>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Personalised" }]} />
            <h1 className="type-h1 mt-5 text-ink">
              A holiday built
              <br />
              <span className="accent-line">around you.</span>
            </h1>
            <p className="type-lead mt-5 max-w-[460px] text-navy-700">
              Tell us who&apos;s travelling and what you love. A specialist
              designs the rest.
            </p>

            <div className="mt-8 grid max-w-[460px] grid-cols-3 gap-4">
              {[
                { value: "24 hrs", label: "first itinerary" },
                { value: "₹0", label: "planning fee" },
                { value: "4.9", label: "rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="type-h3 text-ink">{stat.value}</p>
                  <p className="type-small mt-1.5 text-navy-700">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* How it works sits beside the planner so the hero has no dead space. */}
            <div className="mt-8 border-t border-sand-300 pt-6">
              <h2 className="type-h3 text-ink">How it works</h2>
              <ol className="mt-5 grid gap-5">
                {[
                  {
                    title: "Tell us your dream",
                    description: "A ten-minute call or a two-minute form.",
                  },
                  {
                    title: "We design it around you",
                    description: "A tailored itinerary within 24 hours.",
                  },
                  {
                    title: "We fine-tune together",
                    description: "Unlimited changes, never a fee.",
                  },
                  {
                    title: "You travel, we handle the rest",
                    description: "24×7 support throughout.",
                  },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-gold-400">
                      {index + 1}
                    </span>
                    <span>
                      <span className="type-title block text-ink">{step.title}</span>
                      <span className="type-small mt-1 block text-navy-700">
                        {step.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <PersonalisedPlanner />
          </div>
        </div>
      </section>

      <section className="container-page section-major">
        <SectionHeading
          number="02"
          label="What we can tailor"
          title="What we tailor"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureTile
            roomy
            icon={<Heart className="h-5 w-5" />}
            title="Honeymoons & celebrations"
            description="Private villas and intimate dinners."
          />
          <FeatureTile
            roomy
            icon={<Smile className="h-5 w-5" />}
            title="Family & multi-generation"
            description="Easy pacing and something for every age."
          />
          <FeatureTile
            roomy
            icon={<Sparkles className="h-5 w-5" />}
            title="Milestone occasions"
            description="Birthdays, anniversaries and reunions."
          />
          <FeatureTile
            roomy
            icon={<Flag className="h-5 w-5" />}
            title="Private group journeys"
            description="Friends, clubs and communities, end to end."
          />
          <FeatureTile
            roomy
            icon={<PenLine className="h-5 w-5" />}
            title="Special-interest travel"
            description="Photography, food, wildlife, temples or trekking."
          />
          <FeatureTile
            roomy
            icon={<Clock className="h-5 w-5" />}
            title="Flexible dates & pacing"
            description="Travel when you want, for as long as you want."
          />
        </div>
      </section>

      <CtaBand
        title="Rather talk it through?"
        accent="Call a specialist."
        description="Mon–Sat, 9:30 am – 7:00 pm."
        image="/images/personalised-cta.jpg"
        imageAlt="Travellers watching hot-air balloons drift over Cappadocia"
      />
    </>
  );
}
