"use client";

import { useState } from "react";
import type { SerializedEditorState } from "lexical";
import { plainTextEditorState, type RichFields } from "@/lib/rich-fields";
import { RichTextBlock } from "./admin-content-editor";

type RichDraft = { text: string; editor: SerializedEditorState | null };

function RichInputs({ name, values }: { name: keyof RichFields; values: RichDraft[] }) {
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
  const [value, setValue] = useState<RichDraft>(() => ({ text: initial ?? "", editor: editor ?? plainTextEditorState(initial ?? "") }));
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
