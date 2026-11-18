"use client";

import { useContext, useId, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { UploadActivity } from "./admin-authoring-form";
import { photoLimit } from "@/lib/media-path";

export function AdminPhotoUpload({
  label, value, onUpload, multiple = false, disabled = false,
}: {
  label: string;
  value?: string;
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const noteUpload = useContext(UploadActivity);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: File[]) {
    noteUpload(1);
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of files.slice(0, 16)) {
        if (file.size > photoLimit) throw new Error(`${file.name} exceeds 8 MB.`);
        const response = await fetch("/api/admin/media", { method: "POST", body: file });
        if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
          throw new Error("Photo upload failed. Try again.");
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        urls.push(result.url);
      }
      onUpload(urls);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Photo upload failed. Try again.");
    } finally {
      noteUpload(-1);
      setBusy(false);
    }
  }

  return (
    <div className="admin-photo">
      {value && <Image src={value} alt="Current cover photo" width={144} height={96} className="admin-photo-preview" unoptimized />}
      <div className="min-w-0">
        <label className="field-label" htmlFor={id}>{label}</label>
        <div className="admin-photo-control">
          <ImagePlus aria-hidden size={16} />
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heif,image/heic,image/gif"
            multiple={multiple}
            disabled={disabled || busy}
            aria-describedby={`${id}-help`}
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = "";
              if (files.length) void upload(files);
            }}
          />
        </div>
        <p id={`${id}-help`} className="admin-editor-help">Up to 8 MB per photo.</p>
        <p role="status" className="admin-editor-help">{busy ? "Uploading…" : ""}</p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}

export function CoverPhotoField({ initialValue }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue ?? "");
  return (
    <div data-cover-photo>
      <input type="hidden" name="image" value={value} />
      <AdminPhotoUpload label="Cover photo" value={value} onUpload={([url]) => setValue(url)} />
    </div>
  );
}
