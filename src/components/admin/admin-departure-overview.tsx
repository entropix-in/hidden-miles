"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { dateLabel } from "@/lib/departure-dates";
import { AdminMonthGrid } from "./admin-month-grid";
import { formatINR } from "@/lib/utils";

type Entry = { id: string; date: string; title: string; price: number; seats: number };

export function AdminDepartureOverview({ today, entries }: { today: string; entries: Entry[] }) {
  const days = useMemo(() => {
    const dates = new Map<string, Entry[]>();
    for (const entry of entries) {
      const group = dates.get(entry.date);
      if (group) group.push(entry);
      else dates.set(entry.date, [entry]);
    }
    return dates;
  }, [entries]);
  const current = today.slice(0, 7);
  const initial = entries.find((entry) => entry.date >= today)?.date
    ?? entries.find((entry) => entry.date.startsWith(current))?.date ?? today;
  const [month, setMonth] = useState(initial.slice(0, 7));
  const [day, setDay] = useState(initial);
  const monthCount = entries.filter((entry) => entry.date.startsWith(month)).length;
  const agenda = days.get(day) ?? [];

  function changeMonth(value: string) {
    setMonth(value);
    setDay(entries.find((entry) => entry.date.startsWith(value))?.date ?? `${value}-01`);
  }

  return (
    <div className="admin-departure-overview">
      <div className="admin-overview-calendar">
        <AdminMonthGrid expanded month={month} today={today} selected={[day]}
          onMonthChange={changeMonth} onSelect={setDay}
          toolbar={<button type="button" className="btn-outline" onClick={() => {
            setMonth(current);
            setDay(today);
          }}>Today</button>}
          describeDate={(date) => {
            const count = days.get(date)?.length ?? 0;
            return count ? `${count} ${count === 1 ? "departure" : "departures"}` : "";
          }}
          renderPreview={(date) => {
            const events = days.get(date) ?? [];
            if (!events.length) return null;
            return (
              <span aria-hidden className="admin-month-events">
                <span className="admin-month-mobile-count">{events.length}</span>
                {events.slice(0, 2).map((event) => <span key={event.id} className="admin-month-event">{event.title}</span>)}
                {events.length > 2 && <span className="admin-month-more">+{events.length - 2} more</span>}
              </span>
            );
          }} />
        <p className="admin-departure-meta mt-3" role="status">{monthCount} {monthCount === 1 ? "departure" : "departures"} this month</p>
      </div>
      <section className="admin-month-agenda" aria-label="Departures on selected date">
        <header><CalendarDays size={17} aria-hidden /><h3>{dateLabel(day)}</h3><span>{agenda.length}</span></header>
        {agenda.length ? (
          <ul>
            {agenda.map((entry) => (
              <li key={entry.id}>
                <Link href={`/admin/departures/${entry.id}`}>
                  <span className="min-w-0">
                    <span className="admin-departure-package-title">{entry.title}</span>
                    <span className="admin-departure-meta">{formatINR(entry.price)} · {entry.seats ? `${entry.seats} seats left` : "Sold out"}</span>
                  </span>
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="admin-departure-meta">No departures on this date.</p>}
      </section>
    </div>
  );
}
