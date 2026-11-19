"use client";

import { createContext, useRef, useState, useTransition, type ReactNode } from "react";
import { Save } from "lucide-react";

export const UploadActivity = createContext<(change: number) => void>(() => {});

export function AdminAuthoringForm({
  action, children, cancel, label, submitLabel = "Save changes",
}: {
  action: (data: FormData) => Promise<{ error: string }>;
  children: ReactNode;
  cancel: ReactNode;
  label?: string;
  submitLabel?: string;
}) {
  const uploads = useRef(0);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function reportError(message: string) {
    setError(message);
    if (message) requestAnimationFrame(() => errorSummary.current?.focus());
  }

  return (
    <UploadActivity.Provider value={(change) => {
      uploads.current += change;
      setUploading(uploads.current > 0);
    }}>
      <form aria-label={label} className="admin-authoring-form space-y-4" onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (uploads.current || pending) return;
        const data = new FormData(event.currentTarget);
        if (!data.get("image")) {
          setError("Upload a cover photo before saving.");
          event.currentTarget.querySelector<HTMLButtonElement>("[data-cover-photo] button")?.focus();
          return;
        }
        setError("");
        startTransition(async () => {
          try {
            const result = await action(data);
            reportError(result.error);
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
