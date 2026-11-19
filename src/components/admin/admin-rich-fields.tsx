"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import type { SerializedEditorState } from "lexical";
import { plainTextEditorState, type RichFields } from "@/lib/rich-fields";
import { RichTextBlock } from "./admin-content-editor";

type Draft = { text: string; editor: SerializedEditorState | null };

function RichInputs({ name, values }: { name: keyof RichFields; values: Draft[] }) {
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
  const [value, setValue] = useState<Draft>(() => ({ text: initial ?? "", editor: editor ?? plainTextEditorState(initial ?? "") }));
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

export function AdminRichList({ name, label, itemLabel, initial = [], editors }: {
  name: "inclusions" | "exclusions";
  label: string;
  itemLabel: string;
  initial?: string[];
  editors?: SerializedEditorState[];
}) {
  const nextId = useRef(initial.length);
  const [items, setItems] = useState(() => initial.map((text, id) => ({
    id, text, editor: editors?.[id] ?? plainTextEditorState(text),
  })));
  const [active, setActive] = useState<number | null>(null);
  const add = useRef<HTMLButtonElement>(null);

  function move(index: number, offset: number) {
    setItems((current) => {
      const result = [...current];
      [result[index], result[index + offset]] = [result[index + offset], result[index]];
      return result;
    });
  }

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
        <ol>
          {items.map((item, index) => (
            <li key={item.id} data-active={active === item.id || undefined}>
              <button className="admin-rich-item-toggle" type="button" aria-expanded={active === item.id}
                onClick={() => setActive(active === item.id ? null : item.id)}>
                <span className="admin-day-number">{index + 1}</span>
                <span>{item.text || `New ${itemLabel}`}</span>
                <ChevronDown size={15} aria-hidden />
              </button>
              {active === item.id && (
                <div className="admin-rich-item-body">
                  <div className="admin-day-editor">
                    <RichTextBlock compact value={item.editor} label={`${label} item ${index + 1}`}
                      onChange={(editor, text) => setItems((current) =>
                        current.map((entry) => entry.id === item.id ? { ...entry, editor, text } : entry))} />
                  </div>
                  <div className="admin-rich-item-actions">
                    <button type="button" className="admin-icon-button" title="Move up" aria-label={`Move ${itemLabel} up`}
                      disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} /></button>
                    <button type="button" className="admin-icon-button" title="Move down" aria-label={`Move ${itemLabel} down`}
                      disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} /></button>
                    <button type="button" className="admin-icon-button admin-button-danger" title="Remove item"
                      aria-label={`Remove ${itemLabel}`} onClick={() => {
                        setItems((current) => current.filter((entry) => entry.id !== item.id));
                        add.current?.focus();
                      }}><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : <p className="admin-editor-help">No {label.toLowerCase()} yet.</p>}
    </div>
  );
}
