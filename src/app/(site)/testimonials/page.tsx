import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, MessageSquareQuote, Star } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { TestimonialsExplorer } from "@/components/site/testimonials-explorer";
import { loadTestimonials } from "@/lib/content";

export const metadata: Metadata = {
  title: "Guest Stories",
  description:
    "Real reviews and travel stories from Hidden Miles guests — honeymoons, family holidays, spiritual journeys and Himalayan adventures.",
};

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await loadTestimonials();
  const average =
    testimonials.length > 0
      ? (
          testimonials.reduce(
            (total, testimonial) => total + testimonial.rating,
            0,
          ) / testimonials.length
        ).toFixed(1)
      : "5.0";
  const tours = new Set(
    testimonials.map((testimonial) => testimonial.tour).filter(Boolean),
  ).size;

  return (
    <>
      <PageHero
        eyebrow="Guest stories"
        title="Real journeys. Real words."
        description="The best part of planning travel is hearing what happened next. These are the stories our travellers brought home — unedited, warm and full of the little moments that made their trip."
        breadcrumbs={[{ label: "Guest stories" }]}
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <Star className="h-5 w-5 fill-gold-500 text-gold-500" />
            <p className="mt-3 font-display text-3xl font-semibold text-navy-950">
              {average}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Guest rating
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <MessageSquareQuote className="h-5 w-5 text-blue-600" />
            <p className="mt-3 font-display text-3xl font-semibold text-navy-950">
              {testimonials.length}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Stories
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <MapPin className="h-5 w-5 text-blue-600" />
            <p className="mt-3 font-display text-3xl font-semibold text-navy-950">
              {tours}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Journeys
            </p>
          </div>
        </div>
      </PageHero>

      <TestimonialsExplorer testimonials={testimonials} />

      <section className="container-page pb-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[32px] bg-navy-950 px-6 py-9 text-sand-50 sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="eyebrow text-blue-300">Your turn</p>
            <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">
              Ready to write your own story?
            </h2>
            <p className="mt-2 text-sm text-sand-200/70">
              Tell us where you are dreaming of and we will take it from there.
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
