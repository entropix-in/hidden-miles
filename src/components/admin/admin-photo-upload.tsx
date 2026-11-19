"use client";

import { useContext, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle } from "lucide-react";
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
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const [dragging, setDragging] = useState(false);
  const noteUpload = useContext(UploadActivity);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: File[]) {
    if (!files.length || disabled || inFlight.current) return;
    inFlight.current = true;
    noteUpload(1);
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of files.slice(0, multiple ? 16 : 1)) {
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
      inFlight.current = false;
      noteUpload(-1);
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <div className="admin-photo-zone" data-dragging={dragging || undefined}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          if (!disabled && !busy) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          setDragging(false);
          void upload(Array.from(event.dataTransfer.files));
        }}>
        {value ? (
          <Image src={value} alt="Current cover photo" width={144} height={96} className="admin-photo-preview" unoptimized />
        ) : (
          <span className="admin-photo-symbol"><ImagePlus size={20} aria-hidden /></span>
        )}
        <div className="admin-photo-details">
          <button type="button" className="btn-outline" disabled={disabled || busy}
            aria-describedby={`${id}-help`} onClick={() => input.current?.click()}>
            {busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : <ImagePlus size={16} aria-hidden />}
            {busy ? "Uploading…" : value ? "Replace photo" : multiple ? "Choose photos" : "Choose photo"}
          </button>
          <p id={`${id}-help`} className="admin-editor-help">Or drop {multiple ? "images" : "an image"} here · 8 MB each</p>
          <input ref={input} type="file" hidden aria-labelledby={`${id}-label`}
            accept="image/jpeg,image/png,image/webp,image/avif,image/heif,image/heic,image/gif"
            multiple={multiple} disabled={disabled || busy}
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = "";
              void upload(files);
            }} />
        </div>
      </div>
      <span role="status" className="sr-only">{busy ? "Uploading photos" : ""}</span>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
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
