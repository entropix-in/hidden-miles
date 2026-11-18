import type { ReactNode } from "react";
import Image from "next/image";
import { IS_BOLD, IS_CODE, IS_HIGHLIGHT, IS_ITALIC, IS_STRIKETHROUGH, IS_SUBSCRIPT, IS_SUPERSCRIPT, IS_UNDERLINE } from "lexical";
import type { ContentBlock } from "@/lib/content-blocks";
import { mediaPathPattern } from "@/lib/media-path";

type RichNode = {
  type?: string;
  children?: RichNode[];
  text?: string;
  format?: number;
  tag?: string;
  listType?: string;
  start?: number;
  checked?: boolean;
  url?: string;
};

function richNode(node: RichNode, key: number, depth: number): ReactNode {
  if (!node || depth > 20) return null;
  const children = Array.isArray(node.children)
    ? node.children.map((child, index) => richNode(child, index, depth + 1))
    : null;

  switch (node.type) {
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": {
      const Tag = node.tag === "h4" ? "h4" : "h3";
      return <Tag key={key}>{children}</Tag>;
    }
    case "quote": return <blockquote key={key}>{children}</blockquote>;
    case "list":
      return node.listType === "number"
        ? <ol key={key} start={Number.isInteger(node.start) ? node.start : 1}>{children}</ol>
        : <ul key={key} className={node.listType === "check" ? "content-checklist" : undefined}>{children}</ul>;
    case "listitem":
      return <li key={key}>
        {typeof node.checked === "boolean" && <>
          <span aria-hidden="true">{node.checked ? "✓" : "○"}</span>
          <span className="sr-only">{node.checked ? "Checked: " : "Unchecked: "}</span>
        </>}
        {children}
      </li>;
    case "link":
      return typeof node.url === "string" && /^(https?:\/\/|mailto:|tel:|\/(?![\\/]))/i.test(node.url)
        ? <a key={key} href={node.url}>{children}</a> : <span key={key}>{children}</span>;
    case "linebreak": return <br key={key} />;
    case "tab":
    case "text": {
      if (typeof node.text !== "string") return null;
      const format = typeof node.format === "number" ? node.format : 0;
      let text: ReactNode = node.text;
      if (format & IS_BOLD) text = <strong>{text}</strong>;
      if (format & IS_ITALIC) text = <em>{text}</em>;
      if (format & IS_STRIKETHROUGH) text = <s>{text}</s>;
      if (format & IS_UNDERLINE) text = <u>{text}</u>;
      if (format & IS_CODE) text = <code>{text}</code>;
      if (format & IS_SUBSCRIPT) text = <sub>{text}</sub>;
      if (format & IS_SUPERSCRIPT) text = <sup>{text}</sup>;
      if (format & IS_HIGHLIGHT) text = <mark>{text}</mark>;
      return <span key={key}>{text}</span>;
    }
    default: return null;
  }
}

export function PageContentBlocks({ blocks }: { blocks?: ContentBlock[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="page-content-blocks">
      {blocks.map((block, index) => block.type === "text"
        ? <div className="page-rich-text" key={index}>
            {block.editor.root.children.map((node, position) => richNode(node, position, 0))}
          </div>
        : <div className="page-content-gallery" key={index}>
            {block.photos.filter((photo) => mediaPathPattern.test(photo.url)).map((photo, position) => (
              <Image key={position} src={photo.url} alt={photo.alt} width={640} height={480}
                sizes="(min-width: 640px) 40vw, 90vw" />
            ))}
          </div>)}
    </div>
  );
}
