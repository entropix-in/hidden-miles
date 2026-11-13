import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { Contours } from "@/components/site/contours";
import { Kicker } from "@/components/site/section-heading";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Hidden Miles team — real people, Monday to Saturday, 9:30 am to 7:00 pm. We usually reply within the hour.",
};

const faqs = [
  {
    question: "How do I book a Hidden Miles holiday?",
    answer:
      "Pick a departure online and pay 25% to reserve, or call us and we'll book it for you. The balance is due 30 days before travel.",
  },
  {
    question: "Can you customise an existing tour?",
    answer:
      "Yes. Every itinerary can be made private, extended or slowed down. Tell us what you'd change and we'll rework it within 24 hours.",
  },
  {
    question: "Do you handle visas and travel insurance?",
    answer:
      "We guide visa documentation for every international destination and can arrange travel insurance as part of your booking.",
  },
  {
    question: "What if my plans change after booking?",
    answer:
      "You can change your departure date free up to 30 days before travel. Inside 30 days, we'll always try to find a solution.",
  },
  {
    question: "Is there an EMI option?",
    answer:
      "Yes — no-cost EMI for 3 to 6 months is available on major credit cards, and longer tenures on request.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="container-page py-12 text-center md:py-20">
        <Kicker label="Contact us" className="justify-center" />
        <h1 className="type-h1 mx-auto mt-5 max-w-3xl text-ink">
          Let&apos;s plan something
          <br />
          <span className="accent-line">wonderful.</span>
        </h1>
        <p className="type-lead mx-auto mt-5 max-w-2xl text-navy-700">
          Real people, Monday to Saturday, 9:30 am – 7:00 pm. We usually reply
          within the hour.
        </p>
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Phone,
              label: "Call us",
              value: site.phone,
              cta: "Call now",
              href: site.phoneHref,
              bg: "bg-ink",
            },
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: site.phone,
              cta: "Start a chat",
              href: site.whatsappHref,
              bg: "bg-whatsapp",
            },
            {
              icon: Mail,
              label: "Email",
              value: site.email,
              cta: "Write to us",
              href: site.emailHref,
              bg: "bg-blue-500",
            },
          ].map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group rounded-[20px] border border-sand-300 bg-paper p-7 transition hover:border-navy-300"
            >
              <span
                className={`grid h-[52px] w-[52px] place-items-center rounded-[16px] text-paper ${channel.bg}`}
              >
                <channel.icon className="h-6 w-6" />
              </span>
              <p className="type-label mt-5 text-navy-500">{channel.label}</p>
              <p className="type-title mt-1 text-ink">{channel.value}</p>
              <p className="mt-4 text-sm font-bold text-blue-700 group-hover:text-blue-800">
                {channel.cta} →
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="container-page pb-16 md:pb-24">
        <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
          <ContactForm />

          <div className="space-y-6">
            <div className="relative aspect-[420/300] overflow-hidden rounded-[28px] bg-navy-100">
              <Contours
                color="rgba(25,103,133,0.28)"
                count={8}
                cx={0.5}
                cy={0.5}
                seed={2.4}
              />
              <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full bg-ink py-2.5 pl-2.5 pr-4 text-[13px] font-bold text-paper shadow-lg">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-400 text-ink">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                Meridian House
              </span>
            </div>

            <div className="rounded-[28px] bg-ink p-8 text-paper">
              <p className="type-label text-gold-400">Mumbai · Head office</p>
              <p className="type-h4 mt-3 text-paper">302, Meridian House</p>
              <p className="type-small mt-2 whitespace-pre-line text-navy-200">
                Andheri East, Mumbai 400069{"\n"}
                Mon – Sat · 9:30 am to 7:00 pm
              </p>
              <a
                href="https://maps.google.com/?q=Meridian+House+Andheri+East+Mumbai"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex text-sm font-bold text-gold-400 hover:text-gold-300"
              >
                Get directions ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-100">
        <div className="container-page section-major">
          <div className="grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-24">
            <div>
              <Kicker label="Good to know" />
              <h2 className="type-h2 mt-5 text-ink">
                Questions,
                <br />
                <span className="accent-line">answered.</span>
              </h2>
              <p className="type-body mt-5 text-navy-700">
                Can&apos;t find yours? Call us — it&apos;s what we&apos;re here
                for.
              </p>
            </div>
            <div>
              {faqs.map((faq, index) => (
                <details
                  key={faq.question}
                  open={index === 0}
                  className="group border-t border-sand-300 py-7 last:border-b"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                    <span className="type-title text-ink">{faq.question}</span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand-200 text-ink transition group-open:rotate-45 group-open:bg-ink group-open:text-gold-400">
                      +
                    </span>
                  </summary>
                  <p className="type-small mt-4 max-w-2xl text-navy-700">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
