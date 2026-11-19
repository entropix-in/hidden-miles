"use client";

import { useId, useRef, useState } from "react";
import { plainTextEditorState } from "@/lib/rich-fields";
import { ChevronDown, Images, Plus, Trash2 } from "lucide-react";
import type { ItineraryDay } from "@/data/tours";
import type { ContentBlock, GalleryPhoto } from "@/lib/content-blocks";
import { getItineraryBadges } from "@/lib/itinerary";
import { RichTextBlock } from "./admin-content-editor";
import { AdminGalleryEditor } from "./admin-gallery-editor";
import { AdminItineraryBadges } from "./admin-itinerary-badges";

type DayDraft = ItineraryDay & { key: string };

function ItineraryDayCard({ day, open, onToggle, onUpdate, onRemove }: {
  day: DayDraft;
  open: boolean;
  onToggle: () => void;
  onUpdate: (update: (day: DayDraft) => DayDraft) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const text = day.contentBlocks?.find((block) => block.type === "text");
  const photos = day.contentBlocks?.find((block) => block.type === "gallery")?.photos ?? [];
  const [galleryOpen, setGalleryOpen] = useState(photos.length > 0);
  const [initialText] = useState(() => text?.editor ?? plainTextEditorState(day.description));
  const editor = text?.editor ?? initialText;
  const blocks: ContentBlock[] = [
    ...(editor ? [{ type: "text" as const, editor }] : []),
    ...(photos.length ? [{ type: "gallery" as const, photos }] : []),
  ];
  const automatic = !day.manualBadges && !day.badges?.length;
  const badges = getItineraryBadges(day);

  function updatePhotos(change: (photos: GalleryPhoto[]) => GalleryPhoto[]) {
    onUpdate((current) => {
      const contentBlocks = current.contentBlocks ?? [];
      const previous = contentBlocks.find((block) => block.type === "gallery")?.photos ?? [];
      return { ...current, contentBlocks: [
        ...contentBlocks.filter((block) => block.type !== "gallery"),
        { type: "gallery", photos: change(previous) },
      ] };
    });
  }

  return (
    <li className="admin-itinerary-day" data-open={open || undefined}>
      <input type="hidden" name="itineraryDay" value={day.day} />
      <input type="hidden" name="itineraryTitle" value={day.title} />
      <input type="hidden" name="itineraryContent" value={JSON.stringify(blocks)} />
      <input type="hidden" name="itineraryBadges" value={automatic ? "" : JSON.stringify(badges)} />
      <h3>
        <button type="button" className="admin-day-toggle" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span className="admin-day-number">Day {day.day}</span>
          <span className="admin-day-title">{day.title || "Untitled day"}</span>
          <ChevronDown size={17} aria-hidden />
        </button>
      </h3>
      <div id={id} hidden={!open}>
        <div className="admin-day-body">
          <div>
            <label className="field-label" htmlFor={id + "-title"}>Day title</label>
            <input className="field" id={id + "-title"} value={day.title} maxLength={190}
              placeholder="e.g. Arrival in Srinagar"
              onChange={(event) => {
                const title = event.target.value;
                onUpdate((current) => ({ ...current, title }));
              }} />
          </div>
          <div>
            <span className="field-label">Description</span>
            <div className="admin-day-editor">
              <RichTextBlock compact value={editor} label={`Day ${day.day} description`}
                onChange={(value, description) => onUpdate((current) => ({
                  ...current, description,
                  contentBlocks: [{ type: "text", editor: value }, ...(current.contentBlocks ?? []).filter((block) => block.type !== "text")],
                }))} />
            </div>
          </div>
          <AdminItineraryBadges badges={day.title || day.description || !automatic ? badges : []} automatic={automatic}
            onChange={(next) => onUpdate((current) => ({ ...current, badges: next, manualBadges: Boolean(next) }))} />
          {galleryOpen ? (
            <AdminGalleryEditor photos={photos} onChange={updatePhotos} label={`Day ${day.day} photos`} />
          ) : (
            <div><button type="button" className="btn-outline" onClick={() => setGalleryOpen(true)}>
              <Images size={16} aria-hidden /> Add photo gallery
            </button></div>
          )}
          <div>
            <button type="button" className="admin-text-action admin-button-danger"
              aria-label={`Remove day ${day.day}`} onClick={onRemove}>
              <Trash2 size={15} aria-hidden /> Remove day
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function AdminItineraryEditor({ initialDays = [] }: { initialDays?: ItineraryDay[] }) {
  const id = useId();
  const nextId = useRef(Math.max(initialDays.length, 1));
  const [days, setDays] = useState<DayDraft[]>(() =>
    (initialDays.length ? initialDays : [{ day: 1, title: "", description: "" }])
      .map((day, index) => ({ ...day, key: `${id}-${index}` })));
  const [open, setOpen] = useState<string | null>(`${id}-0`);

  function addDay() {
    const key = `${id}-${nextId.current++}`;
    setDays((current) => [...current, { key, day: (current.at(-1)?.day ?? 0) + 1, title: "", description: "" }]);
    setOpen(key);
    requestAnimationFrame(() =>
      document.querySelector<HTMLInputElement>("[data-itinerary] [data-open] input:not([type=hidden])")?.focus());
  }

  return (
    <section className="admin-form-panel" data-itinerary>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Itinerary</h2>
        <button type="button" className="btn-outline" onClick={addDay}>
          <Plus size={16} aria-hidden /> Add day
        </button>
      </div>
      {days.length ? (
        <ol className="admin-itinerary-days">
          {days.map((day) => (
            <ItineraryDayCard key={day.key} day={day} open={open === day.key}
              onToggle={() => setOpen(open === day.key ? null : day.key)}
              onUpdate={(update) => setDays((current) => current.map((item) => item.key === day.key ? update(item) : item))}
              onRemove={() => {
                const remaining = days.filter((item) => item.key !== day.key)
                  .map((item, index) => ({ ...item, day: index + 1 }));
                setDays(remaining);
                setOpen(remaining.find((item) => item.day === day.day)?.key ?? remaining.at(-1)?.key ?? null);
              }} />
          ))}
        </ol>
      ) : <p className="admin-editor-help mt-3">No days yet. Add a day to start the itinerary.</p>}
    </section>
  );
}
