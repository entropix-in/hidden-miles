"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";

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
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <form
        ref={formRef}
        action={action}
        onSubmit={(event) => {
          if (confirmedRef.current) {
            confirmedRef.current = false;
            return;
          }
          event.preventDefault();
          setOpen(true);
        }}
      >
        <input type="hidden" name="id" value={id} />
        {fields
          ? Object.entries(fields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))
          : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={compact ? "btn-outline admin-icon-button admin-button-danger" : "btn-outline admin-button-danger"}
          aria-label={compact ? label : undefined}
          title={compact ? label : undefined}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {!compact && label}
        </button>
      </form>
      <AdminConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`${label}?`}
        description={confirmText}
        confirmLabel={label}
        destructive
        onConfirm={() => {
          confirmedRef.current = true;
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
