"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import {
  $createParagraphNode, $getRoot, $getSelection, createEditor, $isRangeSelection, FORMAT_TEXT_COMMAND,
  REDO_COMMAND, UNDO_COMMAND, type SerializedEditorState,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
  $createListItemNode, $createListNode, INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND, type ListType,
} from "@lexical/list";
import { contentNodes } from "@/lib/lexical-content";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { ContentBlock } from "@/lib/content-blocks";
import { AdminPhotoUpload } from "./admin-photo-upload";

type DraftBlock = (ContentBlock | { type: "text"; editor: null }) & { id: string };

const presets = {
  heading: "Heading",
  quote: "Quote",
  bullet: "Bulleted list",
  number: "Numbered list",
  check: "Checklist",
} as const;

type Preset = keyof typeof presets;

function presetState(preset: Preset): SerializedEditorState {
  const editor = createEditor({ nodes: contentNodes });
  editor.update(() => {
    if (preset === "heading" || preset === "quote") {
      $getRoot().append(preset === "heading" ? $createHeadingNode("h3") : $createQuoteNode());
    } else {
      $getRoot().append($createListNode(preset).append($createListItemNode(preset === "check" ? false : undefined)));
    }
  }, { discrete: true });
  return editor.getEditorState().toJSON();
}

function textBlockLabel(value: SerializedEditorState | null) {
  const first = value?.root.children[0] as { type: string; listType?: ListType } | undefined;
  if (first?.type === "list" && first.listType) return presets[first.listType];
  if (first?.type === "heading" || first?.type === "quote") return presets[first.type];
  return "Rich text";
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const buttons = [
    ["Paragraph", () => editor.update(() => $setBlocksType($getSelection(), $createParagraphNode))],
    ["Heading", () => editor.update(() => $setBlocksType($getSelection(), () => $createHeadingNode("h3")))],
    ["Quote", () => editor.update(() => $setBlocksType($getSelection(), $createQuoteNode))],
    ["Bold", () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")],
    ["Italic", () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")],
    ["Bullets", () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)],
    ["Numbered list", () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)],
    ["Checklist", () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)],
    ["Undo", () => editor.dispatchCommand(UNDO_COMMAND, undefined)],
    ["Redo", () => editor.dispatchCommand(REDO_COMMAND, undefined)],
  ] as const;

  return (
    <div className="admin-editor-toolbar" role="group" aria-label="Text formatting">
      {buttons.map(([label, action]) => (
        <button key={label} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => {
          if (!editor.getEditorState().read(() => $isRangeSelection($getSelection())) && !["Undo", "Redo"].includes(label)) {
            editor.focus(action);
          } else {
            action();
          }
        }}>{label}</button>
      ))}
    </div>
  );
}

function RichTextBlock({ value, onChange, label }: {
  value: SerializedEditorState | null;
  onChange: (value: SerializedEditorState) => void;
  label: string;
}) {
  return (
    <LexicalComposer initialConfig={{
      namespace: "HiddenMilesContent",
      nodes: contentNodes,
      theme: { list: { listitemChecked: "admin-check-checked", listitemUnchecked: "admin-check-unchecked" } },
      onError: (error) => { throw error; },
      editorState: value ? JSON.stringify(value) : undefined,
    }}>
      <EditorToolbar />
      <RichTextPlugin contentEditable={<ContentEditable aria-label={label} className="admin-editor-input" />}
        ErrorBoundary={LexicalErrorBoundary} />
      <HistoryPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <LinkPlugin />
      <OnChangePlugin ignoreSelectionChange ignoreHistoryMergeTagChange={false}
        onChange={(state) => onChange(state.toJSON())} />
    </LexicalComposer>
  );
}

