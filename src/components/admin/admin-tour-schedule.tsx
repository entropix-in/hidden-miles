"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarX2 } from "lucide-react";
import { AdminMonthGrid } from "./admin-month-grid";
import { formatINR } from "@/lib/utils";

type Departure = {
  id: string; date: string; price: number; booked: number; capacity: number; seatsLeft: number; requests: number;
};

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone: "UTC" });
const month = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" });
const weekday = new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" });
const utc = (date: string) => new Date(`${date}T00:00:00Z`);

export function AdminTourSchedule({ today, departures, pastHref }: {
  today: string; departures: Departure[]; pastHref: string;
}) {
  const router = useRouter();
  const upcoming = departures.filter((item) => item.date >= today);
  const pastCount = departures.length - upcoming.length;
  const [current, setCurrent] = useState((upcoming[0]?.date ?? today).slice(0, 7));
  const byDate = new Map(departures.map((item) => [item.date, item]));
  const selected = departures.filter((item) => item.date.startsWith(current)).map((item) => item.date);

  return (
    <div className="admin-tour-schedule">
      <div className="admin-tour-schedule-calendar">
        <AdminMonthGrid month={current} today={today} selected={selected} onMonthChange={setCurrent}
          describeDate={(date) => {
            const hit = byDate.get(date);
            return hit ? `Departure, ${hit.requests} booking ${hit.requests === 1 ? "request" : "requests"}` : "";
          }}
          renderPreview={(date) => (byDate.get(date)?.requests ?? 0) > 0
            ? <span className="admin-tour-booking-dot" aria-hidden /> : null}
          onSelect={(date) => { const hit = byDate.get(date); if (hit) router.push(`/admin/departures/${hit.id}`); }} />
        <p className="admin-tour-legend">
          <span><span className="admin-tour-legend-swatch" aria-hidden /> Departure</span>
          <span><span className="admin-tour-booking-dot" aria-hidden /> Has booking requests</span>
        </p>
      </div>

      <div className="admin-tour-schedule-list">
        {upcoming.length ? (
          <ul>
            {upcoming.map((item) => {
              const fill = item.capacity ? Math.min(100, Math.round((item.booked / item.capacity) * 100)) : 0;
              return (
                <li key={item.id}>
                  <Link href={`/admin/departures/${item.id}`} className="admin-tour-departure">
                    <span className="admin-tour-date" aria-hidden>
                      <span>{month.format(utc(item.date))}</span><strong>{day.format(utc(item.date))}</strong>
                    </span>
                    <span className="admin-tour-departure-body">
                      <span className="admin-tour-departure-title">{weekday.format(utc(item.date))}
                        <span className="admin-tour-year"> · {item.date.slice(0, 4)}</span><span className="sr-only">, {day.format(utc(item.date))} {month.format(utc(item.date))}</span></span>
                      <span className="admin-departure-meta">
                        {formatINR(item.price)} · {item.requests} {item.requests === 1 ? "request" : "requests"}
                      </span>
                      <span className="admin-tour-seats">
                        <span className="admin-tour-seats-bar" data-full={!item.seatsLeft || undefined}>
                          <span style={{ width: `${fill}%` }} />
                        </span>
                        <span>{item.seatsLeft ? `${item.booked}/${item.capacity} booked` : "Sold out"}</span>
                      </span>
                    </span>
                    <ArrowRight size={16} aria-hidden className="admin-tour-departure-arrow" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="admin-list-empty"><CalendarX2 size={22} aria-hidden /><span>No upcoming departures. Add dates to open bookings.</span></div>
        )}
        {!!pastCount && <Link href={pastHref} className="admin-text-action admin-tour-past">{pastCount} past {pastCount === 1 ? "departure" : "departures"}</Link>}
      </div>
    </div>
  );
}
