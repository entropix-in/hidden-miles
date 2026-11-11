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
import { Logo } from "@/components/site/logo";
import { navLinks, site, type NavLink } from "@/data/site";
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

  const destinationGroups = [
    {
      label: "Indian Group Tours",
      items: destinations.filter((item) => item.region === "India"),
    },
    {
      label: "International Group Tours",
      items: destinations.filter((item) => item.region === "International"),
    },
  ];

  const navItems: NavLink[] = navLinks.map((link) =>
    link.label === "Destinations"
      ? {
          ...link,
          children: destinationGroups.flatMap((group) =>
            group.items.map((destination) => ({
              label: destination.name,
              href: `/destinations/${destination.slug}`,
              group: group.label,
            })),
          ),
        }
      : link,
  );

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-navy-950 text-sand-100 md:block">
        <div className="container-page flex h-10 items-center justify-between text-sm font-semibold tracking-wide">
          <p className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Festive escapes are here — save up to 20% on select group tours
          </p>
          <div className="flex items-center gap-6 text-sand-200/90">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              {site.hours}
            </span>
            <a
              href={site.emailHref}
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              {site.email}
            </a>
            <a
              href={site.phoneHref}
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <Phone className="h-3.5 w-3.5 text-blue-400" />
              {site.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-stone-200/80 bg-sand-50/95 backdrop-blur-xl">
        <div className="container-page flex h-[76px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
            {navItems.map((link) => {
              const hasChildren = Boolean(link.children?.length);
              const childGroups = link.children?.some((child) => child.group)
                ? Array.from(
                    new Set(link.children.map((child) => child.group)),
                  ).map((group) => ({
                    label: group ?? "",
                    items:
                      link.children?.filter((child) => child.group === group) ??
                      [],
                  }))
                : null;

              return (
                <div key={link.label} className="group relative">
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-2.5 text-sm font-bold transition",
                      isActive(link.href)
                        ? "bg-navy-950 text-sand-50"
                        : "text-stone-700 hover:bg-sand-200/70 hover:text-navy-950",
                    )}
                  >
                    {link.label}
                    {hasChildren ? (
                      <ChevronDown className="h-3.5 w-3.5 transition duration-300 group-hover:rotate-180" />
                    ) : null}
                  </Link>

                  {hasChildren ? (
                    <div
                      className={cn(
                        "invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
                        (link.children?.length ?? 0) > 4
                          ? "w-[540px]"
                          : "w-[320px]",
                      )}
                    >
                      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-2 shadow-2xl shadow-navy-950/10">
                        {childGroups ? (
                          <div className="grid grid-cols-2 gap-2">
                            {childGroups.map((group) => (
                              <div key={group.label}>
                                <p className="px-4 pb-2 pt-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-700">
                                  {group.label}
                                </p>
                                <div className="grid gap-0.5">
                                  {group.items.map((child) => (
                                    <Link
                                      key={child.label}
                                      href={child.href}
                                      className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-sand-100 hover:text-navy-950"
                                    >
                                      {child.label}
                                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "grid gap-0.5",
                              (link.children?.length ?? 0) > 4 &&
                                "grid-cols-2",
                            )}
                          >
                            {link.children?.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                className="rounded-xl px-4 py-3 transition hover:bg-sand-100"
                              >
                                <span className="flex items-center justify-between gap-3 text-sm font-bold text-navy-950">
                                  {child.label}
                                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                                </span>
                                {child.description ? (
                                  <span className="mt-0.5 block text-sm leading-5 text-stone-500">
                                    {child.description}
                                  </span>
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="btn-primary hidden px-5 py-3 sm:inline-flex">
              Plan my trip
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-full border border-stone-300 bg-white text-navy-950 xl:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-b border-stone-200 bg-sand-50 shadow-xl xl:hidden">
          <div className="container-page max-h-[calc(100vh-76px)] overflow-y-auto py-5">
            <nav className="grid gap-1" aria-label="Mobile">
              {navItems.map((link) => {
                const childGroups = link.children?.some((child) => child.group)
                  ? Array.from(
                      new Set(link.children.map((child) => child.group)),
                    ).map((group) => ({
                      label: group ?? "",
                      items:
                        link.children?.filter(
                          (child) => child.group === group,
                        ) ?? [],
                    }))
                  : null;

                return (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-2xl px-4 py-3 text-sm font-bold",
                        isActive(link.href)
                          ? "bg-navy-950 text-sand-50"
                          : "text-stone-700 hover:bg-sand-200",
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children ? (
                      <div className="mb-2 ml-3 grid gap-0.5 border-l border-stone-200 pl-2">
                        {childGroups
                          ? childGroups.map((group) => (
                              <div key={group.label}>
                                <p className="px-3 pb-1 pt-2 text-sm font-extrabold uppercase tracking-[0.14em] text-blue-700">
                                  {group.label}
                                </p>
                                <div className="grid grid-cols-2 gap-0.5">
                                  {group.items.map((child) => (
                                    <Link
                                      key={child.label}
                                      href={child.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-sand-100 hover:text-navy-950"
                                    >
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))
                          : link.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-sand-100 hover:text-navy-950"
                              >
                                {child.label}
                              </Link>
                            ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <div className="mt-5 grid gap-2 text-sm">
              <a
                href={site.phoneHref}
                className="flex items-center gap-2 rounded-2xl bg-sand-100 px-4 py-3 font-bold text-navy-950"
              >
                <Phone className="h-4 w-4 text-blue-600" />
                {site.phone}
              </a>
              <a
                href={site.emailHref}
                className="flex items-center gap-2 rounded-2xl bg-sand-100 px-4 py-3 font-bold text-navy-950"
              >
                <Mail className="h-4 w-4 text-blue-600" />
                {site.email}
              </a>
              <p className="flex items-center gap-2 rounded-2xl bg-sand-100 px-4 py-3 font-semibold text-stone-600">
                <MapPin className="h-4 w-4 text-blue-600" />
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
