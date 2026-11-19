"use client";

import type { ReactNode } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";

export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  trigger?: ReactNode;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialog.Trigger render={<span />}>{trigger}</AlertDialog.Trigger> : null}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="admin-confirm-backdrop" />
        <AlertDialog.Popup className="admin-studio admin-confirm-popup">
          <AlertDialog.Title className="admin-confirm-title">{title}</AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="admin-confirm-description">{description}</AlertDialog.Description>
          ) : null}
          <div className="admin-confirm-actions">
            <AlertDialog.Close className="btn-outline">{cancelLabel}</AlertDialog.Close>
            <button
              type="button"
              className={destructive ? "btn-danger" : "btn-primary"}
              onClick={() => {
                onOpenChange(false);
                onConfirm();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
