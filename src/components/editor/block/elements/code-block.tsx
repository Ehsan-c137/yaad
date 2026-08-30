"use client";

import type { DocumentBlock } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { styles } from "@/lib/design-token";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/store/document/use-document-store";

import { EditableContent } from "../editable-content";

interface CodeBlockProps {
  block: DocumentBlock;
}

export function CodeBlock({ block }: CodeBlockProps) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);

  const text = block.properties?.title?.[0]?.text ?? "";
  const language = block.properties?.language ?? "typescript";

  return (
    <div
      className={cn(
        styles.menuDark,
        "my-2 w-full overflow-hidden rounded-lg border border-border font-mono text-sm",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs text-background select-none">
        <select
          value={language}
          onChange={(e) =>
            updateBlockProperties(block.id, pageId, {
              language: e.target.value,
            })
          }
          className="cursor-pointer border-none bg-transparent text-background outline-none"
        >
          <option value="typescript" className="bg-white text-black">
            TypeScript
          </option>
          <option value="javascript" className="bg-white text-black">
            JavaScript
          </option>
          <option value="html" className="bg-white text-black">
            HTML
          </option>
          <option value="css" className="bg-white text-black">
            CSS
          </option>
          <option value="json" className="bg-white text-black">
            JSON
          </option>
          <option value="rust" className="bg-white text-black">
            Rust
          </option>
        </select>
      </div>

      <div className="overflow-x-auto p-3">
        <EditableContent
          html={text}
          placeholder="// Type code here..."
          className="font-mono text-sm/relaxed text-background"
          onChange={(newText: string) =>
            updateBlockProperties(block.id, pageId, {
              title: [{ text: newText }],
            })
          }
          onEnter={() => {
            // TODO: fix it
          }} // Shift+Enter handles multiline inside code
          onBackspaceEmpty={() => deleteBlock(block.id)}
        />
      </div>
    </div>
  );
}
