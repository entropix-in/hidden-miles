"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@base-ui/react/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarDays, dateLabel, monthLabel, shiftDay, shiftMonth } from "@/lib/departure-dates";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

export function AdminMonthGrid({ month, today, selected, minDate, onMonthChange, onSelect, unavailable, expanded, renderPreview, describeDate, toolbar }: {
  month: string;
  today: string;
  selected: string[];
  minDate?: string;
  onMonthChange: (month: string) => void;
  onSelect: (date: string) => void;
  unavailable?: Set<string>;
  expanded?: boolean;
  renderPreview?: (date: string) => ReactNode;
  describeDate?: (date: string) => string;
  toolbar?: ReactNode;
}) {
  const grid = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState("");
  const days = calendarDays(month);
  const disabled = (date: string) => Boolean((minDate && date < minDate) || unavailable?.has(date));
  const entry = [focused, ...selected, today, ...days].find((day) => day && day.startsWith(month) && !disabled(day));

  return (
    <div className={expanded ? "admin-month admin-month-overview" : "admin-month"}>
      <div className="admin-month-header">
        <p aria-live="polite">{monthLabel(month)}</p>
        <div>
          {toolbar}
          <Button type="button" className="admin-icon-button" aria-label="Previous month"
            disabled={Boolean(minDate && month <= minDate.slice(0, 7))}
            onClick={() => onMonthChange(shiftMonth(month, -1))}><ChevronLeft size={17} /></Button>
          <Button type="button" className="admin-icon-button" aria-label="Next month"
            onClick={() => onMonthChange(shiftMonth(month, 1))}><ChevronRight size={17} /></Button>
        </div>
      </div>
      <div ref={grid} className="admin-month-grid" role="group" aria-label={monthLabel(month)}
        onKeyDown={(event) => {
          const offset = offsets[event.key];
          const date = (event.target as HTMLElement).dataset.date;
          if (!offset || !date) return;
          event.preventDefault();
          let next = shiftDay(date, offset);
          for (let step = 0; step < 41 && unavailable?.has(next); step++) next = shiftDay(next, offset);
          if (disabled(next)) return;
          setFocused(next);
          if (!next.startsWith(month)) onMonthChange(next.slice(0, 7));
          requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus());
        }}>
        {weekdays.map((weekday) => (
          <span key={weekday} className="admin-month-weekday" aria-hidden="true">{weekday.slice(0, 3)}</span>
        ))}
        {days.map((date, index) => date ? (
          <Button key={date} type="button" className="admin-month-day" data-date={date}
            tabIndex={date === entry ? 0 : -1} disabled={disabled(date)}
            aria-current={date === today ? "date" : undefined}
            aria-label={[dateLabel(date), unavailable?.has(date) ? "Already scheduled" : describeDate?.(date)].filter(Boolean).join(", ")}
            aria-pressed={selected.includes(date)}
            onFocus={() => setFocused(date)} onClick={() => onSelect(date)}>
            <span className="admin-month-day-number">{Number(date.slice(-2))}</span>
            {renderPreview?.(date)}
          </Button>
        ) : <span key={`blank-${index}`} className="admin-month-blank" aria-hidden="true" />)}
      </div>
    </div>
  );
}
