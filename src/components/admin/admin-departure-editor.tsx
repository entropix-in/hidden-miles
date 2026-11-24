"use client";

import { clearFieldErrors, showFieldError, validateFields } from "./admin-field-errors";
import { useRef, useState, useTransition } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarPlus, Pencil, X } from "lucide-react";
import { saveDepartureAction } from "@/app/admin/actions";
import type { TourDeparture } from "@/lib/types";
import { AdminDeparturePackage, type DeparturePackage } from "./admin-departure-package";
import { AdminPackagePicker } from "./admin-package-picker";
import { DepartureCalendar } from "./departure-calendar";

export function AdminDepartureEditor({ packages, selected, departure, unavailable, minDate, returnTo, defaultOpen, triggerLabel }: {
  packages: DeparturePackage[];
  selected?: DeparturePackage;
  departure?: TourDeparture;
  unavailable: { tourSlug: string; startDate: string }[];
  minDate: string;
  returnTo: string;
  defaultOpen?: boolean;
  triggerLabel?: string;
}) {
  const title = departure ? "Edit departure" : "Add departure dates";
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const Icon = departure ? Pencil : CalendarPlus;
  return (
    <Dialog.Root open={open} onOpenChange={setOpen} disablePointerDismissal>
      <Dialog.Trigger className={departure ? "btn-outline" : "btn-primary"}><Icon size={16} aria-hidden />{triggerLabel ?? (departure ? "Edit" : "Add dates")}</Dialog.Trigger>
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
  packages: DeparturePackage[];
  selected?: DeparturePackage;
  departure?: TourDeparture;
  unavailable: { tourSlug: string; startDate: string }[];
  minDate: string;
  returnTo: string;
  title: string;
}) {
  const [tour, setTour] = useState(selected);
  const [dates, setDates] = useState<string[]>(departure ? [departure.startDate] : []);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const errorText = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function reportError(message: string, field?: string) {
    const form = formRef.current;
    if (form && field && showFieldError(form, field, message)) {
      setError("");
      return;
    }
    setError(message);
    requestAnimationFrame(() => {
      errorText.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      errorText.current?.focus({ preventScroll: true });
    });
  }

  return (
    <form ref={formRef} noValidate aria-label={title} className="grid gap-4" onSubmit={(event) => {
      event.preventDefault();
      if (pending) return;
      const form = event.currentTarget;
      setError("");
      clearFieldErrors(form);
      if (!tour && !departure) return reportError("Choose a package first.", "tourSlug");
      if (!dates.length) return reportError("Choose at least one date.", "startDate");
      if (!validateFields(form)) return;
      const data = new FormData(form);
      startTransition(async () => {
        try {
          const result = await saveDepartureAction(data);
          if (result?.error) reportError(result.error, result.field);
        } catch {
          reportError("Could not save the departure. Try again.");
        }
      });
    }}>
      <input type="hidden" name="id" value={departure?._id ?? ""} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="tourSlug" value={departure?.tourSlug ?? tour?.slug ?? ""} />
      {!selected && !departure && (
        <div data-field="tourSlug" data-required>
          <AdminPackagePicker packages={packages} onSelect={(option) => {
            setTour(packages.find((item) => item.slug === option?.slug));
            setDates([]);
            setError("");
          }} />
        </div>
      )}
      {tour && <div className="admin-departure-context"><span className="field-label">Package</span>
        <AdminDeparturePackage tour={tour} details showPrice />
      </div>}
      {(tour || departure) && (
        <div data-field="startDate" data-required>
        <DepartureCalendar key={tour?.slug ?? departure?.tourSlug} today={minDate} minDate={departure ? undefined : minDate}
          multiple={!departure} selected={dates}
          unavailable={unavailable.filter((item) =>
            item.tourSlug === (tour?.slug ?? departure?.tourSlug) && item.startDate !== departure?.startDate).map((item) => item.startDate)}
          onSelect={(date) => {
            setDates((current) => departure ? [date]
              : current.includes(date) ? current.filter((item) => item !== date) : [...current, date].sort());
            setError("");
          }}
          onRemove={(date) => setDates((current) => current.filter((item) => item !== date))} />
        </div>
      )}
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
