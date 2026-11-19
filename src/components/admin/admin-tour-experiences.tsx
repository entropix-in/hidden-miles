"use client";

import { useState } from "react";
import { AdminCheckbox } from "./admin-checkbox";
import { AdminCreateDrawer } from "./admin-create-drawer";
import { AdminExperienceForm } from "./admin-experience-form";

export type ExperienceOption = { slug: string; title: string; shortTitle: string };

export function AdminTourExperiences({ options, selected = [] }: {
  options: ExperienceOption[];
  selected?: string[];
}) {
  const [created, setCreated] = useState<ExperienceOption[]>([]);
  const all = [...options.filter((option) => !created.some((item) => item.slug === option.slug)), ...created];
  return (
    <section className="admin-form-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-medium">Experiences included</h2>
        <AdminCreateDrawer entity="experience">
          {({ close, initialFocus }) => (
            <AdminExperienceForm titleRef={initialFocus} onCreate={(option) => {
              setCreated((current) => [...current, option]);
              close();
            }} />
          )}
        </AdminCreateDrawer>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {all.map((experience) => (
          <AdminCheckbox key={experience.slug} name="experiences" value={experience.slug}
            defaultChecked={selected.includes(experience.slug) || created.some((item) => item.slug === experience.slug)}
            label={experience.shortTitle} variant="option" />
        ))}
        {!all.length && (
          <p className="admin-editor-help">No experiences yet. Create one to add it to this package.</p>
        )}
      </div>
    </section>
  );
}
