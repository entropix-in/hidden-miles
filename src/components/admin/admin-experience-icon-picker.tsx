"use client";

import { useId } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Check } from "lucide-react";
import { ExperienceIcon } from "@/components/site/experience-icon";
import { experienceIconLabels, type Experience } from "@/data/experiences";

const options = Object.entries(experienceIconLabels) as [Experience["icon"], string][];

export function AdminExperienceIconPicker({ initialIcon = "sparkles" }: {
  initialIcon?: Experience["icon"];
}) {
  const id = useId();

  return (
    <div className="min-w-0" data-field="icon" data-required>
      <span className="field-label" id={id}>Icon</span>
      <RadioGroup name="icon" defaultValue={initialIcon} aria-labelledby={id} className="admin-experience-icons">
        {options.map(([icon, label]) => (
          <Radio.Root key={icon} value={icon} className="admin-experience-icon">
            <span aria-hidden="true"><ExperienceIcon icon={icon} /></span>
            <span>{label}</span>
            <Radio.Indicator className="admin-experience-icon-check" aria-hidden="true">
              <Check size={11} strokeWidth={3} />
            </Radio.Indicator>
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  );
}
