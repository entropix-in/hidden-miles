"use client";

import { Trash2 } from "lucide-react";

export function AdminDeleteButton({
  action,
  id,
  confirmText = "Delete this item? This cannot be undone.",
  label = "Delete",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmText?: string;
  label?: string;
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
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-wider text-red-700 transition hover:border-red-300 hover:bg-red-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>
    </form>
  );
}