export function AdminContentEditor({ initialBlocks = [] }: { initialBlocks?: ContentBlock[] }) {
  const id = useId();
  const [blocks, setBlocks] = useState<DraftBlock[]>(() =>
    initialBlocks.map((block, index) => ({ ...block, id: `${id}-${index}` })));
  const nextId = useRef(initialBlocks.length);
  const [announcement, setAnnouncement] = useState("");
  const [preset, setPreset] = useState<Preset>("heading");

  function update(block: DraftBlock) {
    setBlocks((current) => current.map((item) => item.id === block.id ? block : item));
  }

  function move(index: number, step: number) {
    const target = index + step;
    setBlocks((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setAnnouncement(`Block moved to position ${target + 1}.`);
  }

  function addBlock(type: "text" | "gallery", template?: Preset) {
    const blockId = `${id}-${nextId.current++}`;
    const block: DraftBlock = type === "text"
      ? { type, id: blockId, editor: template ? presetState(template) : null }
      : { type, id: blockId, photos: [] };
    setBlocks((current) => [...current, block]);
    setAnnouncement(`${template ? presets[template] : type === "text" ? "Rich text" : "Photo gallery"} block added.`);
  }

  return (
    <section className="admin-content-editor" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="font-semibold text-navy-950">Page content</h3>
      <p className="admin-editor-help">Add, duplicate or reorder sections for the public details page.</p>
      <input type="hidden" name="contentBlocks" value={JSON.stringify(blocks.flatMap(({ id: blockId, ...block }) => {
        void blockId;
        return block.type === "text" && !block.editor ? [] : [block];
      }))} />
      <div className="sr-only" role="status">{announcement}</div>
      <ol className="admin-blocks">
        {blocks.map((block, index) => {
          const label = block.type === "text" ? textBlockLabel(block.editor) : "Photo gallery";
          return (
            <li key={block.id} className="admin-block">
              <div className="admin-block-header">
                <span>{label}</span>
                <div className="admin-block-actions">
                  <button type="button" title="Move up" aria-label={`Move ${label} block ${index + 1} up`}
                    disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></button>
                  <button type="button" title="Move down" aria-label={`Move ${label} block ${index + 1} down`}
                    disabled={index === blocks.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></button>
                  <button type="button" title="Duplicate block" aria-label={`Duplicate ${label} block ${index + 1}`}
                    disabled={blocks.length >= 40} onClick={() => {
                      const copy = { ...block, id: `${id}-${nextId.current++}` };
                      setBlocks((current) => [...current.slice(0, index + 1), copy, ...current.slice(index + 1)]);
                      setAnnouncement(`${label} block duplicated.`);
                    }}><Copy size={16} /></button>
                  <button type="button" title="Remove block" aria-label={`Remove ${label} block ${index + 1}`}
                    onClick={() => {
                      setBlocks((current) => current.filter((item) => item.id !== block.id));
                      setAnnouncement(`${label} block removed.`);
                    }}><Trash2 size={16} /></button>
                </div>
              </div>
              {block.type === "text" ? (
                <RichTextBlock value={block.editor} label={`Rich text block ${index + 1}`}
                  onChange={(editor) => update({ ...block, editor })} />
              ) : (
                <div className="admin-gallery-editor">
                  <AdminPhotoUpload label="Add gallery photos" multiple disabled={block.photos.length >= 16}
                    onUpload={(urls) => setBlocks((current) => current.map((item) => {
                      if (item.id !== block.id || item.type !== "gallery") return item;
                      return { ...item, photos: [...item.photos, ...urls.map((url) => ({ url, alt: "" }))].slice(0, 16) };
                    }))} />
                  {block.photos.map((photo, photoIndex) => (
                    <div key={`${photo.url}-${photoIndex}`} className="admin-gallery-photo">
                      <Image src={photo.url} alt="" width={72} height={52} className="admin-photo-preview" unoptimized />
                      <label className="field-label">
                        Image description
                        <input className="field" value={photo.alt} maxLength={250}
                          onChange={(event) => update({ ...block, photos: block.photos.map((item, position) =>
                            position === photoIndex ? { ...item, alt: event.target.value } : item) })} />
                      </label>
                      <button type="button" title="Remove photo" aria-label={`Remove photo ${photoIndex + 1}`}
                        onClick={() => update({ ...block, photos: block.photos.filter((_, position) => position !== photoIndex) })}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="admin-editor-add">
        <button type="button" disabled={blocks.length >= 40} onClick={() => addBlock("text")}>
          <Plus size={15} aria-hidden /> Add rich text
        </button>
        <button type="button" disabled={blocks.length >= 40} onClick={() => addBlock("gallery")}>
          <Plus size={15} aria-hidden /> Add gallery
        </button>
        <div className="admin-block-picker">
          <label className="sr-only" htmlFor={`${id}-preset`}>Formatting block type</label>
          <select id={`${id}-preset`} className="field" value={preset}
            onChange={(event) => setPreset(event.target.value as Preset)}>
            {Object.entries(presets).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button type="button" disabled={blocks.length >= 40} onClick={() => addBlock("text", preset)}>
            <Plus size={15} aria-hidden /> Add block
          </button>
        </div>
      </div>
    </section>
  );
}
