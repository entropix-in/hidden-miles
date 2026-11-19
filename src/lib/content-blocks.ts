import { $getRoot, createEditor, type SerializedEditorState } from "lexical";
import { contentNodes } from "./lexical-content";
import { mediaPathPattern } from "./media-path";

export type GalleryPhoto = { url: string; alt: string };
export type ContentBlock =
  | { type: "text"; editor: SerializedEditorState }
  | { type: "gallery"; photos: GalleryPhoto[] };

export function parseContentBlocks(raw: string): ContentBlock[] {
  if (!raw) return [];
  if (raw.length > 200_000) throw new Error("Page content is too long.");

  let blocks: ContentBlock[];
  try {
    blocks = JSON.parse(raw);
  } catch {
    throw new Error("Page content could not be read.");
  }
  if (!Array.isArray(blocks) || blocks.length > 40) {
    throw new Error("Add up to 40 content blocks.");
  }

  const editor = createEditor({ nodes: contentNodes });
  return blocks.flatMap((block): ContentBlock[] => {
    if (block?.type === "text" && block.editor?.root?.type === "root"
      && Array.isArray(block.editor.root.children)) {
      try {
        const state = editor.parseEditorState(block.editor);
        return state.read(() => $getRoot().getTextContent().trim())
          ? [{ type: "text", editor: state.toJSON() }]
          : [];
      } catch {
        throw new Error("A rich text block contains unsupported content.");
      }
    }
    if (block?.type === "gallery" && Array.isArray(block.photos) && block.photos.length <= 16
      && block.photos.every((photo) => typeof photo?.url === "string"
        && mediaPathPattern.test(photo.url) && typeof photo.alt === "string" && photo.alt.length <= 250)) {
      return block.photos.length ? [block] : [];
    }
    throw new Error("Page content includes an invalid block.");
  });
}


export function readContentText(blocks: ContentBlock[]) {
  const editor = createEditor({ nodes: contentNodes });
  return blocks.flatMap((block) => {
    if (block.type !== "text") return [];
    const state = editor.parseEditorState(block.editor);
    return [state.read(() => $getRoot().getTextContent().trim())];
  }).join("\n\n");
}

export function isContentLink(url: string) {
  if (/^\/(?![\\/])/.test(url)) return !/[\\\s]/.test(url);
  if (/^(mailto:|tel:)/i.test(url)) return /^(mailto:|tel:)\S+$/i.test(url);
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    return Boolean(new URL(url).hostname) && !/[\\\s]/.test(url);
  } catch {
    return false;
  }
}
