"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { Bold, GripVertical, Heading, Images, Italic, List, ListChecks, ListOrdered, Pilcrow, Quote, Redo2, Underline, Undo2 } from "lucide-react";
import {
  $createParagraphNode, $getRoot, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND,
  REDO_COMMAND, UNDO_COMMAND, type SerializedEditorState,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
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
import { isContentLink, type ContentBlock } from "@/lib/content-blocks";
import { AdminEditorLink } from "./admin-editor-link";
import { $insertGallery, GalleryNode, type SerializedGalleryNode } from "./admin-gallery-node";

function EditorToolbar({ compact, gallery }: { compact: boolean; gallery: boolean }) {
  const [editor] = useLexicalComposerContext();
  const [active, setActive] = useState<string[]>([]);
  useEffect(() => editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const selection = $getSelection();
      const formats = ["bold", "italic", "underline"] as const;
      const next = $isRangeSelection(selection) ? formats.filter((format) => selection.hasFormat(format)) : [];
      setActive((current) => current.join() === next.join() ? current : next);
    });
  }), [editor]);

  const formatting = [
    ["Bold", Bold, "bold"],
    ["Italic", Italic, "italic"],
    ["Underline", Underline, "underline"],
  ] as const;
  const blocks = [
    ["Paragraph", Pilcrow, () => editor.update(() => $setBlocksType($getSelection(), $createParagraphNode))],
    ["Heading", Heading, () => editor.update(() => $setBlocksType($getSelection(), () => $createHeadingNode("h3")))],
    ["Quote", Quote, () => editor.update(() => $setBlocksType($getSelection(), $createQuoteNode))],
    ["Bullets", List, () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)],
    ["Numbered list", ListOrdered, () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)],
    ["Checklist", ListChecks, () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)],
  ] as const;
  const history = [
    ["Undo", Undo2, () => editor.dispatchCommand(UNDO_COMMAND, undefined)],
    ["Redo", Redo2, () => editor.dispatchCommand(REDO_COMMAND, undefined)],
  ] as const;

  function withSelection(action: () => void) {
    if (editor.getEditorState().read(() => $isRangeSelection($getSelection()))) action();
    else editor.focus(action);
  }

  return (
    <div className="admin-editor-toolbar" role="group" aria-label="Text formatting">
      {formatting.map(([label, Icon, format]) => (
        <button key={label} type="button" title={label} aria-label={label}
          aria-pressed={active.includes(format)} onMouseDown={(event) => event.preventDefault()}
          onClick={() => withSelection(() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format))}>
          <Icon size={17} aria-hidden />
        </button>
      ))}
      <AdminEditorLink />
      {!compact && blocks.map(([label, Icon, action]) => (
        <button key={label} type="button" title={label} aria-label={label}
          onMouseDown={(event) => event.preventDefault()} onClick={() => withSelection(action)}>
          <Icon size={17} aria-hidden />
        </button>
      ))}
      {gallery && (
        <button type="button" title="Insert photo gallery" aria-label="Insert photo gallery"
          onMouseDown={(event) => event.preventDefault()} onClick={() => editor.update($insertGallery)}>
          <Images size={17} aria-hidden />
        </button>
      )}
      {history.map(([label, Icon, action]) => (
        <button key={label} type="button" title={label} aria-label={label}
          onMouseDown={(event) => event.preventDefault()} onClick={action}>
          <Icon size={17} aria-hidden />
        </button>
      ))}
    </div>
  );
}

function hasText(node: { text?: string; children?: readonly object[] }) {
  return Boolean(node.text) || Boolean(node.children?.some(hasText));
}

/** Drag handle beside each top-level block (paragraphs, lists, galleries) for reordering. */
function BlockDragPlugin({ anchor }: { anchor: HTMLElement }) {
  const menuRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  return (
    <DraggableBlockPlugin_EXPERIMENTAL anchorElem={anchor} menuRef={menuRef} targetLineRef={lineRef}
      isOnMenu={(element) => Boolean(element.closest(".admin-drag-menu"))}
      menuComponent={
        <button ref={menuRef} type="button" className="admin-drag-menu" aria-label="Drag to reorder" title="Drag to reorder">
          <GripVertical size={16} aria-hidden />
        </button>
      }
      targetLineComponent={<div ref={lineRef} className="admin-drag-line" />} />
  );
}

