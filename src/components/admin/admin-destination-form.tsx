"use client";

import { AdminHighlightsField } from "./admin-highlights-field";
import { AdminRichField } from "./admin-rich-fields";
import { useState } from "react";
import { AdminAuthoringForm } from "./admin-authoring-form";
import { AdminContentEditor } from "./admin-content-editor";
import { AdminPageUrl } from "./admin-page-url";
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
  const [pageTitle, setPageTitle] = useState(destination?.name ?? "");
  return (
    <AdminAuthoringForm submitLabel={destination ? "Save changes" : "Create destination"} action={saveDestinationAction} cancel={
      <Link href="/admin/destinations" className="btn-outline">Cancel</Link>
    }>
      <input type="hidden" name="id" value={destination?._id ?? ""} />

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">
          Destination details
        </h2>

        <div className="admin-details-layout">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                value={pageTitle}
                maxLength={190}
                onChange={(event) => setPageTitle(event.target.value)}
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminPageUrl prefix="/destinations/" title={pageTitle} savedSlug={destination?.slug} />
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
              <AdminRichField name="description" label="Short description"
                initial={destination?.description} editor={destination?.richFields?.description} />
            </div>
            <div className="sm:col-span-2">
              <AdminHighlightsField initial={destination?.highlights} />
            </div>
          </div>
          <div className="min-w-0">
            <CoverPhotoField initialValue={destination?.image} />
          </div>
        </div>
      </section>

      <AdminContentEditor initialBlocks={destination?.contentBlocks} />

    </AdminAuthoringForm>
  );
}
