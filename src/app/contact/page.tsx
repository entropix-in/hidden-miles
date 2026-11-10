import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { EnquiryForm } from "@/components/enquiry-form";
import { getTour } from "@/data/tours";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to a Safarnest travel expert. Call, email, WhatsApp or send an enquiry — we usually respond within one working day.",
};

const offices = [
  {
    city: "Mumbai · Head office",
    address: "302, Meridian House, Andheri East, Mumbai 400069",
    phone: "+91 98204 12345",
  },
  {
    city: "Pune",
    address: "14, Riverside Arcade, Bund Garden Road, Pune 411001",
    phone: "+91 98204 23456",
  },
  {
    city: "Bengaluru",
    address: "7th Floor, Indigo House, Indiranagar, Bengaluru 560038",
    phone: "+91 98204 34567",
  },
];

const faqs = [
  {
    question: "How do I book a Safarnest holiday?",
    answer:
      "Start with an enquiry or a call. Your travel expert will share a detailed itinerary and quote, and once you are happy, a 25% deposit confirms your booking. The balance is due 30 days before departure.",
  },
  {
    question: "Can you customise an existing tour?",
    answer:
      "Absolutely. Almost every Safarnest itinerary can be adjusted for dates, pace, hotel category or private departures. Tell us what you would like to change and we will re-plan it around you.",
  },
  {
    question: "Do you handle visas and travel insurance?",
    answer:
      "Yes. Visa assistance is included on international tours where mentioned, and our team guides you through documents. Travel insurance is included on all international journeys and available on request for India tours.",
  },
  {
    question: "What if plans change after booking?",
    answer:
      "We understand life happens. Date changes and cancellations are handled as per the booking terms shared with your confirmation. Our team will always try to find the most flexible solution.",
  },
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tourSlug = typeof params.tour === "string" ? params.tour : "";
  const selectedTour = tourSlug ? getTour(tourSlug) : undefined;
  const mapQuery = encodeURIComponent(
    "Meridian House, Andheri East, Mumbai 400069",
  );

  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Let's plan something wonderful."
        description="Call, email or send us a note. A real travel expert — not a chatbot — will get back to you within one working day with ideas and honest advice."
        breadcrumbs={[{ label: "Contact" }]}
      >
        <div className="grid gap-3">
          <a
            href={site.phoneHref}
            className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-saffron-400"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-saffron-100 text-saffron-700">
              <Phone className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                Call us
              </span>
              <span className="text-sm font-extrabold text-forest-950">
                {site.phone}
              </span>
            </span>
            <ArrowUpRight className="ml-auto h-4 w-4 text-stone-300 transition group-hover:text-saffron-600" />
          </a>
          <a
            href={site.emailHref}
            className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-saffron-400"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-100 text-forest-700">
              <Mail className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                Email us
              </span>
              <span className="text-sm font-extrabold text-forest-950">
                {site.email}
              </span>
            </span>
            <ArrowUpRight className="ml-auto h-4 w-4 text-stone-300 transition group-hover:text-saffron-600" />
          </a>
          <div className="flex items-center gap-3 rounded-2xl bg-forest-950 p-4 text-cream-50">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-saffron-300">
              <Clock className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-cream-200/50">
                Office hours
              </span>
              <span className="text-sm font-extrabold">{site.hours}</span>
            </span>
          </div>
        </div>
      </PageHero>

      <section className="container-page py-12 sm:py-16">
        {selectedTour ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-saffron-200 bg-saffron-50 px-5 py-4">
            <p className="text-sm font-bold text-saffron-900">
              Enquiring about <span className="font-extrabold">{selectedTour.title}</span>
            </p>
            <Link
              href={`/tours/${selectedTour.slug}`}
              className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-saffron-700 hover:text-saffron-800"
            >
              View tour
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <EnquiryForm
            defaultDestination={selectedTour?.destinationSlug}
            tourTitle={selectedTour?.title}
            className="border border-stone-200 shadow-xl shadow-forest-950/5"
          />

          <div className="space-y-4">
            <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white">
              <div className="relative h-40 overflow-hidden bg-forest-100">
                <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(30deg,transparent_49%,#ffffff_49%,#ffffff_51%,transparent_51%),linear-gradient(120deg,transparent_49%,#ffffff_49%,#ffffff_51%,transparent_51%)] [background-size:44px_44px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-forest-200/60 via-transparent to-saffron-200/60" />
                <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-forest-950 text-saffron-300 shadow-xl">
                  <MapPin className="h-6 w-6" />
                </span>
              </div>
              <div className="p-6">
                <p className="eyebrow">Visit us</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-forest-950">
                  Our Mumbai home
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-stone-500">
                  {site.address}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-saffron-700 transition hover:text-saffron-800"
                >
                  Get directions
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-white p-6">
              <p className="eyebrow">Across India</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-forest-950">
                More Safarnest offices
              </h2>
              <div className="mt-4 space-y-4">
                {offices.map((office) => (
                  <div
                    key={office.city}
                    className="border-t border-dashed border-stone-200 pt-4 first:border-0 first:pt-0"
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-saffron-700">
                      {office.city}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-stone-500">
                      {office.address}
                    </p>
                    <a
                      href={`tel:${office.phone.replace(/\s/g, "")}`}
                      className="mt-1 inline-block text-[12px] font-bold text-forest-950 hover:text-saffron-700"
                    >
                      {office.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-100/70 py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">Good to know</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-forest-950 sm:text-4xl">
              Questions we hear often.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-7 text-stone-600">
              Still unsure about something? Call us — we would rather answer
              properly than have you guess.
            </p>
            <a
              href={site.phoneHref}
              className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-forest-950 transition hover:text-saffron-700"
            >
              <Phone className="h-4 w-4 text-saffron-600" />
              {site.phone}
            </a>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-stone-200 bg-white p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-extrabold text-forest-950 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream-100 text-forest-950 transition duration-300 group-open:rotate-45">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 text-[13px] leading-6 text-stone-500">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
