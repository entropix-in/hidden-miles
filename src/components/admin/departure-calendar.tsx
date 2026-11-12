"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const selectedFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatSelected(value: string) {
  return selectedFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function DepartureCalendar({ minDate }: { minDate: string }) {
  const min = new Date(`${minDate}T00:00:00Z`);
  const [month, setMonth] = useState({
    year: min.getUTCFullYear(),
    month: min.getUTCMonth(),
  });
  const [selected, setSelected] = useState<string[]>([]);

  const atFirstMonth =
    month.year === min.getUTCFullYear() && month.month === min.getUTCMonth();

  const firstWeekday = new Date(
    Date.UTC(month.year, month.month, 1),
  ).getUTCDay();
  const daysInMonth = new Date(
    Date.UTC(month.year, month.month + 1, 0),
  ).getUTCDate();

  const cells: Array<string | null> = Array.from(
    { length: firstWeekday },
    () => null,
  );
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateString(month.year, month.month, day));
  }

  function moveMonth(offset: number) {
    setMonth((current) => {
      const date = new Date(Date.UTC(current.year, current.month + offset, 1));
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
    });
  }

  function toggleDate(date: string) {
    if (date < minDate) return;
    setSelected((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date].sort(),
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="field-label mb-0">Departure dates</span>
        <span className="text-sm font-bold text-stone-400">
          {selected.length} selected
        </span>
      </div>

      <div className="mt-2 rounded-2xl border border-stone-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            disabled={atFirstMonth}
            aria-label="Previous month"
            className="grid h-8 w-8 place-items-center rounded-full border border-stone-200 text-stone-600 transition hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-navy-950">
            <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
            {monthFormatter.format(
              new Date(Date.UTC(month.year, month.month, 1)),
            )}
          </p>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            aria-label="Next month"
            className="grid h-8 w-8 place-items-center rounded-full border border-stone-200 text-stone-600 transition hover:border-blue-400 hover:text-blue-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {weekdays.map((day, index) => (
            <span
              key={`${day}-${index}`}
              className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400"
            >
              {day}
            </span>
          ))}
          {cells.map((date, index) => {
            if (!date) {
              return <span key={`blank-${index}`} />;
            }

            const disabled = date < minDate;
            const active = selected.includes(date);
            const today = date === minDate;

            return (
              <button
                key={date}
                type="button"
                onClick={() => toggleDate(date)}
                disabled={disabled}
                aria-label={`Select ${formatSelected(date)}`}
                aria-pressed={active}
                className={cn(
                  "grid aspect-square place-items-center rounded-full text-sm font-bold transition",
                  disabled && "cursor-not-allowed text-stone-300",
                  !disabled &&
                    !active &&
                    "text-stone-700 hover:bg-blue-50 hover:text-blue-700",
                  active && "bg-blue-600 text-white shadow-md shadow-blue-900/20",
                  today && !active && "ring-1 ring-blue-300",
                )}
              >
                {Number(date.slice(-2))}
              </button>
            );
          })}
        </div>
      </div>

      {selected.length ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {selected.map((date) => (
            <span
              key={date}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-blue-800"
            >
              {formatSelected(date)}
              <button
                type="button"
                onClick={() => toggleDate(date)}
                aria-label={`Remove ${formatSelected(date)}`}
                className="grid h-3.5 w-3.5 place-items-center rounded-full transition hover:bg-blue-200"
              >
                <X className="h-2.5 w-2.5" strokeWidth={3} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 underline decoration-dotted underline-offset-4 hover:text-blue-700"
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-stone-400">
          Tap one or more dates in the calendar to make them bookable.
        </p>
      )}

      {selected.map((date) => (
        <input key={date} type="hidden" name="startDate" value={date} />
      ))}
    </div>
  );
}
