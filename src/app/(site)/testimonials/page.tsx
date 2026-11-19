import { RichFieldText } from "@/components/site/page-content-blocks";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { loadDestinations, loadTestimonials } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Guest Stories",
  description:
    "12,400 travellers in their own words — real Hidden Miles guest stories from Kashmir, Kerala, Europe and beyond.",
};

export const dynamic = "force-dynamic";

// Counts sum to 12,400 and average 4.89, matching the "4.9 · 12,400+ reviews" headline.
const bars = [
  { star: 5, pct: 91, count: "11.3k" },
  { star: 4, pct: 7, count: "900" },
  { star: 3, pct: 1, count: "140" },
  { star: 2, pct: 0, count: "40" },
  { star: 1, pct: 0, count: "20" },
];

const avatarColours = [
  "bg-blue-600",
  "bg-danger",
  "bg-gold-700",
  "bg-success",
  "bg-navy-500",
  "bg-blue-700",
];

export default async function TestimonialsPage() {
  const [testimonials, destinations] = await Promise.all([
    loadTestimonials(),
    loadDestinations(),
  ]);

  // Photo for a review comes from the destination named in its tour, so it always matches.
  const photoFor = (tour: string) =>
    destinations.find((destination) =>
      tour.toLowerCase().includes(destination.name.toLowerCase()),
    )?.image ?? null;

  const columns = [testimonials.filter((_, index) => index % 3 === 0), testimonials.filter((_, index) => index % 3 === 1), testimonials.filter((_, index) => index % 3 === 2)];

  return (
    <>
      <section className="container-page py-12 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Guest stories" }]}
            />
            <h1 className="type-h1 mt-7 max-w-3xl text-ink">
              12,400 travellers,
              <br />
              <span className="accent-line">in their own words.</span>
            </h1>
          </div>

          <div className="on-ink flex w-full shrink-0 items-center gap-6 rounded-[24px] bg-ink p-6 sm:gap-8 sm:p-8 lg:w-auto">
            <div>
              <p className="font-display text-[56px] leading-none text-paper">4.9</p>
              <p className="mt-2 text-sm font-bold tracking-[0.1em] text-gold-400">
                ★★★★★
              </p>
              <p className="mt-1 whitespace-nowrap text-[13px] font-medium text-navy-200">
                12,400+ reviews
              </p>
            </div>
            <div className="min-w-0 flex-1 space-y-2.5 sm:w-[220px] sm:flex-none">
              {bars.map((bar) => (
                <div key={bar.star} className="flex items-center gap-2.5">
                  <span className="w-6 text-xs font-bold text-navy-200">
                    {bar.star}★
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-gold-400"
                      style={{ width: `${Math.max(bar.pct, 1)}%` }}
                    />
                  </span>
                  <span className="w-9 text-right text-xs font-medium text-navy-200">
                    {bar.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {[
            "All stories",
            "Kashmir",
            "Kerala",
            "Europe",
            "Honeymoon",
            "Family",
            "Women's Special",
          ].map((filter, index) => (
            <span key={filter} className={`chip ${index === 0 ? "chip-active" : ""}`}>
              {filter}
            </span>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-6">
              {column.map((testimonial, index) => {
                const image =
                  (columnIndex === 0 && index === 0) || (columnIndex === 2 && index === 1)
                    ? photoFor(testimonial.tour)
                    : null;

                return (
                  <article
                    key={`${testimonial.name}-${index}`}
                    // Cards share any extra column height so all three columns end level.
                    className="flex flex-col rounded-[24px] border border-sand-300 bg-paper p-7 lg:flex-1"
                  >
                    {image ? (
                      <div className="relative mb-5 aspect-[320/200] overflow-hidden rounded-[20px] bg-ink">
                        <Image
                          src={imageUrl(image, 700)}
                          alt={testimonial.tour}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold tracking-[0.1em] text-gold-400">
                        {"★".repeat(testimonial.rating)}
                      </span>
                    </div>

                    <blockquote className="mt-3 font-display text-[18px] leading-[1.55] text-ink">
                      “<RichFieldText editor={testimonial.richFields?.quote} fallback={testimonial.quote} />”
                    </blockquote>

                    <div className="flex-1" aria-hidden="true" />
                    <div className="route-line my-5" />

                    <div className="flex items-center gap-3.5">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-full text-xs font-bold text-white ${
                          avatarColours[
                            (columnIndex + index) % avatarColours.length
                          ]
                        }`}
                      >
                        {testimonial.name
                          .split(" ")
                          .filter((word) => /[A-Za-z]/.test(word[0] ?? ""))
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <span>
                        <span className="block text-[15px] font-bold text-ink">
                          {testimonial.name}
                        </span>
                        <span className="block text-[13px] font-medium leading-5 text-navy-500">
                          {testimonial.tour} · {testimonial.city}
                        </span>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/testimonials" className="btn btn-outline">
            Load more stories
          </Link>
        </div>
      </section>

      <CtaBand
        title="Ready to write"
        accent="your own story?"
        description="Join the travellers who let us plan their holidays — and then came back for the next one."
      />
    </>
  );
}
