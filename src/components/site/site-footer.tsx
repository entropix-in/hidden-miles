import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { site } from "@/data/site";

const columns = [
  {
    title: "Travel",
    items: [
      { label: "Group tours", href: "/tours" },
      { label: "Destinations", href: "/destinations" },
      { label: "Speciality tours", href: "/speciality-tours" },
      { label: "Personalised holidays", href: "/personalised" },
      { label: "Corporate travel", href: "/corporate" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About us", href: "/about" },
      { label: "Guest stories", href: "/testimonials" },
      { label: "Experiences", href: "/experiences" },
      { label: "Careers", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "Booking & payments", href: "/contact" },
      { label: "Cancellations", href: "/contact" },
      { label: "Visa assistance", href: "/contact" },
      { label: "Travel insurance", href: "/contact" },
      { label: "FAQs", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="on-ink relative overflow-hidden bg-ink text-paper">
      <div className="container-page">
        <div className="flex flex-col gap-10 py-16 md:py-24 xl:flex-row xl:items-end xl:justify-between xl:gap-16">
          <div className="xl:min-w-0 xl:flex-1">
            <p className="type-display text-paper xl:whitespace-nowrap">
              Wander well,
              <br />
              <span className="accent-line">we&apos;ll handle the rest.</span>
            </p>
          </div>
          <div className="w-full shrink-0 xl:max-w-[400px]">
            <p className="type-title text-paper">Postcards, once a month</p>
            <p className="type-small mt-2 text-navy-200">
              New departures, early-bird fares and one good travel story. No spam,
              ever.
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="route-line-ink" />

        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[320px_1fr] lg:gap-16">
          <div>
            <Logo light />
            <p className="type-small mt-5 max-w-[300px] text-navy-200">
              Offbeat journeys, thoughtfully planned. Group tours, family holidays
              and bespoke escapes across India and the world.
            </p>
            <div className="mt-6 flex gap-2.5">
              {[
                { label: "Instagram", short: "IG", href: site.socials[0]?.href ?? "#" },
                { label: "Facebook", short: "FB", href: site.socials[1]?.href ?? "#" },
                { label: "YouTube", short: "YT", href: site.socials[2]?.href ?? "#" },
                { label: "LinkedIn", short: "IN", href: "https://linkedin.com" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[11px] font-extrabold text-paper transition hover:bg-gold-400 hover:text-ink"
                >
                  {social.short}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="type-label text-gold-400">{column.title}</h3>
                <ul className="mt-5 space-y-3.5">
                  {column.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="type-small text-navy-100 transition hover:text-gold-300"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="type-label text-gold-400">Visit us</h3>
              <ul className="type-small mt-5 space-y-3.5 text-navy-100">
                <li>302, Meridian House</li>
                <li>Andheri East, Mumbai</li>
                <li>Mon–Sat, 9:30–7:00</li>
                <li>
                  <a href={site.phoneHref} className="transition hover:text-gold-300">
                    {site.phone}
                  </a>
                </li>
                <li>
                  <a href={site.emailHref} className="transition hover:text-gold-300">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-navy-300">
            © {new Date().getFullYear()} {site.legalName} · IATA accredited ·
            GSTIN 27AAACH1234F1Z5
          </p>
          <p className="font-medium text-navy-100">
            Privacy&nbsp;&nbsp;·&nbsp;&nbsp;Terms&nbsp;&nbsp;·&nbsp;&nbsp;Cookie
            settings
          </p>
        </div>
      </div>
    </footer>
  );
}
