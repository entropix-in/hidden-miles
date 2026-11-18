"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessageSquareQuote,
  Package,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tours", label: "Packages", icon: Package },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
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
              "flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition",
              active
                ? "bg-white/15 text-white ring-1 ring-inset ring-white/25"
                : "text-sand-200/85 hover:bg-white/10 hover:text-sand-50",
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
