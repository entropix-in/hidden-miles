"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Package, Search } from "lucide-react";
import { saveDiscountAction } from "@/app/admin/actions";
import { AdminAuthoringForm } from "./admin-authoring-form";
import { AdminCheckbox } from "./admin-checkbox";
import { AdminSelect } from "./admin-select";
import type { AdminDiscount } from "@/lib/types";
import { cn, formatINR, imageUrl } from "@/lib/utils";

export type DiscountPackageOption = { id: string; title: string; destinationName: string; image: string; price: number };

function PackageChooser({ packages, initial }: { packages: DiscountPackageOption[]; initial: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial.filter((id) => packages.some((tour) => tour.id === id)));
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return packages.filter((tour) => !search || `${tour.title} ${tour.destinationName}`.toLowerCase().includes(search));
  }, [packages, query]);

  function toggle(id: string, on: boolean) {
    setSelected((current) => (on ? [...new Set([...current, id])] : current.filter((item) => item !== id)));
  }

  return (
    <div className="mt-4" data-field="tourIds">
      {selected.map((id) => <input key={id} type="hidden" name="tourIds" value={id} />)}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="min-w-[220px] flex-1">
          <span className="field-label">Find packages</span>
          <span className="admin-search-field"><Search size={16} aria-hidden />
            <input className="field" type="search" value={query} placeholder="Name or destination"
              onChange={(event) => setQuery(event.target.value)} />
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="admin-editor-help">{selected.length} of {packages.length} selected</span>
          <button type="button" className="btn-outline" onClick={() => setSelected((current) => [...new Set([...current, ...visible.map((tour) => tour.id)])])}>
            Select shown
          </button>
          <button type="button" className="admin-text-action" disabled={!selected.length} onClick={() => setSelected([])}>Clear</button>
        </div>
      </div>
      <div className="mt-3 grid max-h-[26rem] gap-2 overflow-y-auto sm:grid-cols-2">
        {visible.map((tour) => {
          const on = selected.includes(tour.id);
          return (
            <button key={tour.id} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(tour.id, !on)}
              className={cn("flex items-center gap-3 rounded-xl border p-2.5 text-left transition",
                on ? "border-(--studio-pine) bg-(--studio-pine-wash)" : "border-stone-200 bg-white hover:border-stone-300")}>
              <span className="relative grid h-11 w-14 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-sand-200 text-stone-500">
                {tour.image ? <Image src={imageUrl(tour.image, 160)} alt="" fill sizes="56px" className="object-cover" /> : <Package size={16} aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-(--studio-text)">{tour.title}</span>
                <span className="block truncate text-sm text-stone-500">{tour.destinationName} · {formatINR(tour.price)}</span>
              </span>
              <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                on ? "border-(--studio-pine) bg-(--studio-pine) text-white" : "border-stone-300 bg-white")} aria-hidden>
                {on && <Check size={12} strokeWidth={2.75} />}
              </span>
            </button>
          );
        })}
        {!visible.length && <p className="admin-editor-help">No packages match your search.</p>}
      </div>
    </div>
  );
}

