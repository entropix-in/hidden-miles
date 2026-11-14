"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookingsTabs({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const onRequests = pathname.startsWith("/admin/bookings/requests");

  const tabs = [
    {
      href: "/admin/bookings",
      label: "Departures & dates",
      icon: CalendarDays,
      active: !onRequests,
      badge: 0,
    },
    {
      href: "/admin/bookings/requests",
      label: "Booking requests",
      icon: Inbox,
      active: onRequests,
      badge: pendingCount,
    },
  ];

  return (
    <nav
      aria-label="Bookings sections"
      className="mb-6 flex w-fit flex-wrap items-center gap-1 rounded-full border border-stone-200 bg-white p-1"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider transition",
            tab.active
              ? "bg-navy-950 text-white"
              : "text-stone-500 hover:text-navy-950",
          )}
        >
          <tab.icon className="h-3.5 w-3.5" />
          {tab.label}
          {tab.badge ? (
            <span
              className={cn(
                "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-extrabold",
                tab.active
                  ? "bg-gold-400 text-navy-950"
                  : "bg-gold-100 text-gold-800",
              )}
            >
              {tab.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
