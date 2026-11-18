import { AdminAuthoringForm } from "./admin-authoring-form";
import { AdminContentEditor } from "./admin-content-editor";
import { CoverPhotoField } from "./admin-photo-upload";
import Link from "next/link";
import { saveExperienceAction } from "@/app/admin/actions";
import { AdminSelect } from "@/components/admin/admin-select";
import type { AdminExperience } from "@/lib/types";

const icons = [
  ["heart", "Heart"],
  ["sparkles", "Sparkles"],
  ["mountain", "Mountain"],
  ["users", "Users"],
  ["crown", "Crown"],
  ["flower", "Flower"],
] as const;

export function AdminExperienceForm({
  experience,
}: {
  experience?: AdminExperience;
}) {
  return (
    <AdminAuthoringForm action={saveExperienceAction} cancel={
      <Link href="/admin/experiences" className="btn-outline">Cancel</Link>
    }>
      <input type="hidden" name="id" value={experience?._id ?? ""} />

      <section className="rounded-[28px] border border-stone-200 bg-white p-6">
        <p className="eyebrow">The basics</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950">
          Experience details
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="field-label">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={experience?.title ?? ""}
              placeholder="Honeymoons & Celebrations"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="shortTitle" className="field-label">
              Short title
            </label>
            <input
              id="shortTitle"
              name="shortTitle"
              defaultValue={experience?.shortTitle ?? ""}
              placeholder="Honeymoon"
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
              defaultValue={experience?.slug ?? ""}
              placeholder="honeymoon"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="icon" className="field-label">
              Icon
            </label>
            <AdminSelect
              id="icon"
              name="icon"
              defaultValue={experience?.icon ?? "sparkles"}
            >
              {icons.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div className="sm:col-span-2">
            <CoverPhotoField initialValue={experience?.image} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="field-label">
              Short description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={experience?.description ?? ""}
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
              defaultValue={experience?.highlights.join("\n") ?? ""}
              className="field resize-none"
            />
          </div>
        </div>
      </section>

      <AdminContentEditor initialBlocks={experience?.contentBlocks} />

    </AdminAuthoringForm>
  );
}
