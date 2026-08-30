"use client";

import type { DocumentBlock } from "@/types/document";

import { useEditorPageIdContext } from "@/context/use-editor-context";
import { useDocumentStore } from "@/store/document/use-document-store";

import { EditableContent } from "../editable-content";

interface CalloutBlockProps {
  block: DocumentBlock;
}

export function CalloutBlock({ block }: CalloutBlockProps) {
  const updateBlockProperties = useDocumentStore(
    (state) => state.updateBlockProperties,
  );
  const pageId = useEditorPageIdContext();
  const addBlock = useDocumentStore((state) => state.addBlock);
  const deleteBlock = useDocumentStore((state) => state.deleteBlock);

  const text = block.properties?.title?.[0]?.text || "";
  const icon = block.properties?.icon || "💡";

  return (
    <div className="my-1 flex w-full items-start gap-3 rounded-lg border border-border bg-muted p-3">
      <span className="cursor-pointer text-xl select-none">{icon}</span>
      <div className="min-w-0 flex-1">
        <EditableContent
          html={text}
          placeholder="Callout text..."
          className="text-base text-foreground"
          onChange={(newText) =>
            updateBlockProperties(block.id, pageId, {
              title: [{ text: newText }],
            })
          }
          onEnter={() =>
            addBlock(block.parentId || "root", block.id, "paragraph")
          }
          onBackspaceEmpty={() => deleteBlock(block.id)}
        />
      </div>
    </div>
  );
}
