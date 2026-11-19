"use client";

import { useId, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Pencil, Plus } from "lucide-react";
import type { ItineraryBadge, ItineraryBadgeKind } from "@/data/tours";
import { itineraryBadgeKindLabels } from "@/lib/itinerary";
import { AdminSelect } from "./admin-select";

const quickBadges: ItineraryBadge[] = [
  { label: "Breakfast", kind: "meal" },
  { label: "Lunch", kind: "meal" },
  { label: "Dinner", kind: "meal" },
  { label: "Transfer", kind: "travel" },
  { label: "Overnight stay", kind: "stay" },
  { label: "Free time", kind: "leisure" },
];

function BadgeEditor({ badge, badges, onSave, onRemove }: {
  badge?: ItineraryBadge;
  badges: ItineraryBadge[];
  onSave: (badge: ItineraryBadge) => void;
  onRemove?: () => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<ItineraryBadgeKind>("experience");
  const duplicate = (candidate: ItineraryBadge) => badges.some((item) =>
    item !== badge && item.kind === candidate.kind && item.label.toLowerCase() === candidate.label.toLowerCase());

  function save(candidate: ItineraryBadge) {
    if (!candidate.label || duplicate(candidate)) return;
    onSave(candidate);
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={(next) => {
      if (next) {
        setLabel(badge?.label ?? "");
        setKind(badge?.kind ?? "experience");
      }
      setOpen(next);
    }}>
      <Popover.Trigger type="button" className={badge ? "admin-day-badge" : "btn-outline"}
        aria-label={badge ? `Edit ${badge.label} badge` : undefined} disabled={!badge && badges.length >= 8}>
        {badge ? <>{badge.label}<Pencil size={13} aria-hidden /></> : <><Plus size={15} aria-hidden /> Add badge</>}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} className="admin-editor-positioner">
          <Popover.Popup className="admin-studio admin-editor-popover" initialFocus={input}>
            {!badge && (
              <div className="mb-3">
                <p className="field-label">Quick add</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickBadges.map((preset) => (
                    <button type="button" key={preset.label} className="admin-day-badge"
                      disabled={duplicate(preset)} onClick={() => save(preset)}>{preset.label}</button>
                  ))}
                </div>
              </div>
            )}
            <label className="field-label" htmlFor={id}>{badge ? "Badge label" : "Custom badge"}</label>
            <input ref={input} id={id} className="field" value={label} maxLength={40}
              onChange={(event) => setLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  save({ label: label.trim(), kind });
                }
              }} />
            <label className="field-label mt-3" htmlFor={id + "-category"}>Category</label>
            <AdminSelect id={id + "-category"} value={kind} onValueChange={(value) => setKind(value as ItineraryBadgeKind)}>
              {Object.entries(itineraryBadgeKindLabels).map(([value, text]) =>
                <option key={value} value={value}>{text}</option>)}
            </AdminSelect>
            <div className="admin-popover-actions">
              {onRemove && <button type="button" className="btn-outline admin-button-danger"
                onClick={() => { onRemove(); setOpen(false); }}>Remove</button>}
              <button type="button" className="btn-primary" disabled={!label.trim() || duplicate({ label: label.trim(), kind })}
                onClick={() => save({ label: label.trim(), kind })}>{badge ? "Save badge" : "Add custom badge"}</button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function AdminItineraryBadges({ badges, automatic, onChange }: {
  badges: ItineraryBadge[];
  automatic: boolean;
  onChange: (badges: ItineraryBadge[] | undefined) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="field-label m-0!">Badges</span>
        {automatic && badges.length > 0 && <span className="admin-editor-help">Suggested</span>}
        {!automatic && <button type="button" className="admin-text-action"
          onClick={() => onChange(undefined)}>Use suggestions</button>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {badges.map((badge, index) => (
          <BadgeEditor key={index} badge={badge} badges={badges}
            onSave={(next) => onChange(badges.map((item, position) => position === index ? next : item))}
            onRemove={() => onChange(badges.filter((_, position) => position !== index))} />
        ))}
        <BadgeEditor badges={badges} onSave={(next) => onChange([...badges, next])} />
      </div>
    </div>
  );
}
