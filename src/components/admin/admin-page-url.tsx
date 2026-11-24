"use client";

import { useId, useRef, useState } from "react";
import { Link2, Pencil } from "lucide-react";
import { slugify } from "@/lib/utils";

function urlEnding(value: string, prefix: string) {
  let path = value.trim();
  if (/^https?:\/\//i.test(path)) {
    try { path = new URL(path).pathname; } catch { return ""; }
  }
  path = path.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  if (path.startsWith(prefix)) path = path.slice(prefix.length);
  if (path.includes("/")) return "";
  try { return slugify(decodeURIComponent(path)); } catch { return ""; }
}

export function AdminPageUrl({ prefix, title, savedSlug }: {
  prefix: string;
  title: string;
  savedSlug?: string;
}) {
  const id = useId();
  const ending = useRef<HTMLInputElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const [override, setOverride] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const slug = override ?? savedSlug ?? slugify(title);
  const proposed = draft === null ? slug : urlEnding(draft, prefix);

  function close(next?: string) {
    if (next !== undefined) setOverride(next);
    setDraft(null);
    setError("");
    requestAnimationFrame(() => editButton.current?.focus());
  }

  function apply() {
    if (!proposed || proposed.length > 190) {
      setError("Enter a URL ending with at least one letter or number and up to 190 characters.");
      ending.current?.focus();
      return;
    }
    close(proposed);
  }

  return (
    <div className="admin-url" data-field="slug">
      <label className="field-label" htmlFor={draft === null ? undefined : id}>Page URL</label>
      {draft !== null ? (
        <div className="admin-url-edit">
          <div className="admin-url-input">
            <input ref={ending} id={id} aria-label="URL ending" className="field" value={draft}
              required maxLength={500} autoCapitalize="none" spellCheck={false} autoFocus
              aria-describedby={id + "-help"} aria-invalid={Boolean(error)}
              onInvalid={() => setError("Enter a URL ending with letters or numbers.")}
              onChange={(event) => {
                const value = event.target.value;
                const next = urlEnding(value, prefix);
                event.target.setCustomValidity(next && next.length <= 190 ? "" : "Enter a valid URL ending.");
                setDraft(value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  apply();
                }
                if (event.key === "Escape") { event.stopPropagation(); close(); }
              }} />
          </div>
          <p id={id + "-help"} className="admin-editor-help" role={error ? "alert" : undefined}>
            {error || (proposed ? prefix + proposed : "Enter an ending or paste the full page URL.")}
          </p>
          <div className="admin-url-actions">
            <button type="button" className="btn-outline" onClick={() => close()}>Cancel</button>
            <button type="button" className="btn-outline" onClick={apply}>Apply URL</button>
          </div>
        </div>
      ) : (
        <div className="admin-url-row">
          <Link2 size={16} aria-hidden />
          <span className="admin-url-path">{slug ? prefix + slug : "Generated from the title"}</span>
          <button ref={editButton} type="button" className="btn-outline" onClick={() => setDraft(slug)}>
            <Pencil size={14} aria-hidden /> Edit URL
          </button>
        </div>
      )}
      <input type="hidden" name="slug" value={proposed || slug} />
    </div>
  );
}
