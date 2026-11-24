"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Ticket,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessageSquareQuote,
  Package,
  Percent,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tours", label: "Packages", icon: Package },
  { href: "/admin/departures", label: "Departures", icon: CalendarCheck },
  { href: "/admin/bookings", label: "Booking requests", icon: Ticket },
  { href: "/admin/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/experiences", label: "Experiences", icon: Sparkles },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
  },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
];

export function AdminNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex flex-wrap gap-1 lg:flex-col">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onNavigate={onNavigate}
            aria-current={active ? (pathname === link.href ? "page" : "location") : undefined}
            className={cn(
              "admin-nav-link",
              active && "admin-nav-active",
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
