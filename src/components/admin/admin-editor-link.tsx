"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Link2 } from "lucide-react";
import { $createTextNode, $getRoot, $getSelection, $isRangeSelection, $setSelection, type RangeSelection } from "lexical";
import { $createLinkNode, $isLinkNode, $toggleLink } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { isContentLink } from "@/lib/content-blocks";

export function AdminEditorLink() {
  const [editor] = useLexicalComposerContext();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const selection = useRef<RangeSelection | null>(null);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [existing, setExisting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const range = $getSelection();
      if ($isRangeSelection(range)) selection.current = range.clone();
    });
  }), [editor]);

  function apply(remove = false) {
    const address = url.trim();
    if (!remove && !isContentLink(address)) {
      setError("Enter a valid link, such as https://example.com.");
      input.current?.focus();
      return;
    }
    editor.update(() => {
      if (selection.current) $setSelection(selection.current.clone());
      const range = $getSelection();
      if (remove || existing || ($isRangeSelection(range) && !range.isCollapsed())) {
        $toggleLink(remove ? null : address);
        return;
      }
      const link = $createLinkNode(address).append($createTextNode(address));
      if ($isRangeSelection(range)) range.insertNodes([link]);
      else {
        const end = $getRoot().selectEnd();
        end.insertNodes([link]);
      }
    }, { discrete: true });
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={(next) => {
      if (next) {
        const currentUrl = editor.getEditorState().read(() => {
          const range = $getSelection();
          if ($isRangeSelection(range)) selection.current = range.clone();
          const node = selection.current?.anchor.getNode();
          const link = $isLinkNode(node) ? node : node?.getParent();
          return $isLinkNode(link) ? link.getURL() : "";
        });
        setExisting(Boolean(currentUrl));
        setUrl(currentUrl);
        setError("");
      }
      setOpen(next);
    }}>
      <Popover.Trigger type="button" title="Add or edit link" aria-label="Add or edit link"
        onMouseDown={(event) => event.preventDefault()}>
        <Link2 size={17} aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} className="admin-editor-positioner">
          <Popover.Popup className="admin-studio admin-editor-popover" initialFocus={input}>
            <label className="field-label" htmlFor={id}>Link URL</label>
            <input ref={input} id={id} className="field" value={url} placeholder="https://example.com"
              autoCapitalize="none" inputMode="url" spellCheck={false} aria-invalid={Boolean(error)}
              aria-describedby={error ? id + "-error" : undefined}
              onChange={(event) => { setUrl(event.target.value); setError(""); }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  apply();
                }
              }} />
            {error && <p className="admin-editor-help" id={id + "-error"} role="alert">{error}</p>}
            <div className="admin-popover-actions">
              {existing && <button type="button" className="btn-outline" onClick={() => apply(true)}>Remove link</button>}
              <button type="button" className="btn-primary" onClick={() => apply()}>Apply link</button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
