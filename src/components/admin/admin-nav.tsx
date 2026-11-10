"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/experiences", label: "Experiences", icon: Sparkles },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
  },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[12px] font-bold transition",
              active
                ? "bg-blue-500 text-white shadow-lg shadow-blue-950/20"
                : "text-sand-200/70 hover:bg-white/10 hover:text-sand-50",
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
