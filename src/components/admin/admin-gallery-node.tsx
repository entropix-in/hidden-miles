"use client";

import type { JSX } from "react";
import { Trash2 } from "lucide-react";
import {
  $createParagraphNode, $getNodeByKey, $getRoot, $getSelection, $isRangeSelection, DecoratorNode,
  type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { GalleryBlock, GalleryColumns, GalleryDisplay, GalleryPhoto } from "@/lib/content-blocks";
import { AdminGalleryEditor } from "./admin-gallery-editor";

export type SerializedGalleryNode = Spread<{
  photos: GalleryPhoto[];
  columns: GalleryColumns;
  display: GalleryDisplay;
}, SerializedLexicalNode>;

/** A photo gallery embedded in the page content editor. Saved as its own gallery block. */
export class GalleryNode extends DecoratorNode<JSX.Element> {
  __photos: GalleryPhoto[];
  __columns: GalleryColumns;
  __display: GalleryDisplay;

  static getType() { return "gallery"; }

  static clone(node: GalleryNode) {
    return new GalleryNode(node.__photos, node.__columns, node.__display, node.__key);
  }

  static importJSON(json: SerializedGalleryNode) {
    return $createGalleryNode({ type: "gallery", photos: json.photos, columns: json.columns, display: json.display });
  }

  constructor(photos: GalleryPhoto[] = [], columns: GalleryColumns = 3, display: GalleryDisplay = "grid", key?: NodeKey) {
    super(key);
    this.__photos = photos;
    this.__columns = columns;
    this.__display = display;
  }

  exportJSON(): SerializedGalleryNode {
    return { ...super.exportJSON(), photos: this.__photos, columns: this.__columns, display: this.__display };
  }

  createDOM() {
    const div = document.createElement("div");
    div.className = "admin-editor-gallery";
    div.contentEditable = "false";
    return div;
  }

  updateDOM() { return false; }

  isInline() { return false; }

  isKeyboardSelectable() { return false; }

  getTextContent() { return ""; }

  setGallery(change: Partial<Pick<GalleryBlock, "photos" | "columns" | "display">>) {
    const writable = this.getWritable();
    if (change.photos) writable.__photos = change.photos;
    if (change.columns) writable.__columns = change.columns;
    if (change.display) writable.__display = change.display;
  }

  decorate() {
    return <GalleryComponent nodeKey={this.__key} photos={this.__photos}
      columns={this.__columns} display={this.__display} />;
  }
}

export function $createGalleryNode(block?: GalleryBlock) {
  return new GalleryNode(block?.photos ?? [], block?.columns ?? 3, block?.display ?? "grid");
}

export function $isGalleryNode(node: LexicalNode | null | undefined): node is GalleryNode {
  return node instanceof GalleryNode;
}

/** Inserts a gallery after the block holding the cursor (or at the end), followed by a paragraph to keep typing in. */
export function $insertGallery() {
  const gallery = $createGalleryNode();
  const selection = $getSelection();
  const anchor = $isRangeSelection(selection) ? selection.anchor.getNode().getTopLevelElement() : null;
  const root = $getRoot();
  if (anchor && !(anchor.getTextContent() === "" && anchor.getType() === "paragraph")) anchor.insertAfter(gallery);
  else if (anchor) anchor.replace(gallery);
  else root.append(gallery);
  const next = gallery.getNextSibling() ?? gallery.insertAfter($createParagraphNode());
  next.selectStart();
}

function GalleryComponent({ nodeKey, photos, columns, display }: {
  nodeKey: NodeKey;
  photos: GalleryPhoto[];
  columns: GalleryColumns;
  display: GalleryDisplay;
}) {
  const [editor] = useLexicalComposerContext();
  const change = (update: (node: GalleryNode) => void) => editor.update(() => {
    const node = $getNodeByKey(nodeKey);
    if ($isGalleryNode(node)) update(node);
  });

  return (
    <div className="admin-editor-gallery-card">
      <div className="admin-block-header">
        <span className="admin-block-title">Photo gallery</span>
        <div className="admin-block-actions">
          <button type="button" className="admin-button-danger" title="Remove gallery" aria-label="Remove photo gallery"
            onClick={() => change((node) => node.remove())}><Trash2 size={16} /></button>
        </div>
      </div>
      <AdminGalleryEditor photos={photos} layout={{ columns, display }}
        onChange={(update) => change((node) => node.setGallery({ photos: update(node.__photos) }))}
        onLayoutChange={(layout) => change((node) => node.setGallery(layout))} />
    </div>
  );
}