export function AdminDiscountForm({ discount, packages }: { discount?: AdminDiscount; packages: DiscountPackageOption[] }) {
  const [kind, setKind] = useState(discount?.kind ?? "percent");
  const [scope, setScope] = useState(discount?.scope ?? "all");
  const [automatic, setAutomatic] = useState(discount ? !discount.code : false);

  return (
    <AdminAuthoringForm action={saveDiscountAction} requiresCover={false} label="Discount"
      submitLabel={discount ? "Save changes" : "Create discount"}
      cancel={<Link href="/admin/discounts" className="btn-outline">Cancel</Link>}>
      <input type="hidden" name="id" value={discount?._id ?? ""} />

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">Discount details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="field-label">Name</label>
            <input id="name" name="name" required maxLength={120} defaultValue={discount?.name ?? ""}
              placeholder="Early bird 2027" className="field" />
            <p className="admin-field-hint">Shown to travellers in the price summary.</p>
          </div>
          <div>
            <span className="field-label">How it applies</span>
            <div className="flex flex-wrap gap-2">
              <AdminCheckbox label="Automatically, no code needed" variant="option" checked={automatic}
                onCheckedChange={setAutomatic} />
            </div>
          </div>
          {!automatic && (
            <div>
              <label htmlFor="code" className="field-label">Promo code</label>
              <input id="code" name="code" required maxLength={40} defaultValue={discount?.code ?? ""}
                placeholder="EARLYBIRD" className="field uppercase" autoCapitalize="characters" />
              <p className="admin-field-hint">Letters, numbers, hyphens. Not case-sensitive.</p>
            </div>
          )}
          <div className={automatic ? "" : "sm:col-start-2"}>
            <span className="field-label">Status</span>
            <AdminCheckbox name="active" label="Active" variant="option" defaultChecked={discount?.active ?? true} />
          </div>
        </div>
      </section>

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">Value</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="field-label">Type</span>
            <AdminSelect name="kind" value={kind} onValueChange={(value) => setKind(value === "fixed" ? "fixed" : "percent")}>
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
            </AdminSelect>
          </label>
          <div>
            <label htmlFor="value" className="field-label">{kind === "percent" ? "Percent off" : "Amount off (₹)"}</label>
            <input id="value" name="value" type="number" required min="1" max={kind === "percent" ? 100 : undefined}
              defaultValue={discount?.value ?? ""} className="field" />
            <p className="admin-field-hint">{kind === "percent" ? "Taken off the trip fare." : "Taken off once per booking."}</p>
          </div>
          {kind === "percent" && (
            <div>
              <label htmlFor="maxAmount" className="field-label">Maximum saving (₹)</label>
              <input id="maxAmount" name="maxAmount" type="number" min="1" defaultValue={discount?.maxAmount ?? ""} className="field" />
              <p className="admin-field-hint">Optional cap per booking.</p>
            </div>
          )}
        </div>
        <p className="admin-editor-help mt-3">Discounts apply to the trip fare, before add-ons and GST. A booking gets the single best discount available.</p>
      </section>

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">Packages</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label">Applies to</span>
            <AdminSelect name="scope" value={scope} onValueChange={(value) => setScope(value === "selected" ? "selected" : "all")}>
              <option value="all">All packages</option>
              <option value="selected">Selected packages</option>
            </AdminSelect>
          </label>
        </div>
        {scope === "selected" && <PackageChooser packages={packages} initial={discount?.tourIds ?? []} />}
      </section>

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">Limits</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="startsOn" className="field-label">Starts on</label>
            <input id="startsOn" name="startsOn" type="date" defaultValue={discount?.startsOn ?? ""} className="field" />
            <p className="admin-field-hint">Blank starts now.</p>
          </div>
          <div>
            <label htmlFor="endsOn" className="field-label">Ends on</label>
            <input id="endsOn" name="endsOn" type="date" defaultValue={discount?.endsOn ?? ""} className="field" />
            <p className="admin-field-hint">Blank never ends.</p>
          </div>
          <div>
            <label htmlFor="minTravellers" className="field-label">Minimum travellers</label>
            <input id="minTravellers" name="minTravellers" type="number" min="1" defaultValue={discount?.minTravellers ?? 1} className="field" />
            <p className="admin-field-hint">Use for group offers.</p>
          </div>
          <div>
            <label htmlFor="usageLimit" className="field-label">Usage limit</label>
            <input id="usageLimit" name="usageLimit" type="number" min="1" defaultValue={discount?.usageLimit ?? ""} className="field" />
            <p className="admin-field-hint">Bookings allowed. Blank is unlimited.</p>
          </div>
        </div>
      </section>
    </AdminAuthoringForm>
  );
}
