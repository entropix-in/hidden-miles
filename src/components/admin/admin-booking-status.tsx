"use client";

import { useState } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown } from "lucide-react";
import { updateBookingStatusAction } from "@/app/admin/actions";
import { bookingStatusLabels } from "@/lib/booking-status";
import type { BookingStatus } from "@/lib/types";

export function AdminBookingStatus({ id, name, status, returnTo }: {
  id: string;
  name: string;
  status: BookingStatus;
  returnTo: string;
}) {
  const [next, setNext] = useState(status);
  return (
    <Popover.Root onOpenChange={(open) => { if (open) setNext(status); }}>
      <Popover.Trigger type="button" className="admin-booking-status" data-status={status}
        aria-label={`Change status for ${name} (currently ${bookingStatusLabels[status]})`}>
        <span>{bookingStatusLabels[status]}</span><ChevronDown size={14} aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner className="admin-package-positioner" align="end" sideOffset={6}>
          <Popover.Popup className="admin-studio admin-editor-popover">
            <form action={updateBookingStatusAction} aria-label={`Update booking for ${name}`}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <p className="field-label">Booking status</p>
              <RadioGroup className="admin-status-options" aria-label="Booking status"
                name="status" value={next} onValueChange={setNext}>
                {Object.entries(bookingStatusLabels).map(([value, label]) => (
                  <Radio.Root className="admin-status-option" value={value} key={value}>
                    {label}<Radio.Indicator><Check size={15} aria-hidden /></Radio.Indicator>
                  </Radio.Root>
                ))}
              </RadioGroup>
              <div className="admin-popover-actions">
                <button className="btn-primary" type="submit" disabled={next === status}>Save status</button>
              </div>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
