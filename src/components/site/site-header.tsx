"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Clock,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Rating } from "@/components/site/rating";
import { navLinks, site, type NavLink } from "@/data/site";
import type { Destination } from "@/data/destinations";
import { cn, imageUrl } from "@/lib/utils";

const destinationGroups = (destinations: Destination[]) => [
  {
    label: "India",
    items: destinations.filter((item) => item.region === "India"),
  },
  {
    label: "International",
    items: destinations.filter((item) => item.region === "International"),
  },
];

export function SiteHeader({ destinations }: { destinations: Destination[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const groups = destinationGroups(destinations);
  const featured = destinations.find((item) => item.slug === "kashmir") ?? destinations[0];

  const navItems: NavLink[] = [
    { label: "Home", href: "/" },
    ...["Group Tours", "Destinations", "Speciality Tours", "Personalised"]
      .map((label) => navLinks.find((link) => link.label === label))
      .filter((link): link is NavLink => Boolean(link)),
    { label: "About", href: "/about" },
  ].map((link) =>
      link.label === "Destinations"
        ? {
            ...link,
            children: groups.flatMap((group) =>
              group.items.map((destination) => ({
                label: destination.name,
                href: `/destinations/${destination.slug}`,
                group: group.label,
              })),
            ),
          }
        : link,
    );

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    const match = destinations.find(
      (destination) =>
        destination.name.toLowerCase().includes(value) ||
        destination.slug === value,
    );
    window.location.href = match
      ? `/tours?destination=${match.slug}`
      : `/tours${value ? `?q=${encodeURIComponent(value)}` : ""}`;
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-ink text-paper xl:block">
        <div className="container-page flex h-10 items-center justify-between text-[13px]">
          <div className="flex items-center gap-6">
            <Rating score="4.9" count="12,400+ verified reviews" dark />
            <span className="text-white/25">·</span>
            <span className="font-medium text-navy-200">
              Hosting travellers since 1984
            </span>
          </div>
          <div className="flex items-center gap-7 font-medium text-navy-100">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-navy-300" />
              {site.hours}
            </span>
            <a
              href={site.phoneHref}
              className="flex items-center gap-1.5 transition hover:text-paper"
            >
              <Phone className="h-3.5 w-3.5 text-navy-300" />
              {site.phone}
            </a>
            <a
              href={site.emailHref}
              className="flex items-center gap-1.5 transition hover:text-paper"
            >
              <Mail className="h-3.5 w-3.5 text-navy-300" />
              {site.email}
            </a>
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-gold-400 transition hover:text-gold-300"
            >
              WhatsApp us ↗
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="relative border-b border-sand-300 bg-paper/95 backdrop-blur-xl">
        <div className="container-page flex h-[74px] items-center justify-between gap-4 py-3">
          <Logo compact />

          <nav className="hidden items-center gap-0.5 min-[1360px]:flex" aria-label="Main">
            {navItems.map((link) => {
              const hasChildren = Boolean(link.children?.length);

              return (
                <div key={link.label} className="group relative">
                  <Link
                    href={link.href}
                    className={cn("nav-link", isActive(link.href) && "nav-link-active")}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      {link.label}
                      {hasChildren ? (
                        <ChevronDown className="h-3.5 w-3.5 text-navy-400 transition duration-300 group-hover:rotate-180" />
                      ) : null}
                    </span>
                    <span className="nav-dot" aria-hidden="true" />
                  </Link>

                  {hasChildren && link.label !== "Destinations" ? (
                    <div className="invisible absolute left-1/2 top-full w-[300px] -translate-x-1/2 pt-4 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <div className="rounded-[20px] border border-sand-300 bg-paper p-2 shadow-[0_24px_64px_-28px_rgba(11,39,53,0.3)]">
                        {link.children?.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center justify-between gap-3 rounded-[14px] px-4 py-3 transition hover:bg-sand-100"
                          >
                            <span>
                              <span className="block text-sm font-bold text-ink">
                                {child.label}
                              </span>
                              {child.description ? (
                                <span className="mt-0.5 block text-xs font-medium leading-5 text-navy-500">
                                  {child.description}
                                </span>
                              ) : null}
                            </span>
                            <span className="text-navy-400">↗</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {link.label === "Destinations" ? (
                    <div className="invisible absolute left-1/2 top-full w-[min(1200px,calc(100vw-40px))] -translate-x-1/2 pt-4 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <div className="flex gap-12 rounded-[28px] border border-sand-300 bg-paper p-10 shadow-[0_32px_64px_-24px_rgba(11,39,53,0.25)]">
                        {groups.map((group) => (
                          <div key={group.label} className="w-[250px] shrink-0">
                            <p className="type-label text-gold-600">{group.label}</p>
                            <div className="mt-3 grid gap-0.5">
                              {group.items.slice(0, 7).map((destination) => (
                                <Link
                                  key={destination.slug}
                                  href={`/destinations/${destination.slug}`}
                                  className="flex items-center justify-between rounded-[12px] px-3 py-2.5 text-[15px] font-semibold text-ink transition hover:bg-sand-100"
                                >
                                  {destination.name}
                                  <span className="text-[13px] font-medium text-navy-400">
                                    {destination.region}
                                  </span>
                                </Link>
                              ))}
                            </div>
                            <Link
                              href="/destinations"
                              className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-800"
                            >
                              All {group.label.toLowerCase()} destinations →
                            </Link>
                          </div>
                        ))}

                        {featured ? (
                          <div className="relative hidden min-h-[420px] w-[508px] shrink-0 overflow-hidden rounded-[20px] bg-ink xl:block">
                            <Image
                              src={imageUrl(featured.image, 1100)}
                              alt={featured.name}
                              fill
                              sizes="508px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                            <div className="absolute inset-x-8 bottom-8">
                              <span className="badge badge-gold">Season pick</span>
                              <p className="type-h3 mt-3 text-paper">
                                {featured.name} in bloom
                              </p>
                              <p className="type-small mt-2 text-navy-200">
                                {featured.tagline}
                              </p>
                              <Link
                                href={`/destinations/${featured.slug}`}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-400"
                              >
                                Explore {featured.name} →
                              </Link>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              className="hidden items-center gap-2 rounded-full border border-sand-300 bg-paper px-4 py-2.5 text-sm font-medium text-navy-500 transition hover:border-navy-300 xl:flex"
              aria-label="Search tours and destinations"
              aria-expanded={searchOpen}
            >
              <Search className="h-4 w-4 text-ink" />
              Search
              <span className="type-label ml-2 text-[10px] text-navy-500">⌘K</span>
            </button>
            <Link
              href="/testimonials"
              className="relative hidden h-[46px] w-[46px] place-items-center rounded-full border border-sand-300 bg-paper text-ink transition hover:border-navy-300 sm:grid"
              aria-label="Saved journeys"
            >
              <Heart className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-gold-400 text-[10px] font-extrabold text-ink">
                3
              </span>
            </Link>
            <Link href="/contact" className="btn btn-ink hidden sm:inline-flex">
              Plan my trip
              <span className="btn-dot">→</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setSearchOpen((open) => !open);
                setMobileOpen(false);
              }}
              className="grid h-[46px] w-[46px] place-items-center rounded-full border border-sand-300 bg-paper text-ink min-[1280px]:hidden"
              aria-label="Search tours and destinations"
              aria-expanded={searchOpen}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="grid h-[46px] w-[46px] place-items-center rounded-full bg-ink text-gold-400 min-[1360px]:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div className="border-t border-sand-300 bg-paper">
            <form
              onSubmit={submitSearch}
              className="container-page flex items-center gap-3 py-4"
            >
              <Search className="h-5 w-5 text-navy-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tours, destinations or a feeling…"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-ink outline-none placeholder:text-navy-400"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
                <span className="btn-dot">→</span>
              </button>
            </form>
          </div>
        ) : null}
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-0 z-50 overflow-y-auto bg-paper min-[1360px]:hidden">
          <div className="flex items-center justify-between border-b border-sand-300 px-5 py-3.5">
            <Logo compact />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="grid h-[42px] w-[42px] place-items-center rounded-full bg-ink text-gold-400"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 pt-4">
            <form
              onSubmit={submitSearch}
              className="flex items-center gap-3 rounded-full border border-sand-300 bg-paper px-5 py-3.5"
            >
              <Search className="h-4 w-4 text-ink" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tours & destinations"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-navy-400"
              />
            </form>
          </div>

          <nav className="px-5 py-4" aria-label="Mobile">
            {[
              { label: "Home", href: "/" },
              { label: "Group Tours", href: "/tours" },
              { label: "Destinations", href: "/destinations" },
              { label: "Speciality Tours", href: "/speciality-tours" },
              { label: "Personalised", href: "/personalised" },
              { label: "About", href: "/about" },
              { label: "Guest stories", href: "/testimonials" },
              { label: "Contact", href: "/contact" },
            ].map((item) => {
              const expandable = item.label === "Destinations";
              const isOpen = openGroup === item.label;

              return (
                <div key={item.label} className="border-b border-sand-300">
                  <div className="flex items-center justify-between gap-3 py-4">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "type-h4 text-ink",
                        isActive(item.href) && "text-gold-600",
                      )}
                    >
                      {item.label}
                    </Link>
                    {expandable ? (
                      <button
                        type="button"
                        onClick={() => setOpenGroup(isOpen ? null : item.label)}
                        aria-label={isOpen ? "Collapse destinations" : "Expand destinations"}
                        aria-expanded={isOpen}
                        className="text-xl text-gold-600"
                      >
                        {isOpen ? "−" : "›"}
                      </button>
                    ) : (
                      <span className="text-xl text-navy-300">›</span>
                    )}
                  </div>

                  {expandable && isOpen ? (
                    <div className="flex flex-wrap gap-2 pb-4">
                      {destinations.slice(0, 8).map((destination) => (
                        <Link
                          key={destination.slug}
                          href={`/destinations/${destination.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="chip"
                        >
                          {destination.name}
                        </Link>
                      ))}
                      <Link
                        href="/destinations"
                        onClick={() => setMobileOpen(false)}
                        className="chip text-blue-700"
                      >
                        All destinations →
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="px-5 pb-10">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="btn btn-ink btn-lg w-full"
            >
              Plan my trip
              <span className="btn-dot">→</span>
            </Link>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a href={site.phoneHref} className="btn btn-light">
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                WhatsApp
              </a>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-[13px] font-medium text-navy-500">
              <MapPin className="h-3.5 w-3.5" />
              {site.address}
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
