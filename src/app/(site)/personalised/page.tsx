import type { Metadata } from "next";
import {
  CalendarClock,
  Compass,
  Flag,
  Heart,
  PenLine,
  Sparkles,
  Users,
} from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { FeatureTile } from "@/components/site/feature-tile";
import { Kicker, SectionHeading } from "@/components/site/section-heading";
import { PersonalisedPlanner } from "@/components/site/personalised-planner";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Personalised Holidays",
  description:
    "A holiday built around you, not a brochure. Tell us who's travelling and what you love — a Hidden Miles specialist designs the rest.",
};

export default function PersonalisedPage() {
  return (
    <>
      <section className="container-page py-12 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_520px] lg:gap-20">
          <div>
            <Kicker label="Personalised holidays" />
            <h1 className="type-h1 mt-6 text-ink">
              A holiday built
              <br />
              <span className="accent-line">around you,</span>
              <br />
              not a brochure.
            </h1>
            <p className="type-lead mt-6 max-w-[500px] text-navy-700">
              No fixed departures and no one-size-fits-all. Tell us who&apos;s
              travelling and what you love — a specialist designs the rest.
            </p>

            <div className="mt-9 flex flex-wrap gap-10">
              {[
                { value: "24 hrs", label: "to your first itinerary" },
                { value: "₹0", label: "planning fee" },
                { value: "4.9★", label: "guest rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="type-h3 text-ink">{stat.value}</p>
                  <p className="type-small mt-1 text-navy-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="type-small mt-8 flex items-center gap-2 text-navy-500">
              <CalendarClock className="h-4 w-4 text-navy-500" />
              Prefer to talk? Call {site.phone}, {site.hours}.
            </p>
          </div>

          <PersonalisedPlanner />
        </div>
      </section>

      <section className="bg-sand-100">
        <div className="container-page section-major">
          <SectionHeading
            number="01"
            label="How it works"
            title="Four steps to"
            accent="your perfect trip."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {[
              {
                title: "Tell us your dream",
                description: "A ten-minute call or a two-minute form.",
                icon: PenLine,
              },
              {
                title: "We design it around you",
                description: "A tailored itinerary within 24 hours.",
                icon: Compass,
              },
              {
                title: "We fine-tune together",
                description: "Unlimited changes, never a fee.",
                icon: Sparkles,
              },
              {
                title: "You travel, we handle the rest",
                description: "Tickets, stays, guides and 24×7 support.",
                icon: Flag,
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className={`lg:px-7 ${index ? "lg:border-l lg:border-sand-300" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-gold-400">
                    <step.icon className="h-5 w-5" />
                  </span>
                  {index < 3 ? (
                    <span className="hidden h-px flex-1 border-t-[1.5px] border-dashed border-sand-300 lg:block" />
                  ) : null}
                </div>
                <h3 className="type-title mt-5 text-ink">{step.title}</h3>
                <p className="type-small mt-2 text-navy-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section-major">
        <SectionHeading
          number="02"
          label="What we can tailor"
          title="Made for every"
          accent="kind of traveller."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureTile
            icon={<Heart className="h-5 w-5" />}
            title="Honeymoons & celebrations"
            description="Private villas, intimate dinners and just enough adventure."
          />
          <FeatureTile
            icon={<Users className="h-5 w-5" />}
            title="Family & multi-generation"
            description="Easy pacing and something for every age."
          />
          <FeatureTile
            icon={<Sparkles className="h-5 w-5" />}
            title="Milestone occasions"
            description="Birthdays, anniversaries and reunions."
          />
          <FeatureTile
            icon={<Flag className="h-5 w-5" />}
            title="Private group journeys"
            description="Friends, clubs and communities, end to end."
          />
          <FeatureTile
            icon={<PenLine className="h-5 w-5" />}
            title="Special-interest travel"
            description="Photography, food, wildlife, temples or trekking."
          />
          <FeatureTile
            icon={<CalendarClock className="h-5 w-5" />}
            title="Flexible dates & pacing"
            description="Travel when you want, for as long as you want."
          />
        </div>
      </section>

      <CtaBand
        title="Rather talk it through?"
        accent="Call a specialist."
        description="Mon–Sat, 9:30 am to 7:00 pm. Or leave your number and we'll call you back within the hour."
      />
    </>
  );
}
