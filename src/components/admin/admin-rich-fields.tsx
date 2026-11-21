"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SerializedEditorState } from "lexical";
import { plainTextEditorState, type RichFields } from "@/lib/rich-fields";
import { RichTextBlock } from "./admin-content-editor";

type RichDraft = { text: string; editor: SerializedEditorState | null };
type Draft = RichDraft & { id: number };

function RichInputs({ name, values }: { name: keyof RichFields; values: RichDraft[] }) {
  return (
    <>
      <input type="hidden" name={name} value={values.map((item) => item.text).join("\n")} />
      <input type="hidden" name={name + "Rich"} value={JSON.stringify(values.flatMap((item) =>
        item.editor ? [{ type: "text", editor: item.editor }] : []))} />
    </>
  );
}

export function AdminRichField({ name, label, initial, editor }: {
  name: "description" | "summary" | "quote";
  label: string;
  initial?: string;
  editor?: SerializedEditorState;
}) {
  const [value, setValue] = useState<RichDraft>(() => ({ text: initial ?? "", editor: editor ?? plainTextEditorState(initial ?? "") }));
  return (
    <div className="admin-rich-field">
      <span className="field-label">{label}</span>
      <RichInputs name={name} values={[value]} />
      <div className="admin-day-editor">
        <RichTextBlock compact value={value.editor} label={label}
          onChange={(editor, text) => setValue({ text, editor })} />
      </div>
    </div>
  );
}

function SortableRichItem({ item, index, label, itemLabel, active, onToggle, onChange, onRemove }: {
  item: Draft;
  index: number;
  label: string;
  itemLabel: string;
  active: boolean;
  onToggle: () => void;
  onChange: (editor: SerializedEditorState, text: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li ref={setNodeRef} data-active={active || undefined} data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}>
      <div className="admin-rich-item-header">
        <button type="button" ref={setActivatorNodeRef} className="admin-icon-button admin-drag-handle"
          {...attributes} {...listeners} title="Drag to reorder"
          aria-label={`Drag ${itemLabel} ${index + 1} to reorder`}><GripVertical size={15} aria-hidden /></button>
        <button className="admin-rich-item-toggle" type="button" aria-expanded={active}
          onClick={onToggle}>
          <span className="admin-day-number">{index + 1}</span>
          <span>{item.text || `New ${itemLabel}`}</span>
          <ChevronDown size={15} aria-hidden />
        </button>
      </div>
      {active && (
        <div className="admin-rich-item-body">
          <div className="admin-day-editor">
            <RichTextBlock compact value={item.editor} label={`${label} item ${index + 1}`}
              onChange={onChange} />
          </div>
          <div className="admin-rich-item-actions">
            <button type="button" className="admin-icon-button admin-button-danger" title="Remove item"
              aria-label={`Remove ${itemLabel}`} onClick={onRemove}><Trash2 size={15} /></button>
          </div>
        </div>
      )}
    </li>
  );
}

export function AdminRichList({ name, label, itemLabel, initial = [], editors }: {
  name: "inclusions" | "exclusions";
  label: string;
  itemLabel: string;
  initial?: string[];
  editors?: SerializedEditorState[];
}) {
  const dndId = useId();
  const nextId = useRef(initial.length);
  const [items, setItems] = useState<Draft[]>(() => initial.map((text, id) => ({
    id, text, editor: editors?.[id] ?? plainTextEditorState(text),
  })));
  const [active, setActive] = useState<number | null>(null);
  const add = useRef<HTMLButtonElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div className="admin-rich-list">
      <div className="admin-rich-list-heading">
        <span className="field-label">{label}</span>
        <button ref={add} type="button" className="btn-outline" disabled={items.length >= 40}
          onClick={() => {
            const id = nextId.current++;
            setItems((current) => [...current, { id, text: "", editor: null }]);
            setActive(id);
            requestAnimationFrame(() => add.current?.closest(".admin-rich-list")
              ?.querySelector<HTMLElement>("[data-active] [contenteditable]")?.focus());
          }}><Plus size={15} aria-hidden /> Add {itemLabel}</button>
      </div>
      <RichInputs name={name} values={items} />
      {items.length ? (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter}
          onDragEnd={({ active: dragged, over }) => {
            if (!over || dragged.id === over.id) return;
            setItems((current) => arrayMove(
              current,
              current.findIndex((item) => item.id === dragged.id),
              current.findIndex((item) => item.id === over.id),
            ));
          }}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <ol>
              {items.map((item, index) => (
                <SortableRichItem key={item.id} item={item} index={index}
                  label={label} itemLabel={itemLabel} active={active === item.id}
                  onToggle={() => setActive(active === item.id ? null : item.id)}
                  onChange={(editor, text) => setItems((current) =>
                    current.map((entry) => entry.id === item.id ? { ...entry, editor, text } : entry))}
                  onRemove={() => {
                    setItems((current) => current.filter((entry) => entry.id !== item.id));
                    add.current?.focus();
                  }} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      ) : <p className="admin-editor-help">No {label.toLowerCase()} yet.</p>}
    </div>
  );
}
