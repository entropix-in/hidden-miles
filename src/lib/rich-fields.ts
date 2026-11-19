import { $createParagraphNode, $createTextNode, $getRoot, createEditor, type SerializedEditorState } from "lexical";
import { parseContentBlocks, readContentText } from "./content-blocks";

export type RichFields = {
  description?: SerializedEditorState;
  summary?: SerializedEditorState;
  quote?: SerializedEditorState;
  highlights?: SerializedEditorState[];
  inclusions?: SerializedEditorState[];
  exclusions?: SerializedEditorState[];
};

export function plainTextEditorState(text: string): SerializedEditorState | null {
  if (!text) return null;
  const editor = createEditor();
  editor.update(() => {
    for (const line of text.split(/\r?\n/)) {
      $getRoot().append($createParagraphNode().append($createTextNode(line)));
    }
  }, { discrete: true });
  return editor.getEditorState().toJSON();
}

export function readRichValues(formData: FormData, name: keyof RichFields) {
  return parseContentBlocks(String(formData.get(name + "Rich") ?? "")).flatMap((block) =>
    block.type === "text" ? [{ editor: block.editor, text: readContentText([block]) }] : []);
}
