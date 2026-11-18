import { AdminAuthoringForm } from "./admin-authoring-form";
import { AdminContentEditor } from "./admin-content-editor";
import { CoverPhotoField } from "./admin-photo-upload";
import Link from "next/link";
import { saveDestinationAction } from "@/app/admin/actions";
import { AdminSelect } from "@/components/admin/admin-select";
import type { AdminDestination } from "@/lib/types";

export function AdminDestinationForm({
  destination,
}: {
  destination?: AdminDestination;
}) {
  return (
    <AdminAuthoringForm action={saveDestinationAction} cancel={
      <Link href="/admin/destinations" className="btn-outline">Cancel</Link>
    }>
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
              className="field"
            />
          </div>
          <div>
            <label htmlFor="region" className="field-label">
              Region
            </label>
            <AdminSelect
              id="region"
              name="region"
              defaultValue={destination?.region ?? "India"}
            >
              <option value="India">India</option>
              <option value="International">International</option>
            </AdminSelect>
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
            <CoverPhotoField initialValue={destination?.image} />
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
              Short description
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

      <AdminContentEditor initialBlocks={destination?.contentBlocks} />

    </AdminAuthoringForm>
  );
}
