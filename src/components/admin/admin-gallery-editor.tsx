"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import type { GalleryColumns, GalleryDisplay, GalleryPhoto } from "@/lib/content-blocks";
import { AdminPhotoUpload } from "./admin-photo-upload";
import { AdminSelect } from "./admin-select";

export type GalleryLayout = { columns: GalleryColumns; display: GalleryDisplay };

export function AdminGalleryEditor({ photos, onChange, label = "Gallery photos", layout, onLayoutChange }: {
  photos: GalleryPhoto[];
  onChange: (update: (photos: GalleryPhoto[]) => GalleryPhoto[]) => void;
  label?: string;
  layout?: GalleryLayout;
  onLayoutChange?: (layout: GalleryLayout) => void;
}) {
  return (
    <div className="admin-gallery-editor">
      {layout && onLayoutChange && (
        <div className="admin-gallery-layout">
          <div className="admin-gallery-select">
            <AdminSelect aria-label="Gallery layout" value={layout.columns} menuMinWidth={160}
              onValueChange={(value) => onLayoutChange({ ...layout, columns: Number(value) as GalleryColumns })}>
              <option value={1}>Full width</option>
              <option value={2}>2 per row</option>
              <option value={3}>3 per row</option>
              <option value={4}>4 per row</option>
            </AdminSelect>
          </div>
          <div className="admin-gallery-select">
            <AdminSelect aria-label="Gallery style" value={layout.display} menuMinWidth={160}
              onValueChange={(value) => onLayoutChange({ ...layout, display: value as GalleryDisplay })}>
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
            </AdminSelect>
          </div>
        </div>
      )}
      {photos.length > 0 && (
        <ul className="admin-gallery-grid" aria-label={label}>
          {photos.map((photo, index) => (
            <li key={`${photo.url}-${index}`} className="admin-gallery-photo">
              <div className="admin-gallery-thumb">
                <Image src={photo.url} alt="" fill sizes="12rem" unoptimized />
                <span className="admin-gallery-index">{index + 1}</span>
                <button className="admin-gallery-remove" type="button" title="Remove photo"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => onChange((current) => current.filter((_, position) => position !== index))}>
                  <Trash2 size={14} />
                </button>
              </div>
              <input className="field" value={photo.alt} maxLength={250} placeholder="Describe this photo"
                aria-label={`Description for photo ${index + 1}`}
                onChange={(event) => {
                  const alt = event.target.value;
                  onChange((current) => current.map((item, position) =>
                    position === index ? { ...item, alt } : item));
                }} />
            </li>
          ))}
        </ul>
      )}
      <div className="admin-gallery-upload">
        <AdminPhotoUpload label={photos.length ? `Add more photos · ${photos.length}/16` : label}
          multiple disabled={photos.length >= 16}
          onUpload={(urls) => onChange((current) =>
            [...current, ...urls.map((url) => ({ url, alt: "" }))].slice(0, 16))} />
      </div>
    </div>
  );
}
