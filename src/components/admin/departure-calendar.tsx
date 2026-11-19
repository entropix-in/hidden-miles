"use client";

import { useId, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { dateLabel } from "@/lib/departure-dates";
import { AdminMonthGrid } from "./admin-month-grid";

export function DepartureCalendar({ today, minDate, unavailable, selected, multiple, onSelect, onRemove }: {
  today: string;
  minDate?: string;
  unavailable: string[];
  selected: string[];
  multiple: boolean;
  onSelect: (date: string) => void;
  onRemove: (date: string) => void;
}) {
  const id = useId();
  const popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState((selected[0] ?? today).slice(0, 7));

  return (
    <div>
      <span id={id} className="field-label">{multiple ? "Departure dates" : "Departure date"}</span>
      <Popover.Root open={open} onOpenChange={(next) => {
        if (next) setMonth((selected[0] ?? today).slice(0, 7));
        setOpen(next);
      }}>
        <Popover.Trigger type="button" className="field admin-date-trigger" aria-labelledby={`${id} ${id}-value`}>
          <CalendarDays size={17} aria-hidden />
          <span id={id + "-value"}>{multiple ? selected.length ? `${selected.length} selected` : "Choose dates"
            : selected[0] ? dateLabel(selected[0]) : "Choose a date"}</span>
          <ChevronDown size={16} aria-hidden />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={5} className="admin-date-positioner">
            <Popover.Popup ref={popup} className="admin-studio admin-date-popup" aria-label="Choose departure dates"
              initialFocus={() => popup.current?.querySelector<HTMLButtonElement>("[data-date][tabindex='0']") ?? true}>
              <AdminMonthGrid month={month} today={today} minDate={minDate} selected={selected}
                unavailable={new Set(unavailable)} onMonthChange={setMonth} onSelect={(date) => {
                  onSelect(date);
                  if (!multiple) setOpen(false);
                }} />
              {multiple && <div className="admin-date-popup-footer">
                <span>{selected.length ? `${selected.length} selected` : "Select one or more dates"}</span>
                <Popover.Close className="btn-outline">Done</Popover.Close>
              </div>}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {multiple && !!selected.length && <div className="admin-date-chips">
        {selected.map((date) => <button key={date} type="button" aria-label={`Remove ${dateLabel(date)}`} onClick={() => onRemove(date)}>
          {dateLabel(date)} <X size={13} aria-hidden />
        </button>)}
      </div>}
      {selected.map((date) => <input key={date} type="hidden" name="startDate" value={date} />)}
    </div>
  );
}
