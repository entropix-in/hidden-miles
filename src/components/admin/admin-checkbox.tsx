"use client";

import { useId } from "react";
import { Checkbox } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

export function AdminCheckbox({ label, name, value, defaultChecked, variant = "plain" }: {
  label: string;
  name: string;
  value?: string;
  defaultChecked?: boolean;
  variant?: "plain" | "option";
}) {
  const labelId = useId();

  return (
    <Checkbox.Root name={name} value={value} defaultChecked={defaultChecked}
      aria-labelledby={labelId} className="admin-checkbox" data-variant={variant}>
      <span className="admin-checkbox-box" aria-hidden>
        <Checkbox.Indicator className="admin-checkbox-indicator">
          <Check size={12} strokeWidth={2.75} />
        </Checkbox.Indicator>
      </span>
      <span id={labelId}>{label}</span>
    </Checkbox.Root>
  );
}
