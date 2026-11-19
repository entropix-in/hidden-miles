"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export function AdminHighlightsField({ initial = [] }: { initial?: string[] }) {
  const [items, setItems] = useState(() => initial.map((text, id) => ({
    id, text: text.replace(/\r?\n/g, " "),
  })));
  const nextId = useRef(initial.length);
  const focusId = useRef<number | null>(null);
  const add = useRef<HTMLButtonElement>(null);

  function move(index: number, offset: number) {
    setItems((current) => {
      const reordered = [...current];
      [reordered[index], reordered[index + offset]] = [reordered[index + offset], reordered[index]];
      return reordered;
    });
  }

  return (
    <fieldset className="admin-highlights-field">
      <legend className="field-label">Highlights</legend>
      {items.length ? (
        <ol className="admin-highlight-list">
          {items.map((item, index) => (
            <li key={item.id} className="admin-highlight-row">
              <label className="admin-highlight-input">
                <span className="sr-only">Highlight {index + 1}</span>
                <input name="highlights" className="field" value={item.text}
                  ref={(input) => {
                    if (input && focusId.current === item.id) {
                      focusId.current = null;
                      input.focus();
                    }
                  }}
                  onChange={(event) => {
                    const text = event.target.value;
                    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, text } : entry));
                  }} />
              </label>
              <div className="admin-highlight-actions">
                <button type="button" className="admin-icon-button" title="Move up"
                  aria-label={`Move highlight ${index + 1} up`} disabled={index === 0}
                  onClick={() => move(index, -1)}><ArrowUp size={15} aria-hidden /></button>
                <button type="button" className="admin-icon-button" title="Move down"
                  aria-label={`Move highlight ${index + 1} down`} disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}><ArrowDown size={15} aria-hidden /></button>
                <button type="button" className="admin-icon-button admin-button-danger" title="Remove highlight"
                  aria-label={`Remove highlight ${index + 1}`} onClick={() => {
                    setItems((current) => current.filter((entry) => entry.id !== item.id));
                    add.current?.focus();
                  }}><Trash2 size={15} aria-hidden /></button>
              </div>
            </li>
          ))}
        </ol>
      ) : <p className="admin-editor-help">No highlights yet.</p>}
      <button ref={add} type="button" className="btn-outline" onClick={() => {
        const id = nextId.current++;
        focusId.current = id;
        setItems((current) => [...current, { id, text: "" }]);
      }}><Plus size={15} aria-hidden /> Add highlight</button>
    </fieldset>
  );
}
