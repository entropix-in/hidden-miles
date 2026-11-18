"use client";

import { createContext, useRef, useState, useTransition, type ReactNode } from "react";
import { Save } from "lucide-react";

export const UploadActivity = createContext<(change: number) => void>(() => {});

export function AdminAuthoringForm({
  action, children, cancel,
}: {
  action: (data: FormData) => Promise<{ error: string }>;
  children: ReactNode;
  cancel: ReactNode;
}) {
  const uploads = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <UploadActivity.Provider value={(change) => {
      uploads.current += change;
      setUploading(uploads.current > 0);
    }}>
      <form className="admin-authoring-form space-y-4" onSubmit={(event) => {
        event.preventDefault();
        if (uploads.current || pending) return;
        const data = new FormData(event.currentTarget);
        if (!data.get("image")) {
          setError("Upload a cover photo before saving.");
          event.currentTarget.querySelector<HTMLInputElement>("[data-cover-photo] input")?.focus();
          return;
        }
        setError("");
        startTransition(async () => {
          try {
            const result = await action(data);
            setError(result.error);
          } catch {
            setError("Saving failed. Try again.");
          }
        });
      }}>
        {children}
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
          {error && <p role="alert" className="mb-3 font-medium text-red-700">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {cancel}
            <button type="submit" className="btn-primary" disabled={uploading || pending}>
              <Save size={16} aria-hidden />
              {pending ? "Saving…" : uploading ? "Uploading photos…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </UploadActivity.Provider>
  );
}
