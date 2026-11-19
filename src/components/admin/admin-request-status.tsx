"use client";

import { useState } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown } from "lucide-react";

export function AdminRequestStatus<Status extends string>({ id, name, status, returnTo, labels, action, fieldLabel }: {
  id: string;
  name: string;
  status: Status;
  labels: Record<Status, string>;
  action: (formData: FormData) => Promise<void>;
  fieldLabel: string;
  returnTo: string;
}) {
  const [next, setNext] = useState(status);
  return (
    <Popover.Root onOpenChange={(open) => { if (open) setNext(status); }}>
      <Popover.Trigger type="button" className="admin-booking-status" data-status={status}
        aria-label={`Change status for ${name} (currently ${labels[status]})`}>
        <span>{labels[status]}</span><ChevronDown size={14} aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner className="admin-package-positioner" align="end" sideOffset={6}>
          <Popover.Popup className="admin-studio admin-editor-popover">
            <form action={action} aria-label={`Update status for ${name}`}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <p className="field-label">{fieldLabel}</p>
              <RadioGroup className="admin-status-options" aria-label={fieldLabel}
                name="status" value={next} onValueChange={setNext}>
                {(Object.keys(labels) as Status[]).map((value) => (
                  <Radio.Root className="admin-status-option" value={value} key={value}>
                    {labels[value]}<Radio.Indicator><Check size={15} aria-hidden /></Radio.Indicator>
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
