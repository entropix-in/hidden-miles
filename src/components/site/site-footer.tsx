import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { site } from "@/data/site";
import type { Destination } from "@/data/destinations";

const exploreLinks = [
  { label: "Tour packages", href: "/tours" },
  { label: "Destinations", href: "/destinations" },
  { label: "Experiences", href: "/experiences" },
  { label: "Guest stories", href: "/testimonials" },
  { label: "About Hidden Miles", href: "/about" },
  { label: "Contact us", href: "/contact" },
];



export function SiteFooter({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-sand-100">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-navy-400/10 blur-3xl" />

      <div className="container-page relative">
        <div className="grid gap-8 border-b border-white/10 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-blue-300">The Hidden Miles letter</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-sand-50 sm:text-4xl">
              Small stories, big journeys.
              <br />
              Straight to your inbox.
            </h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="mb-4 max-w-md text-sm leading-6 text-sand-200/70">
              Handpicked departures, honest travel notes and early access to
              seasonal offers. No noise, we promise.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-7 text-sand-200/70">
              Since 1984, we have been designing holidays that feel personal,
              seamless and a little magical. Travel with people who care.
            </p>
            <div className="mt-6 flex gap-2">
              {site.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wider text-sand-100 transition hover:border-blue-400 hover:text-blue-300"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-blue-300">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sand-200/75 transition hover:text-blue-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-blue-300">
              Destinations
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {destinations.slice(0, 6).map((destination) => (
                <li key={destination.slug}>
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="text-sand-200/75 transition hover:text-blue-300"
                  >
                    {destination.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-blue-300">
              Say hello
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={site.phoneHref}
                  className="flex items-start gap-3 text-sand-200/75 transition hover:text-blue-300"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={site.emailHref}
                  className="flex items-start gap-3 text-sand-200/75 transition hover:text-blue-300"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sand-200/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                {site.address}
              </li>
              <li className="flex items-start gap-3 text-sand-200/75">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                {site.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-sm font-semibold tracking-wide text-sand-200/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName} All rights reserved.
          </p>
          <p>Crafted with care in Mumbai · Recognised by the Ministry of Tourism</p>
        </div>
      </div>
    </footer>
  );
}
