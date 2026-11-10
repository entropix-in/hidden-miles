"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { navLinks, site } from "@/data/site";
import type { Destination } from "@/data/destinations";
import { cn } from "@/lib/utils";

export function SiteHeader({
  destinations,
}: {
  destinations: Destination[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-forest-950 text-cream-100 md:block">
        <div className="container-page flex h-10 items-center justify-between text-[11px] font-semibold tracking-wide">
          <p className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-saffron-400" />
            Festive escapes are here — save up to 20% on select group tours
          </p>
          <div className="flex items-center gap-6 text-cream-200/90">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-saffron-400" />
              {site.hours}
            </span>
            <a
              href={site.emailHref}
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 text-saffron-400" />
              {site.email}
            </a>
            <a
              href={site.phoneHref}
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <Phone className="h-3.5 w-3.5 text-saffron-400" />
              {site.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-stone-200/80 bg-cream-50/95 backdrop-blur-xl">
        <div className="container-page flex h-[76px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navLinks.map((link) =>
              link.label === "Destinations" ? (
                <div key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-4 py-2.5 text-[13px] font-bold transition",
                      isActive(link.href)
                        ? "bg-forest-950 text-cream-50"
                        : "text-stone-700 hover:bg-cream-200/70 hover:text-forest-950",
                    )}
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5 transition duration-300 group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-3 shadow-2xl shadow-forest-950/10">
                      <div className="grid grid-cols-2 gap-1">
                        {destinations.slice(0, 10).map((destination) => (
                          <Link
                            key={destination.slug}
                            href={`/destinations/${destination.slug}`}
                            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-cream-100 hover:text-forest-950"
                          >
                            {destination.name}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-saffron-600">
                              {destination.region}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/destinations"
                        className="mt-2 flex items-center justify-between rounded-2xl bg-forest-950 px-4 py-3 text-sm font-bold text-cream-50 transition hover:bg-forest-900"
                      >
                        View all destinations
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-[13px] font-bold transition",
                    isActive(link.href)
                      ? "bg-forest-950 text-cream-50"
                      : "text-stone-700 hover:bg-cream-200/70 hover:text-forest-950",
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="btn-primary hidden px-5 py-3 sm:inline-flex">
              Plan my trip
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-full border border-stone-300 bg-white text-forest-950 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-b border-stone-200 bg-cream-50 shadow-xl lg:hidden">
          <div className="container-page max-h-[calc(100vh-76px)] overflow-y-auto py-5">
            <nav className="grid gap-1" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-bold",
                    isActive(link.href)
                      ? "bg-forest-950 text-cream-50"
                      : "text-stone-700 hover:bg-cream-200",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-5 rounded-3xl border border-stone-200 bg-white p-4">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-saffron-700">
                Popular destinations
              </p>
              <div className="grid grid-cols-2 gap-1">
                {destinations.slice(0, 8).map((destination) => (
                  <Link
                    key={destination.slug}
                    href={`/destinations/${destination.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-cream-100 hover:text-forest-950"
                  >
                    {destination.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-2 text-sm">
              <a
                href={site.phoneHref}
                className="flex items-center gap-2 rounded-2xl bg-cream-100 px-4 py-3 font-bold text-forest-950"
              >
                <Phone className="h-4 w-4 text-saffron-600" />
                {site.phone}
              </a>
              <a
                href={site.emailHref}
                className="flex items-center gap-2 rounded-2xl bg-cream-100 px-4 py-3 font-bold text-forest-950"
              >
                <Mail className="h-4 w-4 text-saffron-600" />
                {site.email}
              </a>
              <p className="flex items-center gap-2 rounded-2xl bg-cream-100 px-4 py-3 font-semibold text-stone-600">
                <MapPin className="h-4 w-4 text-saffron-600" />
                {site.address}
              </p>
            </div>

            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-5 w-full"
            >
              Plan my trip
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
