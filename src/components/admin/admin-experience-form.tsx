"use client";

import { AdminHighlightsField } from "./admin-highlights-field";
import { AdminRichField } from "./admin-rich-fields";
import { useId, useState, type RefObject } from "react";
import { AdminAuthoringForm } from "./admin-authoring-form";
import { AdminContentEditor } from "./admin-content-editor";
import { AdminPageUrl } from "./admin-page-url";
import { CoverPhotoField } from "./admin-photo-upload";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { persistExperienceAction, saveExperienceAction } from "@/app/admin/actions";
import { AdminExperienceIconPicker } from "./admin-experience-icon-picker";
import type { ExperienceOption } from "./admin-tour-experiences";
import type { AdminExperience } from "@/lib/types";

export function AdminExperienceForm({
  experience, onCreate, titleRef,
}: {
  experience?: AdminExperience;
  onCreate?: (experience: ExperienceOption) => void;
  titleRef?: RefObject<HTMLInputElement | null>;
}) {
  const id = useId();
  const [pageTitle, setPageTitle] = useState(experience?.title ?? "");
  return (
    <AdminAuthoringForm label={onCreate ? "New experience" : undefined}
      submitLabel={experience ? "Save changes" : "Create experience"}
      action={onCreate ? async (formData) => {
        const result = await persistExperienceAction(formData);
        if (result.experience) onCreate(result.experience);
        return { error: result.error ?? "" };
      } : saveExperienceAction}
      cancel={onCreate ? <Dialog.Close className="btn-outline">Cancel</Dialog.Close>
        : <Link href="/admin/experiences" className="btn-outline">Cancel</Link>}>
      <input type="hidden" name="id" value={experience?._id ?? ""} />

      <section className={onCreate ? "admin-inline-experience" : "admin-form-panel"}>
        {!onCreate && <h2 className="text-base font-semibold text-navy-950">Experience details</h2>}

        <div className="admin-details-layout">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={id + "-title"} className="field-label">
                Title
              </label>
              <input
                ref={titleRef}
                id={id + "-title"}
                name="title"
                required
                value={pageTitle}
                maxLength={190}
                onChange={(event) => setPageTitle(event.target.value)}
                placeholder="Honeymoons & Celebrations"
                className="field"
              />
            </div>
            <div>
              <label htmlFor={id + "-shortTitle"} className="field-label">
                Short title
              </label>
              <input
                id={id + "-shortTitle"}
                name="shortTitle"
                defaultValue={experience?.shortTitle ?? ""}
                placeholder="Honeymoon"
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminPageUrl prefix="/speciality-tours/" title={pageTitle} savedSlug={experience?.slug} />
            </div>
            <div className="sm:col-span-2">
              <AdminExperienceIconPicker initialIcon={experience?.icon} />
            </div>
            <div className="sm:col-span-2">
              <AdminRichField name="description" label="Short description"
                initial={experience?.description} editor={experience?.richFields?.description} />
            </div>
            {!onCreate && <div className="sm:col-span-2">
              <AdminHighlightsField initial={experience?.highlights} />
            </div>}
          </div>
          <div className="min-w-0">
            <CoverPhotoField initialValue={experience?.image} />
          </div>
        </div>
      </section>

      {!onCreate && <AdminContentEditor initialBlocks={experience?.contentBlocks} />}

    </AdminAuthoringForm>
  );
}
