"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Bold, Copy, GripVertical, Heading, Images, Italic, Layers, List, ListChecks, ListOrdered, Pilcrow, Quote, Redo2, Trash2, Underline, Undo2 } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { isContentLink, type ContentBlock } from "@/lib/content-blocks";
import { AdminEditorLink } from "./admin-editor-link";
import { AdminGalleryEditor } from "./admin-gallery-editor";

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

function EditorToolbar({ compact }: { compact: boolean }) {
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

export function RichTextBlock({ value, onChange, label, compact = false }: {
  value: SerializedEditorState | null;
  onChange: (value: SerializedEditorState, text: string) => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <LexicalComposer initialConfig={{
      namespace: "HiddenMilesContent",
      nodes: contentNodes,
      theme: { text: { bold: "font-bold", italic: "italic", underline: "underline" }, list: { listitemChecked: "admin-check-checked", listitemUnchecked: "admin-check-unchecked" } },
      onError: (error) => { throw error; },
      editorState: value ? JSON.stringify(value) : undefined,
    }}>
      <EditorToolbar compact={compact} />
      <div className="admin-editor-area">
        <RichTextPlugin contentEditable={<ContentEditable aria-label={label} className="admin-editor-input" />}
          ErrorBoundary={LexicalErrorBoundary} />
        {(!value || !hasText(value.root)) && (
          <span className="admin-editor-placeholder" aria-hidden>Start writing…</span>
        )}
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <LinkPlugin validateUrl={isContentLink} />
      <OnChangePlugin ignoreSelectionChange ignoreHistoryMergeTagChange={false}
        onChange={(state) => onChange(state.toJSON(), state.read(() => $getRoot().getTextContent()))} />
    </LexicalComposer>
  );
}

const blockOptions = [
  { label: "Rich text", icon: Pilcrow, type: "text" },
  { label: "Heading", icon: Heading, type: "text", template: "heading" },
  { label: "Quote", icon: Quote, type: "text", template: "quote" },
  { label: "Bulleted list", icon: List, type: "text", template: "bullet" },
  { label: "Numbered list", icon: ListOrdered, type: "text", template: "number" },
  { label: "Checklist", icon: ListChecks, type: "text", template: "check" },
  { label: "Gallery", icon: Images, type: "gallery" },
] as const;

function SortableBlock({ id, label, actions, children }: {
  id: string;
  label: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} className="admin-block" data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}>
      <div className="admin-block-header">
        <div className="admin-block-title">
          <button type="button" ref={setActivatorNodeRef} className="admin-icon-button admin-drag-handle"
            {...attributes} {...listeners} aria-label={`Reorder ${label} block`} title="Drag to reorder">
            <GripVertical size={17} aria-hidden />
          </button>
          <span>{label}</span>
        </div>
        <div className="admin-block-actions">{actions}</div>
      </div>
      {children}
    </li>
  );
}

export function AdminContentEditor({ initialBlocks = [] }: { initialBlocks?: ContentBlock[] }) {
  const id = useId();
  const [blocks, setBlocks] = useState<DraftBlock[]>(() =>
    initialBlocks.map((block, index) => ({ ...block, id: `${id}-${index}` })));
  const nextId = useRef(initialBlocks.length);
  const [announcement, setAnnouncement] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function update(block: DraftBlock) {
    setBlocks((current) => current.map((item) => item.id === block.id ? block : item));
  }

  function move(index: number, target: number) {
    if (index === target || index < 0 || target < 0 || target >= blocks.length) return;
    setBlocks((current) => arrayMove(current, index, target));
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
      <h2 id={`${id}-title`} className="font-semibold text-navy-950">Page content</h2>
      <input type="hidden" name="contentBlocks" value={JSON.stringify(blocks.flatMap(({ id: blockId, ...block }) => {
        void blockId;
        return block.type === "text" && !block.editor ? [] : [block];
      }))} />
      <div className="sr-only" role="status">{announcement}</div>
      {!blocks.length && (
        <div className="admin-content-empty">
          <Layers size={21} aria-hidden />
          <div><strong>No content blocks yet</strong><p>Choose a block below to start building this page.</p></div>
        </div>
      )}
      <DndContext id={id} sensors={sensors} collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over) return;
          move(blocks.findIndex((block) => block.id === active.id), blocks.findIndex((block) => block.id === over.id));
        }}>
      <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
      <ol className="admin-blocks">
        {blocks.map((block, index) => {
          const label = block.type === "text" ? textBlockLabel(block.editor) : "Photo gallery";
          return (
            <SortableBlock key={block.id} id={block.id} label={label} actions={<>
                  <button type="button" title="Move up" aria-label={`Move ${label} block ${index + 1} up`}
                    disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp size={16} /></button>
                  <button type="button" title="Move down" aria-label={`Move ${label} block ${index + 1} down`}
                    disabled={index === blocks.length - 1} onClick={() => move(index, index + 1)}><ArrowDown size={16} /></button>
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
              </>}>
              {block.type === "text" ? (
                <RichTextBlock value={block.editor} label={`Rich text block ${index + 1}`}
                  onChange={(editor) => update({ ...block, editor })} />
              ) : (
                <AdminGalleryEditor photos={block.photos} onChange={(change) =>
                  setBlocks((current) => current.map((item) =>
                    item.id === block.id && item.type === "gallery"
                      ? { ...item, photos: change(item.photos) } : item))} />
              )}
            </SortableBlock>
          );
        })}
      </ol>
      </SortableContext>
      </DndContext>
      <div className="admin-editor-add" role="group" aria-label="Add content block">
        {blockOptions.map((option) => (
          <button key={option.label} type="button" className="btn-outline" disabled={blocks.length >= 40}
            onClick={() => addBlock(option.type, "template" in option ? option.template : undefined)}>
            <option.icon size={16} aria-hidden /> {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
