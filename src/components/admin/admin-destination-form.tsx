import Link from "next/link";
import { Save } from "lucide-react";
import { saveDestinationAction } from "@/app/admin/actions";
import type { AdminDestination } from "@/lib/types";

export function AdminDestinationForm({
  destination,
}: {
  destination?: AdminDestination;
}) {
  return (
    <form action={saveDestinationAction} className="space-y-5">
      <input type="hidden" name="id" value={destination?._id ?? ""} />

      <section className="rounded-[28px] border border-stone-200 bg-white p-6">
        <p className="eyebrow">The basics</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950">
          Destination details
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="field-label">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={destination?.name ?? ""}
              placeholder="Kashmir"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="slug" className="field-label">
              URL slug
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={destination?.slug ?? ""}
              placeholder="kashmir"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="region" className="field-label">
              Region
            </label>
            <select
              id="region"
              name="region"
              defaultValue={destination?.region ?? "India"}
              className="field"
            >
              <option value="India">India</option>
              <option value="International">International</option>
            </select>
          </div>
          <div>
            <label htmlFor="bestTime" className="field-label">
              Best time to visit
            </label>
            <input
              id="bestTime"
              name="bestTime"
              defaultValue={destination?.bestTime ?? ""}
              placeholder="March to October"
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="image" className="field-label">
              Cover image URL
            </label>
            <input
              id="image"
              name="image"
              defaultValue={destination?.image ?? ""}
              placeholder="https://images.unsplash.com/..."
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="tagline" className="field-label">
              Tagline
            </label>
            <input
              id="tagline"
              name="tagline"
              defaultValue={destination?.tagline ?? ""}
              placeholder="Shikaras, snow and blue valleys"
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="field-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={destination?.description ?? ""}
              className="field resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="highlights" className="field-label">
              Highlights (one per line)
            </label>
            <textarea
              id="highlights"
              name="highlights"
              rows={5}
              defaultValue={destination?.highlights.join("\n") ?? ""}
              className="field resize-none"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-stone-200 bg-white px-6 py-4">
        <Link href="/admin/destinations" className="btn-outline">
          Cancel
        </Link>
        <button type="submit" className="btn-primary">
          <Save className="h-4 w-4" />
          {destination ? "Save changes" : "Create destination"}
        </button>
      </div>
    </form>
  );
}