export function RichTextBlock({ value, onChange, label, compact = false, gallery = false }: {
  value: SerializedEditorState | null;
  onChange: (value: SerializedEditorState, text: string) => void;
  label: string;
  compact?: boolean;
  /** Allow embedding photo galleries in the document. */
  gallery?: boolean;
}) {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  return (
    <LexicalComposer initialConfig={{
      namespace: "HiddenMilesContent",
      nodes: gallery ? [...contentNodes, GalleryNode] : contentNodes,
      theme: { text: { bold: "font-medium", italic: "italic", underline: "underline" }, list: { listitemChecked: "admin-check-checked", listitemUnchecked: "admin-check-unchecked" } },
      onError: (error) => { throw error; },
      editorState: value ? JSON.stringify(value) : undefined,
    }}>
      <EditorToolbar compact={compact} gallery={gallery} />
      <div className="admin-editor-area" ref={setAnchor} data-draggable={gallery || undefined}>
        <RichTextPlugin contentEditable={<ContentEditable aria-label={label} className="admin-editor-input" />}
          ErrorBoundary={LexicalErrorBoundary} />
        {(!value || !(hasText(value.root) || value.root.children.some((node) => node.type === "gallery"))) && (
          <span className="admin-editor-placeholder" aria-hidden>Start writing…</span>
        )}
      </div>
      {gallery && anchor && <BlockDragPlugin anchor={anchor} />}
      <HistoryPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <LinkPlugin validateUrl={isContentLink} />
      <OnChangePlugin ignoreSelectionChange ignoreHistoryMergeTagChange={false}
        onChange={(state) => onChange(state.toJSON(), state.read(() => $getRoot().getTextContent()))} />
    </LexicalComposer>
  );
}

type SerializedNode = SerializedEditorState["root"]["children"][number];

/** Merges stored blocks into one editor document; galleries become embedded gallery nodes. */
export function blocksToState(blocks: ContentBlock[]): SerializedEditorState | null {
  if (!blocks.length) return null;
  const textRoot = blocks.find((block) => block.type === "text")?.editor.root;
  const children = blocks.flatMap((block): SerializedNode[] => block.type === "text"
    ? block.editor.root.children
    : [{ type: "gallery", version: 1, photos: block.photos, columns: block.columns ?? 3, display: block.display ?? "grid" } as SerializedNode]);
  return { root: { ...(textRoot ?? { type: "root", version: 1, direction: null, format: "", indent: 0 }), children } } as SerializedEditorState;
}

/** Splits the editor document back into text and gallery blocks for storage. */
export function stateToBlocks(state: SerializedEditorState): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let run: SerializedNode[] = [];
  const flush = () => {
    if (run.length) blocks.push({ type: "text", editor: { root: { ...state.root, children: run } } });
    run = [];
  };
  for (const node of state.root.children) {
    if (node.type === "gallery") {
      flush();
      const gallery = node as unknown as SerializedGalleryNode;
      if (gallery.photos.length) blocks.push({ type: "gallery", photos: gallery.photos, columns: gallery.columns, display: gallery.display });
    } else run.push(node);
  }
  flush();
  return blocks;
}

export function AdminContentEditor({ initialBlocks = [] }: { initialBlocks?: ContentBlock[] }) {
  const id = useId();
  const [initialState] = useState(() => blocksToState(initialBlocks));
  const [state, setState] = useState(initialState);
  const [blocks, setBlocks] = useState(initialBlocks);

  return (
    <section className="admin-content-editor" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-medium text-(--studio-text)">Page content</h2>
      <input type="hidden" name="contentBlocks" value={JSON.stringify(blocks)} />
      <div className="admin-block">
        <RichTextBlock value={state} label="Page content" gallery
          onChange={(next) => { setState(next); setBlocks(stateToBlocks(next)); }} />
      </div>
    </section>
  );
}
