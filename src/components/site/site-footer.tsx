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


// Simple monochrome brand marks for the social links (lucide has no brand icons).
const socialIcons: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M13.5 21v-7h2.4M13.5 21v-9.2c0-1.4.8-2.3 2.3-2.3h1.4M10.5 14h5.4" strokeLinecap="round" />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 10.5V16M8 7.6v.1M11.5 16v-5.5M11.5 13c0-1.5 1-2.5 2.3-2.5s2.2.9 2.2 2.5V16" strokeLinecap="round" />
    </svg>
  ),
};

export function SiteFooter() {
  return (
    <footer className="on-ink relative overflow-hidden border-t border-white/10 bg-ink text-paper">
      <div className="container-page">
        <div className="flex flex-col gap-8 py-14 md:py-16 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="lg:min-w-0 lg:flex-1">
            <p className="type-h1 text-paper">
              Wander well,
              <br />
              <span className="accent-line">we&apos;ll handle the rest.</span>
            </p>
          </div>
          <div className="w-full shrink-0 lg:max-w-[420px]">
            <p className="type-title text-paper">Postcards, once a month</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="route-line-ink" />

        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[320px_1fr] lg:gap-16">
          <div>
            <Logo light />
            <p className="type-small mt-5 max-w-[300px] text-navy-200">
              Offbeat journeys, thoughtfully planned.
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
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-paper transition hover:bg-gold-400 hover:text-ink"
                >
                  {socialIcons[social.label]}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="type-label text-gold-400">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="type-small block w-fit text-navy-100 transition hover:text-gold-300"
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
              <ul className="type-small mt-4 space-y-3 text-navy-100">
                <li>302, Meridian House</li>
                <li>Andheri East, Mumbai</li>
                <li>Mon–Sat</li>
                <li>9:30 am – 7:00 pm</li>
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
          {/* Separate items wrap cleanly, so no line ends on a dangling "·". */}
          <p className="flex flex-col gap-1 font-medium text-navy-300 sm:flex-row sm:flex-wrap sm:gap-x-3">
            <span>© {new Date().getFullYear()} {site.legalName}</span>
            <span>IATA accredited</span>
            <span>GSTIN 27AAACH1234F1Z5</span>
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 font-medium text-navy-100">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookie settings</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
