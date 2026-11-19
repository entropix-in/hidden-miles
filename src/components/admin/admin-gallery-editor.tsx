"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import type { GalleryPhoto } from "@/lib/content-blocks";
import { AdminPhotoUpload } from "./admin-photo-upload";

export function AdminGalleryEditor({ photos, onChange, label = "Gallery photos" }: {
  photos: GalleryPhoto[];
  onChange: (update: (photos: GalleryPhoto[]) => GalleryPhoto[]) => void;
  label?: string;
}) {
  return (
    <div className="admin-gallery-editor">
      <AdminPhotoUpload label={label} multiple disabled={photos.length >= 16}
        onUpload={(urls) => onChange((current) =>
          [...current, ...urls.map((url) => ({ url, alt: "" }))].slice(0, 16))} />
      {photos.map((photo, index) => (
        <div key={`${photo.url}-${index}`} className="admin-gallery-photo">
          <Image src={photo.url} alt="" width={72} height={52} className="admin-photo-preview" unoptimized />
          <label className="field-label">
            Image description
            <input className="field" value={photo.alt} maxLength={250}
              onChange={(event) => {
                const alt = event.target.value;
                onChange((current) => current.map((item, position) =>
                  position === index ? { ...item, alt } : item));
              }} />
          </label>
          <button className="admin-icon-button" type="button" title="Remove photo"
            aria-label={`Remove photo ${index + 1}`}
            onClick={() => onChange((current) => current.filter((_, position) => position !== index))}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
