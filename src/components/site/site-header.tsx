"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
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

export function SiteHeader({
  destinations,
  tourCounts = {},
  user = null,
}: {
  destinations: Destination[];
  tourCounts?: Record<string, number>;
  user?: { name: string; email: string } | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const firstName = user?.name.split(" ")[0] || "Account";

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const groups = destinationGroups(destinations);
  const featured = destinations.find((item) => item.slug === "kashmir") ?? destinations[0];
  const previewDestination =
    (previewSlug &&
      destinations.find((destination) => destination.slug === previewSlug)) ||
    featured;

  const navItems: NavLink[] = [
    ...["Group Tours", "Destinations", "Speciality Tours", "Personalised", "More"]
      .map((label) => navLinks.find((link) => link.label === label))
      .filter((link): link is NavLink => Boolean(link)),
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
      <div className="hidden bg-ink text-paper lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[13px]">
          <span className="font-medium text-navy-200">Hosting travellers since 1984</span>
          <div className="flex items-center gap-6 font-medium text-navy-100">
            <a
              href={site.phoneHref}
              className="flex items-center gap-1.5 transition hover:text-paper"
            >
              <Phone className="h-3.5 w-3.5 text-navy-300" />
              {site.phone}
            </a>
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold-400 transition hover:text-gold-300"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="relative border-b border-sand-300/80 bg-paper/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Logo compact />

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Main">
            {navItems.map((link) => {
              const hasChildren = Boolean(link.children?.length);
              const active =
                link.label === "More"
                  ? Boolean(
                      link.children?.some((child) => isActive(child.href)),
                    )
                  : isActive(link.href);

              return (
                <div key={link.label} className="group relative">
                  <Link
                    href={link.href}
                    className={cn("nav-link", active && "nav-link-active")}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      {link.label}
                      {hasChildren ? (
                        <ChevronDown className="h-3.5 w-3.5 text-navy-500 transition duration-300 group-hover:rotate-180" />
                      ) : null}
                    </span>
                  </Link>

                  {hasChildren && link.label !== "Destinations" ? (
                    <div className="invisible absolute left-1/2 top-full w-[260px] -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <div className="rounded-[20px] border border-sand-300 bg-paper p-2 shadow-[0_24px_64px_-28px_rgba(11,39,53,0.3)]">
                        {link.children?.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block rounded-[12px] px-3.5 py-2.5 text-sm font-semibold text-ink transition hover:bg-sand-100"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {link.label === "Destinations" ? (
                    // The nav bar's backdrop blur makes this fixed panel relative to the bar,
                    // so top-[50px] + pt-3 lines its panel up with the small nav dropdowns.
                    <div
                      className="invisible fixed left-1/2 top-[50px] w-[min(1040px,calc(100vw-40px))] -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                      onMouseLeave={() => setPreviewSlug(null)}
                    >
                      <div className="flex gap-8 rounded-[24px] border border-sand-300 bg-paper p-6 shadow-[0_32px_64px_-24px_rgba(11,39,53,0.25)]">
                        {groups.map((group) => (
                          <div
                            key={group.label}
                            className="flex w-[220px] shrink-0 flex-col"
                          >
                            <p className="type-label text-gold-600">{group.label}</p>
                            <div className="mt-3 grid gap-0.5">
                              {group.items.slice(0, 7).map((destination) => (
                                <Link
                                  key={destination.slug}
                                  href={`/destinations/${destination.slug}`}
                                  onMouseEnter={() => setPreviewSlug(destination.slug)}
                                  onFocus={() => setPreviewSlug(destination.slug)}
                                  className={cn(
                                    "flex items-center justify-between rounded-[12px] px-3 py-2 text-[15px] font-semibold text-ink transition hover:bg-sand-100",
                                    previewDestination?.slug === destination.slug &&
                                      "bg-sand-100",
                                  )}
                                >
                                  {destination.name}
                                  <span className="text-[13px] font-medium text-navy-500">
                                    {tourCounts[destination.slug] ?? 0}{" "}
                                    {(tourCounts[destination.slug] ?? 0) === 1
                                      ? "tour"
                                      : "tours"}
                                  </span>
                                </Link>
                              ))}
                            </div>
                            <Link
                              href="/destinations"
                              className="mt-auto inline-flex pt-4 text-sm font-bold text-blue-700 hover:text-blue-800"
                            >
                              All {group.label} destinations →
                            </Link>
                          </div>
                        ))}

                        {previewDestination ? (
                          <div className="relative hidden min-h-[360px] flex-1 overflow-hidden rounded-[20px] bg-ink xl:block">
                            <Image
                              key={previewDestination.slug}
                              src={imageUrl(previewDestination.image, 1100)}
                              alt={previewDestination.name}
                              fill
                              sizes="520px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                            <div className="absolute inset-x-8 bottom-8">
                              <p className="type-h3 text-paper">
                                {previewDestination.name}
                              </p>
                              <p className="type-small mt-1 text-navy-200">
                                {previewDestination.tagline}
                              </p>
                              <Link
                                href={`/destinations/${previewDestination.slug}`}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-400"
                              >
                                Explore {previewDestination.name} →
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((open) => !open);
                setMobileOpen(false);
              }}
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-sand-100"
              aria-label="Search tours and destinations"
              aria-expanded={searchOpen}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link href="/contact" className="btn btn-ink btn-sm hidden sm:inline-flex">
              Plan my trip
            </Link>
            {user ? (
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-full border border-sand-300 bg-paper py-1 pl-1 pr-3 transition hover:border-navy-300 hover:bg-sand-100 sm:flex"
                aria-label="My account"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[12px] font-extrabold uppercase text-gold-400">
                  {user.name.slice(0, 1) || "H"}
                </span>
                <span className="max-w-[92px] truncate text-[13px] font-bold text-ink">
                  {firstName}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold text-ink transition hover:bg-sand-100 sm:inline-flex"
              >
                <UserRound className="h-4 w-4" />
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-gold-400 lg:hidden"
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
              <Search className="h-5 w-5 text-navy-500" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tours, destinations or a feeling…"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-ink outline-none placeholder:text-navy-500"
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
        <div className="fixed inset-x-0 bottom-0 top-0 z-50 overflow-y-auto bg-paper lg:hidden">
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
                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-navy-500"
              />
            </form>
          </div>

          <nav className="px-5 py-5" aria-label="Mobile">
            {[
              { label: "Home", href: "/" },
              { label: "Group Tours", href: "/tours" },
              { label: "Destinations", href: "/destinations" },
              { label: "Speciality Tours", href: "/speciality-tours" },
              { label: "Personalised", href: "/personalised" },
              { label: "Corporate", href: "/corporate" },
              { label: "Experiences", href: "/experiences" },
              { label: "About", href: "/about" },
              { label: "Guest stories", href: "/testimonials" },
              { label: "Contact", href: "/contact" },
            ].map((item) => {
              const expandable = item.label === "Destinations";
              const isOpen = openGroup === item.label;
              const active = isActive(item.href);

              return (
                <div key={item.label} className="border-b border-sand-200/80 last:border-b-0">
                  <div className="flex items-center gap-1">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex-1 py-3.5 text-[16px] font-semibold transition",
                        active ? "text-gold-600" : "text-ink hover:text-gold-600",
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
                        className="grid h-10 w-10 place-items-center rounded-full text-navy-500 transition hover:bg-sand-100 hover:text-ink"
                      >
                        <ChevronDown
                          className={cn("h-4 w-4 transition duration-200", isOpen && "rotate-180")}
                          aria-hidden
                        />
                      </button>
                    ) : null}
                  </div>

                  {expandable && isOpen ? (
                    <div className="pb-5">
                      <div className="grid gap-4">
                        {groups.map((group) => (
                          <div key={group.label}>
                            <p className="type-label text-gold-600">{group.label}</p>
                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                              {group.items.slice(0, 8).map((destination) => (
                                <Link
                                  key={destination.slug}
                                  href={`/destinations/${destination.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="rounded-[10px] border border-sand-200 bg-sand-50 px-3 py-2 text-[13px] font-semibold text-ink transition hover:border-sand-300 hover:bg-sand-100"
                                >
                                  {destination.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/destinations"
                        onClick={() => setMobileOpen(false)}
                        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-700"
                      >
                        All destinations <span aria-hidden>→</span>
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-sand-300 px-5 py-5">
            {user ? (
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                aria-label={`Open ${firstName}'s profile`}
                className="flex w-fit items-center gap-2 rounded-full border border-sand-300 bg-paper py-1 pl-1 pr-3 transition hover:border-navy-300 hover:bg-sand-100"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[12px] font-extrabold uppercase text-gold-400">
                  {user.name.slice(0, 1) || "H"}
                </span>
                <span className="max-w-[92px] truncate text-[13px] font-bold text-ink">
                  {firstName}
                </span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-ink"
                >
                  <UserRound className="h-4 w-4" />
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-outline"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
