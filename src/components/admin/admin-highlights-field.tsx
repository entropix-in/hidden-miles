"use client";

import { useId, useRef, useState, type RefObject } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Draft = { id: number; text: string };

function SortableHighlight({ item, index, focusIdRef, onChange, onRemove }: {
  item: Draft;
  index: number;
  focusIdRef: RefObject<number | null>;
  onChange: (text: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li ref={setNodeRef} className="admin-highlight-row" data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}>
      <button type="button" ref={setActivatorNodeRef} className="admin-icon-button admin-drag-handle"
        {...attributes} {...listeners} title="Drag to reorder"
        aria-label={`Drag highlight ${index + 1} to reorder`}><GripVertical size={15} aria-hidden /></button>
      <label className="admin-highlight-input">
        <span className="sr-only">Highlight {index + 1}</span>
        <input name="highlights" className="field" value={item.text}
          ref={(input) => {
            if (input && focusIdRef.current === item.id) {
              focusIdRef.current = null;
              input.focus();
            }
          }}
          onChange={(event) => onChange(event.target.value)} />
      </label>
      <div className="admin-highlight-actions">
        <button type="button" className="admin-icon-button admin-button-danger" title="Remove highlight"
          aria-label={`Remove highlight ${index + 1}`} onClick={onRemove}><Trash2 size={15} aria-hidden /></button>
      </div>
    </li>
  );
}

export function AdminHighlightsField({ initial = [] }: { initial?: string[] }) {
  const dndId = useId();
  const [items, setItems] = useState<Draft[]>(() => initial.map((text, id) => ({
    id, text: text.replace(/\r?\n/g, " "),
  })));
  const nextId = useRef(initial.length);
  const focusIdRef = useRef<number | null>(null);
  const add = useRef<HTMLButtonElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <fieldset className="admin-highlights-field">
      <legend className="field-label">Highlights</legend>
      {items.length ? (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;
            setItems((current) => arrayMove(
              current,
              current.findIndex((item) => item.id === active.id),
              current.findIndex((item) => item.id === over.id),
            ));
          }}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <ol className="admin-highlight-list">
              {items.map((item, index) => (
                <SortableHighlight key={item.id} item={item} index={index}
                  focusIdRef={focusIdRef}
                  onChange={(text) => setItems((current) => current.map((entry) =>
                    entry.id === item.id ? { ...entry, text } : entry))}
                  onRemove={() => {
                    setItems((current) => current.filter((entry) => entry.id !== item.id));
                    add.current?.focus();
                  }} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      ) : <p className="admin-editor-help">No highlights yet.</p>}
      <button ref={add} type="button" className="btn-outline" onClick={() => {
        const id = nextId.current++;
        focusIdRef.current = id;
        setItems((current) => [...current, { id, text: "" }]);
      }}><Plus size={15} aria-hidden /> Add highlight</button>
    </fieldset>
  );
}
