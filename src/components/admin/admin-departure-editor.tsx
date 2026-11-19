"use client";

import { useRef, useState, useTransition } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarPlus, Pencil, X } from "lucide-react";
import { saveDepartureAction } from "@/app/admin/actions";
import type { TourDeparture } from "@/lib/types";
import { AdminPackagePicker, type PackageOption } from "./admin-package-picker";
import { DepartureCalendar } from "./departure-calendar";

export function AdminDepartureEditor({ packages, selected, departure, unavailable, minDate, returnTo, defaultOpen }: {
  packages: PackageOption[];
  selected?: PackageOption;
  departure?: TourDeparture;
  unavailable: { tourSlug: string; startDate: string }[];
  minDate: string;
  returnTo: string;
  defaultOpen?: boolean;
}) {
  const title = departure ? "Edit departure" : "Add departure dates";
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const Icon = departure ? Pencil : CalendarPlus;
  return (
    <Dialog.Root open={open} onOpenChange={setOpen} disablePointerDismissal>
      <Dialog.Trigger className={departure ? "btn-outline" : "btn-primary"}><Icon size={16} aria-hidden />{departure ? "Edit" : "Add dates"}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="admin-drawer-backdrop" />
        <Dialog.Popup className="admin-studio admin-drawer">
          <header className="admin-drawer-header">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="admin-icon-button" aria-label="Close departure form"><X size={18} /></Dialog.Close>
          </header>
          <DepartureFields packages={packages} selected={selected} departure={departure}
            unavailable={unavailable} minDate={minDate} returnTo={returnTo} title={title} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DepartureFields({ packages, selected, departure, unavailable, minDate, returnTo, title }: {
  packages: PackageOption[];
  selected?: PackageOption;
  departure?: TourDeparture;
  unavailable: { tourSlug: string; startDate: string }[];
  minDate: string;
  returnTo: string;
  title: string;
}) {
  const [tour, setTour] = useState(selected);
  const [dates, setDates] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const errorText = useRef<HTMLParagraphElement>(null);

  function reportError(message: string) {
    setError(message);
    requestAnimationFrame(() => errorText.current?.focus());
  }

  return (
    <form aria-label={title} className="grid gap-4" onSubmit={(event) => {
      event.preventDefault();
      if (pending) return;
      if (!departure && (!tour || !dates.length)) {
        reportError(tour ? "Choose at least one date." : "Choose a package first.");
        return;
      }
      setError("");
      const data = new FormData(event.currentTarget);
      startTransition(async () => {
        try {
          const result = await saveDepartureAction(data);
          if (result?.error) reportError(result.error);
        } catch {
          reportError("Could not save the departure. Try again.");
        }
      });
    }}>
      <input type="hidden" name="id" value={departure?._id ?? ""} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="tourSlug" value={departure?.tourSlug ?? tour?.slug ?? ""} />
      {selected ? (
        <div className="admin-departure-context"><span className="field-label">Package</span><strong>{selected.title}</strong></div>
      ) : (
        <AdminPackagePicker packages={packages} onSelect={(option) => {
          setTour(option ?? undefined);
          setDates([]);
          setError("");
        }} />
      )}
      {departure ? (
        <label><span className="field-label">Departure date</span>
          <input className="field" type="date" name="startDate" required defaultValue={departure.startDate} />
        </label>
      ) : tour ? (
        <DepartureCalendar key={tour.slug} minDate={minDate}
          unavailable={unavailable.filter((item) => item.tourSlug === tour.slug).map((item) => item.startDate)}
          selected={dates}
          onToggleDate={(date) => {
            setDates((current) => current.includes(date) ? current.filter((item) => item !== date) : [...current, date].sort());
            setError("");
          }}
          onClear={() => setDates([])} />
      ) : null}
      {(tour || departure) && (
        <>
          <div className="grid grid-cols-2 gap-3" key={tour?.slug}>
            <label><span className="field-label">Price per person (₹)</span>
              <input className="field" type="number" name="price" min="1" required defaultValue={departure?.price ?? tour?.price} />
            </label>
            <label><span className="field-label">Seats per date</span>
              <input className="field" type="number" name="capacity" min="1" required defaultValue={departure?.capacity ?? 20} />
            </label>
          </div>
          <label><span className="field-label">Note <span className="font-normal">(optional)</span></span>
            <input className="field" name="note" defaultValue={departure?.note ?? ""} />
          </label>
        </>
      )}
      {error && <p ref={errorText} tabIndex={-1} className="text-sm text-red-700" role="alert">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2 border-t border-stone-200 pt-3">
        <Dialog.Close className="btn-outline">Cancel</Dialog.Close>
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Saving…" : departure ? "Save changes" : dates.length ? `Add ${dates.length} ${dates.length === 1 ? "date" : "dates"}` : "Add dates"}</button>
      </div>
    </form>
  );
}
