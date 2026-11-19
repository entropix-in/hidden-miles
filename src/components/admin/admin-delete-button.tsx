"use client";

import { Trash2 } from "lucide-react";

export function AdminDeleteButton({
  action,
  id,
  confirmText = "Delete this item? This cannot be undone.",
  label = "Delete",
  fields,
  compact = false,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmText?: string;
  label?: string;
  fields?: Record<string, string>;
  compact?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {fields
        ? Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <button
        type="submit"
        className={compact ? "btn-outline admin-icon-button admin-button-danger" : "btn-outline admin-button-danger"}
        aria-label={compact ? label : undefined}
        title={compact ? label : undefined}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {!compact && label}
      </button>
    </form>
  );
}
