"use client";

import { createContext, useRef, useState, useTransition, type ReactNode } from "react";
import { Save } from "lucide-react";
import type { ActionResult } from "@/lib/field-error";
import { clearFieldErrors, showFieldError, validateFields } from "./admin-field-errors";

export const UploadActivity = createContext<(change: number) => void>(() => {});

export function AdminAuthoringForm({
  action, children, cancel, label, submitLabel = "Save changes",
}: {
  action: (data: FormData) => Promise<ActionResult>;
  children: ReactNode;
  cancel: ReactNode;
  label?: string;
  submitLabel?: string;
}) {
  const uploads = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function reportError(message: string, field?: string) {
    const form = formRef.current;
    if (form && message && field && showFieldError(form, field, message)) {
      setError("");
      return;
    }
    setError(message);
    if (message) requestAnimationFrame(() => {
      errorSummary.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      errorSummary.current?.focus({ preventScroll: true });
    });
  }

  return (
    <UploadActivity.Provider value={(change) => {
      uploads.current += change;
      setUploading(uploads.current > 0);
    }}>
      <form ref={formRef} noValidate aria-label={label} className="admin-authoring-form space-y-4" onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (uploads.current || pending) return;
        const form = event.currentTarget;
        setError("");
        if (!validateFields(form)) return;
        const data = new FormData(form);
        if (!data.get("image")) {
          showFieldError(form, "image", "Upload a cover photo before saving.");
          return;
        }
        clearFieldErrors(form);
        startTransition(async () => {
          try {
            const result = await action(data);
            reportError(result.error, result.field);
          } catch {
            reportError("Saving failed. Try again.");
          }
        });
      }}>
        {children}
        <div className="admin-form-footer">
          {error && <p ref={errorSummary} role="alert" tabIndex={-1} className="mb-3 font-medium text-red-700">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {cancel}
            <button type="submit" className="btn-primary" disabled={uploading || pending}>
              <Save size={16} aria-hidden />
              {pending ? "Saving…" : uploading ? "Uploading photos…" : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </UploadActivity.Provider>
  );
}
