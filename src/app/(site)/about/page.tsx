import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  HeartHandshake,
  IndianRupee,
  PhoneCall,
} from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { FeatureTile } from "@/components/site/feature-tile";
import { Kicker, SectionHeading } from "@/components/site/section-heading";
import { Stamp } from "@/components/site/stamp";
import { loadDestinations } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Since 1984, Hidden Miles has been in the business of memories — one family, one idea: travel should feel effortless, honest and personal.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const destinations = await loadDestinations();
  const kashmir = destinations.find((item) => item.slug === "kashmir");
  const kerala = destinations.find((item) => item.slug === "kerala");
  const ladakh = destinations.find((item) => item.slug === "ladakh");

  return (
    <>
      <section className="container-page py-12 text-center md:py-20">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "About us" }]}
          className="justify-center"
        />
        <h1 className="type-display mx-auto mt-8 max-w-4xl text-ink">
          Since 1984, in the
          <br />
          <span className="accent-line">business of memories.</span>
        </h1>
        <p className="type-lead mx-auto mt-6 max-w-xl text-navy-700">
          One family, one idea: travel should feel effortless, honest and
          personal.
        </p>
      </section>

      <section className="container-page">
        <div className="relative grid gap-4 pb-10 md:grid-cols-3">
          {[
            { image: ladakh?.image, alt: "Ladakh", className: "md:mt-10" },
            { image: kashmir?.image, alt: "Kashmir", className: "" },
            { image: kerala?.image, alt: "Kerala", className: "md:mt-14" },
          ].map((photo, index) => (
            <div
              key={photo.alt}
              className={`relative overflow-hidden rounded-[28px] bg-ink ${
                index === 1 ? "aspect-[504/520]" : "aspect-[420/440]"
              } ${photo.className}`}
            >
              {photo.image ? (
                <Image
                  src={imageUrl(photo.image, 1000)}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : null}
            </div>
          ))}
          <span className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block lg:left-[62%]">
            <Stamp size={150} />
          </span>
        </div>
      </section>

      <section className="container-page section-major">
        <div className="grid gap-12 lg:grid-cols-[460px_1fr] lg:gap-24">
          <div>
            <Kicker number="01" label="The Hidden Miles way" />
            <h2 className="type-h2 mt-5 text-ink">
              A family business,
              <br />
              <span className="accent-line">grown one trip at a time.</span>
            </h2>
          </div>
          <div>
            <p className="type-lead text-ink">
              It started with a single bus to Kashmir and 32 travellers. Four
              decades later we&apos;ve hosted 1.2 million guests — and we still
              answer the phone like it&apos;s our very first trip.
            </p>
            <p className="type-body mt-5 text-navy-700">
              Our tour leaders are trained in-house, our prices are all-inclusive,
              and every itinerary is walked by our own team before a single seat
              is sold. We are still family-run, still based in Mumbai, and still
              slightly obsessed with the small details.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-sand-300 pt-7 sm:grid-cols-4">
              {[
                { value: "1.2M+", label: "travellers" },
                { value: "500+", label: "tour leaders" },
                { value: "60+", label: "destinations" },
                { value: "4.9★", label: "rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="type-h3 text-ink">{stat.value}</p>
                  <p className="type-small mt-1 text-navy-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <Link href="/contact" className="btn btn-outline mt-8">
              Come say hello
              <span className="btn-dot">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-100">
        <div className="container-page section-major">
          <SectionHeading
            number="02"
            label="The journey so far"
            title="Four decades,"
            accent="a few milestones."
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
            {[
              ["1984", "First group tour to Kashmir — one bus, 32 travellers"],
              ["1996", "Our first international departure, to Europe"],
              ["2008", "Launched Women's Special departures"],
              ["2018", "Welcomed our millionth traveller"],
              ["2026", "Opened the Personalised Holidays studio"],
            ].map(([year, title], index) => (
              <div
                key={year}
                className={`lg:pr-6 ${index ? "lg:border-l lg:border-sand-300 lg:pl-6" : ""}`}
              >
                <div className="flex items-center gap-0">
                  <span
                    className={`h-5 w-5 shrink-0 rounded-full border-4 border-sand-100 ${
                      index === 4 ? "bg-gold-400" : "bg-ink"
                    }`}
                  />
                  <span
                    className={`h-px flex-1 border-t-[1.5px] border-dashed ${
                      index < 4 ? "border-navy-300" : "border-transparent"
                    }`}
                  />
                </div>
                <p
                  className={`mt-5 font-display text-3xl italic ${
                    index === 4 ? "text-gold-600" : "text-ink"
                  }`}
                >
                  {year}
                </p>
                <p className="type-small mt-2 text-navy-700">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section-major">
        <SectionHeading
          number="03"
          label="What we stand for"
          title="Three promises"
          accent="we keep."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <FeatureTile
            icon={<PhoneCall className="h-5 w-5" />}
            title="Real humans, always"
            description="Call, WhatsApp or email. The same team answers before and during your trip."
          />
          <FeatureTile
            icon={<HeartHandshake className="h-5 w-5" />}
            title="Care for every traveller"
            description="Elders, kids, solo travellers — we plan for the people, not just the places."
          />
          <FeatureTile
            icon={<IndianRupee className="h-5 w-5" />}
            title="Honest by default"
            description="All-inclusive prices. What you see is exactly what you pay."
          />
        </div>
      </section>

      <CtaBand
        title="Come travel"
        accent="with us."
        description="Join 1.2 million travellers who've trusted Hidden Miles with their holidays."
        image={kashmir?.image}
        imageAlt="Kashmir"
      />
    </>
  );
}
