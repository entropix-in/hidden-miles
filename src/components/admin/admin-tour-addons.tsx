"use client";

import { useId, useState } from "react";
import { Check, ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { AdminCheckbox } from "./admin-checkbox";
import { AdminSelect } from "./admin-select";
import { AddonIconView } from "@/components/site/addon-icon";
import { addonIconLabels, MAX_ADDONS, newAddonId, type AddonIcon, type TourAddon } from "@/lib/addons";

const iconOptions = Object.entries(addonIconLabels) as [AddonIcon, string][];

function AddonIconPicker({ value, onChange }: { value: AddonIcon; onChange: (icon: AddonIcon) => void }) {
  const [open, setOpen] = useState(false);
  const labelId = useId();
  return (
    <div className="min-w-0">
      <span id={labelId} className="field-label">Icon</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger type="button" aria-labelledby={labelId}
          className="field flex h-10 cursor-pointer items-center justify-between gap-3 text-left">
          <span className="flex min-w-0 items-center gap-2 text-(--studio-pine)">
            <AddonIconView icon={value} className="h-4 w-4 shrink-0" />
            <span className="truncate text-(--studio-text)">{addonIconLabels[value]}</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-navy-500 transition", open && "rotate-180")} aria-hidden />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={6} align="end" className="admin-editor-positioner">
            <Popover.Popup className="admin-studio admin-editor-popover">
              <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-5 gap-1.5">
                {iconOptions.map(([icon, label]) => {
                  const selected = icon === value;
                  return (
                    <button key={icon} type="button" role="radio" aria-checked={selected} aria-label={label} title={label}
                      onClick={() => { onChange(icon); setOpen(false); }}
                      className="admin-experience-icon relative min-h-0! aspect-square p-0!" data-checked={selected || undefined}>
                      <AddonIconView icon={icon} className="h-5 w-5" />
                      {selected && <span className="admin-experience-icon-check" aria-hidden><Check size={10} strokeWidth={3} /></span>}
                    </button>
                  );
                })}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function SortableAddon({ addon, index, children }: { addon: TourAddon; index: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: addon.id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative flex gap-2 rounded-2xl border border-stone-200 bg-sand-50 p-5 pl-2",
        isDragging && "z-10 shadow-lg")}>
      <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners}
        className="admin-icon-button admin-drag-handle self-start" title="Drag to reorder"
        aria-label={`Drag ${addon.title || `add-on ${index + 1}`} to reorder`}>
        <GripVertical size={15} aria-hidden />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

export function AdminTourAddons({ initial = [] }: { initial?: TourAddon[] }) {
  const [addons, setAddons] = useState<TourAddon[]>(initial);

  function update<K extends keyof TourAddon>(index: number, field: K, value: TourAddon[K]) {
    setAddons((current) => current.map((addon, i) => (i === index ? { ...addon, [field]: value } : addon)));
  }

  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function add() {
    if (addons.length >= MAX_ADDONS) return;
    setAddons((current) => [...current, {
      id: newAddonId(), title: "", description: "", price: 0, unit: "person", icon: "sparkles", preselected: false,
    }]);
  }

  return (
    <section className="admin-form-panel" data-field="addons">
      <h2 className="text-base font-medium text-(--studio-text)">Add-ons</h2>
      <p className="mt-1 text-sm text-stone-600">
        Optional extras travellers can switch on at checkout for this package. Leave empty to skip the step&apos;s extras.
      </p>
      <input type="hidden" name="addons" value={JSON.stringify(addons)} />

      {addons.length ? (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;
            setAddons((current) => arrayMove(
              current,
              current.findIndex((addon) => addon.id === active.id),
              current.findIndex((addon) => addon.id === over.id),
            ));
          }}>
        <SortableContext items={addons.map((addon) => addon.id)} strategy={verticalListSortingStrategy}>
        <ol className="mt-4 space-y-3">
          {addons.map((addon, index) => (
            <SortableAddon key={addon.id} addon={addon} index={index}>
              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.6fr_0.7fr_0.7fr] sm:items-end">
                <div>
                  <label htmlFor={`addon-title-${addon.id}`} className="field-label">Title</label>
                  <input id={`addon-title-${addon.id}`} value={addon.title} maxLength={120} required
                    placeholder="Travel insurance" className="field h-10"
                    onChange={(event) => update(index, "title", event.target.value)} />
                </div>
                <div>
                  <label htmlFor={`addon-price-${addon.id}`} className="field-label">Price (₹)</label>
                  <input id={`addon-price-${addon.id}`} type="number" min="0" step="50" value={addon.price}
                    className="field h-10" onChange={(event) => update(index, "price", Math.max(0, Number(event.target.value) || 0))} />
                </div>
                <label>
                  <span className="field-label">Charged</span>
                  <AdminSelect value={addon.unit}
                    onValueChange={(value) => update(index, "unit", value === "booking" ? "booking" : "person")}>
                    <option value="person">Per traveller</option>
                    <option value="booking">Per booking</option>
                  </AdminSelect>
                </label>
                <AddonIconPicker value={addon.icon} onChange={(icon) => update(index, "icon", icon)} />
                <div className="sm:col-span-4">
                  <label htmlFor={`addon-description-${addon.id}`} className="field-label">Description</label>
                  <input id={`addon-description-${addon.id}`} value={addon.description} maxLength={240}
                    placeholder="Medical cover up to ₹5 lakh, trip cancellation and lost baggage." className="field h-10"
                    onChange={(event) => update(index, "description", event.target.value)} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AdminCheckbox label="Switched on by default" checked={addon.preselected}
                    onCheckedChange={(checked) => update(index, "preselected", checked)} />
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="btn-outline admin-icon-button admin-button-danger"
                    aria-label={`Remove ${addon.title || "add-on"}`}
                    onClick={() => setAddons((current) => current.filter((_, i) => i !== index))}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </SortableAddon>
          ))}
        </ol>
        </SortableContext>
        </DndContext>
      ) : (
        <p className="admin-editor-help mt-4">No add-ons yet.</p>
      )}

      <div className="mt-3 flex justify-end">
        <button type="button" onClick={add} disabled={addons.length >= MAX_ADDONS} className="btn-outline">
          <Plus className="h-3.5 w-3.5" /> Add add-on
        </button>
      </div>
    </section>
  );
}
